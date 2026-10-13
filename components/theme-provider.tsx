"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <NextThemesProvider
            {...props}
            scriptProps={{
                ...props.scriptProps,
                // Theme effects handle client mounts; the bootstrap runs only in server HTML.
                type:
                    typeof window === "undefined"
                        ? "text/javascript"
                        : "application/json",
            }}
        >
            {children}
        </NextThemesProvider>
    );
}
