import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import LayoutHeader from "@/app/layout-header";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
    title: "LSKit · 利兹校园工具",
    description: "查找利兹大学教室二维码，也可分享新的教室记录。",
};

export default function RootLayout({
    children,
}: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="zh-CN" suppressHydrationWarning>
            <body className={`antialiased`}>
                <ThemeProvider
                    attribute={"class"}
                    defaultTheme={"system"}
                    enableSystem
                    disableTransitionOnChange
                >
                    <div className={"grid"}>
                        <LayoutHeader />
                        <div
                            className={"mt-16 h-[calc(100%-var(--spacing)*16)]"}
                        >
                            {children}
                        </div>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
