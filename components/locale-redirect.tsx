"use client";

import { useEffect } from "react";
import Link from "next/link";

export function LocaleRedirect({ path = "" }: { path?: string }) {
    useEffect(() => {
        const language = navigator.languages?.[0] ?? navigator.language;
        const locale = language.toLowerCase().startsWith("zh") ? "zh" : "en";
        window.location.replace(
            `/${locale}${path}${window.location.search}${window.location.hash}`,
        );
    }, [path]);
    return (
        <main className="flex min-h-screen items-center justify-center gap-6">
            <Link href={`/en${path}`}>English</Link>
            <Link href={`/zh${path}`}>中文</Link>
        </main>
    );
}
