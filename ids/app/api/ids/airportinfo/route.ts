import { NextResponse } from 'next/server';
import flowMapJson from '@/data/jsons/static/flowMap.json'
import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

type AtisEntry = {
    airport: string;
    type: 'arr' | 'dep' | 'combined';
    code: string;
    datis: string;
    time: string;
    updatedAt: string;
};

type ParsedAtis = {
    airport: string;
    flow: string | null;
    approachType: string | null;
    metar: string | null;
    fullText: string[];
};

type FlowMap = Record<string, Record<string, string[]>>;

const ICAOS = (process.env.ATIS_ICAOS ?? '')
    .split(',')
    .map(i => i.trim().toUpperCase())
    .filter(Boolean);

const FLOW_MAP: FlowMap = flowMapJson;


// --- Helpers ---

function truncateAtNotam(text: string): string {
    const upper = text.toUpperCase();
    const idxNotice = upper.indexOf('NOTICE TO AIRMEN');
    const idxNotams = upper.indexOf('NOTAMS');
    let idx = -1;

    if (idxNotice !== -1 && idxNotams !== -1) idx = Math.min(idxNotice, idxNotams);
    else if (idxNotice !== -1) idx = idxNotice;
    else if (idxNotams !== -1) idx = idxNotams;

    if (idx === -1) return text;
    return text.slice(0, idx);
}

