
"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type RouteToPlot = {
    route: string
    source: "faa" | "custom"
}

type RoutePlannerContextType = {
    queueRoute: (route: RouteToPlot) => void
    dequeuedRoute: RouteToPlot | null
    clearQueue: () => void
}

const RoutePlannerContext = createContext<RoutePlannerContextType | null>(null)

export function RoutePlannerProvider({ children }: { children: ReactNode }) {
    const [queuedRoute, setQueuedRoute] = useState<RouteToPlot | null>(null)

    const queueRoute = (route: RouteToPlot) => {
        setQueuedRoute(route)
    }

    const clearQueue = () => {
        setQueuedRoute(null)
    }

    return (
        <RoutePlannerContext.Provider
            value={{
                queueRoute,
                dequeuedRoute: queuedRoute,
                clearQueue,
            }}
        >
            {children}
        </RoutePlannerContext.Provider>
    )
}

export function useRoutePlanner() {
    const context = useContext(RoutePlannerContext)
    if (!context) {
        throw new Error("useRoutePlanner must be used within RoutePlannerProvider")
    }
    return context
}