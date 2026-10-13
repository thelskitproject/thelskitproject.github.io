import type { Metadata } from "next";
import "../globals.css";
import { ReactNode } from "react";
import LayoutHeader from "@/app/layout-header";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { messages as english } from "@/locales/en/messages";
import { messages as chinese } from "@/locales/zh/messages";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export function generateStaticParams() {
    return [{ locale: "en" }, { locale: "zh" }];
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    return {
        title:
            locale === "zh"
                ? "LSKit · 利兹校园工具"
                : "LSKit · Leeds campus tools",
        description:
            locale === "zh"
                ? "查找利兹大学教室二维码，也可分享新的教室记录。"
                : "Find University of Leeds classroom QR codes or share a new classroom.",
    };
}

export default async function RootLayout({
    children,
    params,
}: Readonly<{ children: ReactNode; params: Promise<{ locale: string }> }>) {
    const { locale } = await params;
    if (locale !== "en" && locale !== "zh") notFound();
    return (
        <html lang={locale === "zh" ? "zh-CN" : "en"} suppressHydrationWarning>
            <body className={`antialiased`}>
                <LocaleProvider
                    key={locale}
                    locale={locale}
                    messages={locale === "zh" ? chinese : english}
                >
                    <ThemeProvider
                        attribute={"class"}
                        defaultTheme={"system"}
                        enableSystem
                        disableTransitionOnChange
                    >
                        <div className={"grid"}>
                            <LayoutHeader />
                            <div
                                className={
                                    "mt-16 h-[calc(100%-var(--spacing)*16)]"
                                }
                            >
                                {children}
                            </div>
                        </div>
                    </ThemeProvider>
                </LocaleProvider>
            </body>
        </html>
    );
}