function extractRunways(text: string): string[] {
    const truncated = truncateAtNotam(text);

    // Enhanced patterns for runway extraction
    const patterns = [
        // Primary operational patterns (higher priority)
        /(?:VISUAL APCHS?|APPROACH|APCH)\s+(?:IN USE\s+)?RWY?\s+(\d{1,2}[LRC]?)/gi,
        /(?:ARR EXP|EXPECT).*?RWY?\s+(\d{1,2}[LRC]?)/gi,
        /DEPG RWY?S?\s+(\d{1,2}[LRC]?)/gi,
        /(?:DEPARTING|ARRIVING) RWY?\s+(\d{1,2}[LRC]?)/gi,
        /LAND.*?RWY?\s+(\d{1,2}[LRC]?)/gi,

        // ILS and instrument approach patterns
        /ILS RWY?\s+(\d{1,2}[LRC]?)\s+APCH/gi,
        /SIMUL.*?ILS.*?RWY?\s+(\d{1,2}[LRC]?)/gi,
        /SIMUL APCHS.*?RWY?\s+(\d{1,2}[LRC]?)/gi,

        // DTW-style patterns: "SIMUL ILS Z RY 22R AND RY 21L APCH IN USE"
        /SIMUL\s+ILS\s+[A-Z]\s+RY\s+(\d{1,2}[LRC]?)\s+AND\s+RY\s+(\d{1,2}[LRC]?)\s+APCH\s+IN\s+USE/gi,

        // Simple RY pattern (for DTW style)
        /RY\s+(\d{1,2}[LRC]?)/gi,

        // General runway mentions (lower priority)
        /RWY?\s+(\d{1,2}[LRC]?)/gi,
    ];

    const runwaysFromPatterns: string[] = [];

    for (const pattern of patterns) {
        const matches = [...truncated.matchAll(pattern)];
        for (const m of matches) {
            // Handle multiple capture groups (like the "AND" pattern)
            const captureGroups = m.slice(1).filter(Boolean);

            for (const runway of captureGroups) {
                const runwayCode = runway.toUpperCase();
                const matchStart = m.index ?? 0;
                const matchEnd = matchStart + m[0].length;

                // Check for closed runway indicators in a wider context
                const beforeMatch = truncated.slice(Math.max(0, matchStart - 30), matchStart).toUpperCase();
                const afterMatch = truncated.slice(matchEnd, matchEnd + 30).toUpperCase();
                const contextAround = beforeMatch + ' ' + afterMatch;

                // Skip if runway is marked as closed
                if (contextAround.includes('CLSD') || contextAround.includes('CLOSED') ||
                    contextAround.includes('OTS') || contextAround.includes('OUT OF SERVICE')) {
                    continue;
                }

                // Skip if it's clearly a NOTAM reference and not operational
                const fullMatch = m[0].toUpperCase();
                if (fullMatch.includes('OTS') || fullMatch.includes('PAPI OTS') ||
                    fullMatch.includes('ILS OTS') || fullMatch.includes('RAILS OTS')) {
                    continue;
                }

                runwaysFromPatterns.push(runwayCode);
            }
        }
    }

    // Handle runway lists in approach statements: "SIMUL VIS APCH RWYS 4R, 4L, 36"
    const approachListMatches = [...truncated.matchAll(/(?:SIMUL\s+(?:VIS|VISUAL|ILS)\s+APCH|VISUAL\s+APCHS?|APPROACH)\s+RWY?S?\s+([\d\w\s,]+?)(?:\.|[A-Z]{2,}|$)/gi)];
    const runwaysFromApproachLists: string[] = [];

    for (const m of approachListMatches) {
        if (m[1]) {
            // Split by comma and spaces and extract runway numbers
            const parts = m[1].split(/[,\s]+/).map(p => p.trim().toUpperCase()).filter(Boolean);
            for (const part of parts) {
                // Match runway pattern like 4R, 4L, 36
                const rwMatch = part.match(/^(\d{1,2}[LRC]?)$/);
                if (rwMatch) {
                    runwaysFromApproachLists.push(rwMatch[1]);
                }
            }
        }
    }

    // Handle departure runway lists: "SIMUL DEPS IN USE RY 36L 36C 36R"
    const departureListMatches = [...truncated.matchAll(/(?:SIMUL\s+DEPS|DEPS)\s+IN\s+USE\s+RY\s+((?:\d{1,2}[LRC]?\s*)+)/gi)];
    const runwaysFromDepartureLists: string[] = [];

    for (const m of departureListMatches) {
        if (m[1]) {
            // Split by spaces and extract runway numbers
            const parts = m[1].split(/\s+/).map(p => p.trim().toUpperCase()).filter(Boolean);
            for (const part of parts) {
                // Match runway pattern like 36L, 36C, 36R
                const rwMatch = part.match(/^(\d{1,2}[LRC]?)$/);
                if (rwMatch) {
                    runwaysFromDepartureLists.push(rwMatch[1]);
                }
            }
        }
    }

    // Handle comma-separated runway lists like "DEPG RWYS 36L, 36C, 27"
    const listMatches = [...truncated.matchAll(/DEPG RWY?S?\s+([\d\w\s,;]+?)(?:\.|[A-Z]{2,}|$)/gi)];
    const runwaysFromLists: string[] = [];

    for (const m of listMatches) {
        if (m[1]) {
            // Split by comma, semicolon, and spaces and extract runway numbers
            const parts = m[1].split(/[,;\s]+/).map(p => p.trim().toUpperCase()).filter(Boolean);
            for (const part of parts) {
                // Match runway pattern like 36L, 36C, 27
                const rwMatch = part.match(/^(\d{1,2}[LRC]?)$/);
                if (rwMatch) {
                    runwaysFromLists.push(rwMatch[1]);
                }
            }
        }
    }

    const allRunways = [...runwaysFromPatterns, ...runwaysFromApproachLists, ...runwaysFromDepartureLists, ...runwaysFromLists];
    return [...new Set(allRunways)];
}



