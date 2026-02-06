
"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Navigation, Sun, Moon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useFlow } from "@/components/query/flowContext";
import waypointsData from "@/data/jsons/static/waypoints.json"

type WaypointData = {
    sid: string;
    type: string;
    gate: string;
    prefRwys: string[];
    rotg: Record<string, string>;
};

type WaypointsJson = {
    memrotg: WaypointData[];
};

type BnaWaypointsJson = {
    bnarotg: WaypointData[];
};

const WAYPOINTS_DATA: WaypointsJson = waypointsData;
const BNA_WAYPOINTS_DATA: BnaWaypointsJson = waypointsData;


// Function to determine if it's night time in Memphis (CDT/CST)
const getMemphisTimeOfDay = (): "day" | "night" => {
    const now = new Date();
    // Memphis is UTC-6 (CST) or UTC-5 (CDT)
    const memphisOffset = -6; // Assuming CST for simplicity
    const memphisHour = (now.getUTCHours() + memphisOffset + 24) % 24;

    // Night is 0200-0600 local Memphis time
    return (memphisHour >= 2 && memphisHour < 6) ? "night" : "day";
};

export function MemWaypoints() {
    const { flows, toggleFlow } = useFlow();
    const currentFlow = flows.MEM;
    const [timeOfDay, setTimeOfDay] = useState<"day" | "night">(getMemphisTimeOfDay());

    // Update time of day every 5 minutes to toggle day/night waypoints
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeOfDay(getMemphisTimeOfDay());
        }, 300000); // Check every 5 minutes

        return () => clearInterval(interval);
    }, []);

    const toggleTimeOfDay = () => {
        setTimeOfDay(prev => prev === "day" ? "night" : "day");
    };

    // Define runway sets by flow - Memphis runways
    const SOUTH_FLOW_RUNWAYS = ['18L', '18C', '18R'];
    const NORTH_FLOW_RUNWAYS = ['36L', '36C', '36R'];

    const renderFlowBadge = (flow: 'north' | 'south', onClick: () => void) => {
        if (flow === 'north') {
            return (
                <Badge
                    className="bg-cyan-600 text-white flex items-center gap-1 cursor-pointer hover:bg-cyan-700 transition-colors"
                    onClick={onClick}
                >
                    <ArrowUp size={16} />
                    North Flow
                </Badge>
            );
        } else {
            return (
                <Badge
                    className="bg-orange-600 text-white flex items-center gap-1 cursor-pointer hover:bg-orange-700 transition-colors"
                    onClick={onClick}
                >
                    <ArrowDown size={16} />
                    South Flow
                </Badge>
            );
        }
    };

    const renderTimeOfDayBadge = (time: 'day' | 'night', onClick: () => void) => {
        if (time === 'day') {
            return (
                <Badge
                    className="bg-yellow-700 text-white flex items-center gap-1 cursor-pointer hover:bg-yellow-600 transition-colors"
                    onClick={onClick}
                >
                    <Sun size={16} />
                    Day Ops
                </Badge>
            );
        } else {
            return (
                <Badge
                    className="bg-purple-600 text-white flex items-center gap-1 cursor-pointer hover:bg-purple-700 transition-colors"
                    onClick={onClick}
                >
                    <Moon size={16} />
                    Night Ops
                </Badge>
            );
        }
    };

    const getActiveRunways = () => {
        const baseRunways = currentFlow === 'south' ? SOUTH_FLOW_RUNWAYS : NORTH_FLOW_RUNWAYS;
        return [...baseRunways];
    };

    // Separate 36C/R into individual runways for display
    const getDisplayRunways = () => {
        const runways = getActiveRunways();
        return runways.map(runway => {
            if (runway === '36C' || runway === '36R') {
                return [runway]; // Already individual
            }
            if (runway === '18C' || runway === '18L') {
                return [runway]; // Already individual
            }
            return [runway];
        }).flat();
    };

    const getRunwayWaypoint = (waypoint: WaypointData, runway: string): string => {
        // Handle the combined runway keys in the JSON
        if (runway === '36C' || runway === '36R') {
            return waypoint.rotg['36C/R'] || waypoint.rotg[runway] || '';
        }
        if (runway === '18L' || runway === '18C') {
            return waypoint.rotg['18L/C'] || waypoint.rotg[runway] || '';
        }
        return waypoint.rotg[runway] || '';
    };

    const isPreferredRunway = (waypoint: WaypointData, runway: string): boolean => {
        return waypoint.prefRwys.includes(runway);
    };

    const renderSidTable = () => {
        const displayRunways = getDisplayRunways();

        // Filter SIDs by time of day
        const filteredSids = WAYPOINTS_DATA.memrotg.filter(sid => sid.type === timeOfDay);

        return (
            <div className="border border-accent-foreground rounded p-4 bg-secondary dark:bg-secondary">
                <div className="flex items-center gap-2 mb-4">
                    <Navigation size={18} />
                    <h3 className="text-lg font-semibold">MEM ROTG SIDs</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({timeOfDay === 'day' ? 'Day' : 'Night'} Operations)
                    </span>
                </div>

                <div className="space-y-0">
                    {/* Header Row */}
                    <div className="grid gap-2 pb-2 text-sm font-medium border-b border-accent-foreground"
                         style={{gridTemplateColumns: `200px repeat(${displayRunways.length}, 1fr)`}}>
                        <div>SID</div>
                        {displayRunways.map(runway => (
                            <div key={runway} className="text-center">{runway}</div>
                        ))}
                    </div>

                    {/* Data Rows */}
                    {filteredSids.map((waypoint, index) => (
                        <div key={waypoint.sid}>
                            <div className="grid gap-2 py-2 text-sm"
                                 style={{gridTemplateColumns: `200px repeat(${displayRunways.length}, 1fr)`}}>
                                <div className="font-medium">
                                    {waypoint.sid}
                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                        ({waypoint.gate})
                                    </span>
                                </div>
                                {displayRunways.map(runway => {
                                    const waypointText = getRunwayWaypoint(waypoint, runway);
                                    const isPreferred = isPreferredRunway(waypoint, runway);

                                    return (
                                        <div
                                            key={runway}
                                            className={`text-center ${
                                                isPreferred
                                                    ? "text-green-500 dark:text-green-400 font-bold"
                                                    : "text-gray-600 dark:text-gray-400"
                                            }`}
                                        >
                                            {waypointText}
                                        </div>
                                    );
                                })}
                            </div>
                            {index < filteredSids.length - 1 && (
                                <Separator className="my-2" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center">
                {/* Left-side text block */}
                <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>Preferred runways (when busy) for each SID are shown in <span className="font-bold text-green-500 dark:text-green-400">green.</span></p>
                        <p>Other options are shown in <span className="text-gray-600 dark:text-gray-400">muted gray.</span></p>
                        <p>Click the badges to switch between flow and time configurations</p>
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    {renderTimeOfDayBadge(timeOfDay, toggleTimeOfDay)}
                    {renderFlowBadge(currentFlow, () => toggleFlow("MEM"))}
                </div>
            </div>

            <div className="space-y-6">
                {renderSidTable()}
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 mt-6">
                Showing {timeOfDay} operations SIDs for {currentFlow} flow configuration.
                {currentFlow === 'south'
                    ? ' South flow uses runways 18L, 18C, 18R.'
                    : ' North flow uses runways 36L, 36C, 36R.'}
                {' Runways 09 and 27 are also available, depending on configuration. The initial departure instruction for all SIDs for runways 09 and 27 is RUNWAY HEADING. '}
            </div>
        </div>
    );
}

export function BnaWaypoints() {
    const { flows, toggleFlow } = useFlow();
    const currentFlow = flows.BNA;

    // BNA runway configs
    const NORTH_FLOW_RUNWAYS = ["2L", "2R"];
    const SOUTH_FLOW_RUNWAYS = ["20C", "20R"];

    const getActiveRunways = () =>
        currentFlow === "north" ? NORTH_FLOW_RUNWAYS : SOUTH_FLOW_RUNWAYS;

    const renderFlowBadge = (flow: "north" | "south", onClick: () => void) => {
        if (flow === "north") {
            return (
                <Badge
                    className="bg-cyan-600 text-white flex items-center gap-1 cursor-pointer hover:bg-cyan-700 transition-colors"
                    onClick={onClick}
                >
                    <ArrowUp size={16} />
                    North Flow
                </Badge>
            );
        }
        return (
            <Badge
                className="bg-orange-600 text-white flex items-center gap-1 cursor-pointer hover:bg-orange-700 transition-colors"
                onClick={onClick}
            >
                <ArrowDown size={16} />
                South Flow
            </Badge>
        );
    };

    const isPreferredRunway = (waypoint: WaypointData, runway: string) =>
        waypoint.prefRwys.includes(runway);

    const renderSidTable = () => {
        const runways = getActiveRunways();

        return (
            <div className="border border-accent-foreground rounded p-4 bg-secondary dark:bg-secondary">
                <div className="flex items-center gap-2 mb-4">
                    <Navigation size={18} />
                    <h3 className="text-lg font-semibold">BNA RNAV SIDs</h3>
                </div>

                {/* Header */}
                <div
                    className="grid gap-2 pb-2 text-sm font-medium border-b border-accent-foreground"
                    style={{ gridTemplateColumns: `200px repeat(${runways.length}, 1fr)` }}
                >
                    <div>SID</div>
                    {runways.map(rwy => (
                        <div key={rwy} className="text-center">{rwy}</div>
                    ))}
                </div>

                {/* Rows */}
                {BNA_WAYPOINTS_DATA.bnarotg.map((waypoint, index) => (
                    <div key={waypoint.sid}>
                        <div
                            className="grid gap-2 py-2 text-sm"
                            style={{ gridTemplateColumns: `200px repeat(${runways.length}, 1fr)` }}
                        >
                            <div className="font-medium">{waypoint.sid}</div>

                            {runways.map(rwy => {
                                const text = waypoint.rotg[rwy] ?? "";
                                const preferred = isPreferredRunway(waypoint, rwy);

                                return (
                                    <div
                                        key={rwy}
                                        className={`text-center ${
                                            preferred
                                                ? "text-green-500 dark:text-green-400 font-bold"
                                                : "text-gray-600 dark:text-gray-400"
                                        }`}
                                    >
                                        {text}
                                    </div>
                                );
                            })}
                        </div>

                        {index < BNA_WAYPOINTS_DATA.bnarotg.length - 1 && (
                            <Separator className="my-2" />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>
                        Preferred runways are shown in{" "}
                        <span className="font-bold text-green-500 dark:text-green-400">
              green
            </span>.
                    </p>
                    <p>
                        Runways 13 and 31 always receive{" "}
                        <span className="font-semibold">RUNWAY HEADING</span>.
                    </p>
                </div>

                <div className="ml-auto">
                    {renderFlowBadge(currentFlow, () => toggleFlow("BNA"))}
                </div>
            </div>

            {renderSidTable()}

            <div className="text-xs text-gray-500 dark:text-gray-400 mt-6">
                Showing BNA RNAV SIDs for {currentFlow} flow.
                {currentFlow === "north"
                    ? " North flow uses runways 2L and 2R."
                    : " South flow uses runways 20C and 20R."}
            </div>
        </div>
    );
}
