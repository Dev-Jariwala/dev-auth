/* eslint-disable react/prop-types */
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }) {
    React.useEffect(() => {
        return () => {
            document.documentElement.classList.remove(
                "light",
                "dark",
                "theme-default",
                "theme-orange",
                "theme-rose",
                "theme-blue",
                "theme-green",
                "theme-purpleish",
                "theme-cyanish",
                "theme-yellowish",
                "theme-maronish",
                "theme-new",
                "theme-my",
            );
        };
    }, []);
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
