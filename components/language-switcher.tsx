"use client";

import { useLingui } from "@lingui/react";
import { usePathname, useRouter } from "next/navigation";
import { IconLanguage } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
    const { i18n } = useLingui();
    const pathname = usePathname();
    const router = useRouter();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <IconLanguage aria-hidden="true" />
                    <span className="sr-only">{i18n._("Change language")}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                    value={i18n.locale}
                    onValueChange={(locale) => {
                        if (locale === i18n.locale) return;
                        const path = pathname.replace(
                            /^\/(en|zh)(?=\/|$)/,
                            `/${locale}`,
                        );
                        router.push(
                            `${path}${window.location.search}${window.location.hash}`,
                        );
                    }}
                >
                    <DropdownMenuRadioItem value="en" lang="en">
                        English
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="zh" lang="zh">
                        中文
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
