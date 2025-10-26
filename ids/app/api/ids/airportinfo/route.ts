import { NextResponse } from 'next/server';
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

const ICAOS = ['KDTW', 'KPIT', 'KBUF', 'KCLE'];


const FLOW_MAP = {
    KDTW: { north: ['3L', '3R', '4L', '4R'], south: ['21L', '21R', '22L', '22R'], west: ['27R', '27L'] },
    KCLE: { north: ['6L', '6R'], south: ['24L', '24R'] },
    KPIT: { east: ['10L', '10C', '10R', '14'], west: ['28L', '28C', '28R', '32'] },
    KBUF: { east: ['5'], west: ['23'] },
};

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

    // Match general runway mentions including ILS/RY/DEPG etc.
    const matches = [...truncated.matchAll(/(?:RWY|ILS|SIMUL ILS Z|SIMUL VISUAL|RUNWAY|DEPG RWY|DEPG RWYS|DEPARTING RUNWAY|ARRIVING RUNWAY|RY)\s?(\d{1,2}[LRC]?)/gi)];

    const runwaysFromMatches: string[] = [];

    for (const m of matches) {
        const idx = m.index ?? 0;
        const after = truncated.slice(idx + m[0].length, idx + m[0].length + 20).toUpperCase(); // check 20 chars after
        if (after.includes('CLSD') || after.includes('CLOSED')) continue; // skip closed runways
        runwaysFromMatches.push(m[1].toUpperCase());
    }

    // Handle "DEPG RWYS 23, 14" style lists, skipping closed runways
    const extraMatches = [...truncated.matchAll(/DEPG RWYS?\s*([\d, ]+)/gi)];
    const runwaysFromExtra: string[] = [];
    for (const m of extraMatches) {
        if (m[1]) {
            const rws = m[1].split(',').map(r => r.trim().toUpperCase()).filter(Boolean);
            for (const r of rws) {
                // Find occurrence and check if CLSD/CLOSED appears nearby
                const idxR = truncated.indexOf(r);
                const after = truncated.slice(idxR + r.length, idxR + r.length + 20).toUpperCase();
                if (after.includes('CLSD') || after.includes('CLOSED')) continue;
                runwaysFromExtra.push(r);
            }
        }
    }

    const runways = [...runwaysFromMatches, ...runwaysFromExtra];
    return [...new Set(runways)];
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

function detectApproachType(text: string): string | null {
    const truncated = truncateAtNotam(text).toUpperCase();
    if (truncated.includes('ILS')) return 'ILS';
    if (truncated.includes('RNAV') || truncated.includes('GPS')) return 'RNAV';
    if (truncated.includes('VISUAL')) return 'VISUAL';
    if (truncated.includes('LOC')) return 'LOC';
    if (truncated.includes('LDA')) return 'LDA';
    if (truncated.includes('VOR')) return 'VOR';
    return null;
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
            const res = await fetch(`https://datis.clowd.io/api/${icao}`);
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
