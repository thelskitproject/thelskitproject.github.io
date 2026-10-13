"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useLingui } from "@lingui/react";

export function LocaleLink({ href, ...props }: ComponentProps<typeof Link>) {
    const { i18n } = useLingui();
    const localized =
        typeof href === "string" &&
        href.startsWith("/") &&
        !href.startsWith("//")
            ? `/${i18n.locale}${href === "/" ? "" : href}`
            : href;
    return <Link href={localized} {...props} />;
}