function detectApproachType(text: string): string | null {
    const truncated = truncateAtNotam(text).toUpperCase();

    // Look for specific approach types mentioned in operational context
    const approachPatterns = [
        { pattern: /(?:VISUAL APCHS?|VISUAL APCH).*?IN USE/i, type: 'VISUAL' },
        { pattern: /SIMUL\s+VIS\s+APCH/i, type: 'VISUAL' }, // LIT pattern
        { pattern: /(?:APPROACH|APCH).*?IN USE.*?ILS/i, type: 'ILS' },
        { pattern: /ILS RWY?\s+\d{1,2}[LRC]?\s+APCH/i, type: 'ILS' },
        { pattern: /SIMUL\s+ILS.*?APCH\s+IN\s+USE/i, type: 'ILS' }, // DTW pattern
        { pattern: /ARR EXP.*?ILS/i, type: 'ILS' },
        { pattern: /EXPECT.*?ILS/i, type: 'ILS' },
        { pattern: /SIMUL.*?ILS/i, type: 'ILS' },
        { pattern: /(?:RNAV|GPS).*?APCH/i, type: 'RNAV' },
        { pattern: /LOC.*?APCH/i, type: 'LOC' },
        { pattern: /VOR.*?APCH/i, type: 'VOR' },
        { pattern: /LDA.*?APCH/i, type: 'LDA' },
    ];

    // Check patterns in order of priority
    for (const { pattern, type } of approachPatterns) {
        if (pattern.test(truncated)) {
            return type;
        }
    }

    // Fallback to simple keyword detection
    if (truncated.includes('VISUAL APCH') || truncated.includes('VISUAL APCHS') ||
        truncated.includes('VIS APCH')) return 'VISUAL';
    if (truncated.includes('ILS')) return 'ILS';
    if (truncated.includes('RNAV') || truncated.includes('GPS')) return 'RNAV';
    if (truncated.includes('LOC')) return 'LOC';
    if (truncated.includes('LDA')) return 'LDA';
    if (truncated.includes('VOR')) return 'VOR';

    return null;
}



function detectFlow(airport: string, runways: string[]): string | null {
    const flow = FLOW_MAP[airport as keyof typeof FLOW_MAP];
    if (!flow) return null;

    console.log(`[FLOW] Airport: ${airport}`);
    console.log(`[FLOW] Runways detected: ${runways.join(', ')}`);

    const counts: Record<string, number> = {};
    for (const [dir, rwys] of Object.entries(flow)) {
        counts[dir] = runways.filter(r => rwys.includes(r)).length;
    }

    const best = Object.entries(counts).reduce((a, b) => (b[1] > a[1] ? b : a), ['none', 0]);
    console.log(`[FLOW] Best match: ${best[0]} with ${best[1]} runway matches`);

    if (best[1] === 0) return null;
    return `${best[0].toUpperCase()} FLOW`;
}


function extractMetar(text: string): string | null {
    const truncated = truncateAtNotam(text);
    const segments = truncated.split('.');
    if (segments.length < 2) return null;
    return segments[1].trim(); // METAR is after first period
}

function parseAtis(entries: AtisEntry[]): ParsedAtis {
    const airport = entries[0].airport;
    const fullText = entries.map(e => e.datis);
    const joined = fullText.join(' ');

    const runways = extractRunways(joined);
    const flow = detectFlow(airport, runways);
    const approachType = detectApproachType(joined);
    const metar = extractMetar(joined);

    return { airport, flow, approachType, metar, fullText };
}

async function fetchAtis(): Promise<ParsedAtis[]> {
    const results = await Promise.all(
        ICAOS.map(async (icao) => {
            const res = await fetch(`https://atis.info/api/${icao}`);
            if (!res.ok) return null;
            const data: AtisEntry[] = await res.json();
            if (!data?.length) return null;
            return parseAtis(data);
        })
    );
    return results.filter((r): r is ParsedAtis => !!r);
}

// --- Main API route ---

export async function GET() {
    const cached = await redis.get<ParsedAtis[]>('info');

    if (cached) {
        //serve from cache
        return NextResponse.json({ source: 'cache', data: cached });
    }

    try {

        const data = await fetchAtis();
        await redis.set('info', JSON.stringify(data), { ex: 60 });
        return NextResponse.json({ source: 'live', data });

    } catch (err) {
        console.error('ATIS fetch error:', err);
        return NextResponse.json({ error: 'Failed to fetch ATIS' }, { status: 500 });
    }
}
