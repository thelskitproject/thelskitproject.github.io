"use client";

import { useState, type ReactNode } from "react";
import { setupI18n, type Messages } from "@lingui/core";
import { I18nProvider } from "@lingui/react";

export function LocaleProvider({
    locale,
    messages,
    children,
}: {
    locale: string;
    messages: Messages;
    children: ReactNode;
}) {
    const [i18n] = useState(() =>
        setupI18n({ locale, messages: { [locale]: messages } }),
    );
    return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}
