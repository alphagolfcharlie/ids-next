"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Airport = "MEM" | "BNA";
type FlowType = "north" | "south";

interface FlowContextType {
    flows: Record<Airport, FlowType>;
    setFlow: (airport: Airport, flow: FlowType) => void;
    toggleFlow: (airport: Airport) => void;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export function FlowProvider({ children }: { children: ReactNode }) {
    const [flows, setFlows] = useState<Record<Airport, FlowType>>({
        MEM: "south",
        BNA: "south",
    });

    const setFlow = (airport: Airport, flow: FlowType) => {
        setFlows(prev => ({
            ...prev,
            [airport]: flow,
        }));
    };

    const toggleFlow = (airport: Airport) => {
        setFlows(prev => ({
            ...prev,
            [airport]: prev[airport] === "north" ? "south" : "north",
        }));
    };

    return (
        <FlowContext.Provider value={{ flows, setFlow, toggleFlow }}>
            {children}
        </FlowContext.Provider>
    );
}

export function useFlow() {
    const context = useContext(FlowContext);
    if (!context) {
        throw new Error("useFlow must be used within a FlowProvider");
    }
    return context;
}
