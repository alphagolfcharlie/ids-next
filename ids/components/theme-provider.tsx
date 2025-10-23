"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"

// Wraps next-themes provider
export function ThemeProvider({
                                  children,
                                  ...props
                              }: React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <NextThemesProvider {...props} attribute="class">
            {children}
        </NextThemesProvider>
    )
}

// Custom hook for ShadCN-compatible usage
export function useTheme() {
    const { theme, setTheme, systemTheme } = useNextTheme()
    return {
        theme: theme ?? systemTheme, // fallback to system theme
        setTheme,
        systemTheme,
    }
}
