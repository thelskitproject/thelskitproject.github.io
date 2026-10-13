"use client";

import { useLingui } from "@lingui/react";

import { IconBrandGithub } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { LocaleLink as Link } from "@/components/locale-link";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function LayoutHeader({ className }: { className?: string }) {
    const { i18n } = useLingui();
    return (
        <header
            className={cn(
                "fixed inset-x-0 top-0 z-50 h-16 border-b bg-background/95 backdrop-blur",
                className,
            )}
        >
            <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
                <Link href="/" className="flex items-center gap-3">
                    <span className="text-xl font-bold tracking-tight">
                        LSKit
                        <span className="text-blue-700 dark:text-blue-400">
                            .
                        </span>
                    </span>
                    <span className="hidden text-xs text-muted-foreground lg:inline">
                        {i18n._("Leeds campus tools")}
                    </span>
                </Link>
                <nav
                    aria-label={i18n._("Main navigation")}
                    className="flex items-center gap-1"
                >
                    <Button variant="ghost" asChild>
                        <Link href="/code">
                            <span className="hidden sm:inline">
                                {i18n._("Classroom QR codes")}
                            </span>
                            <span className="sm:hidden">
                                {i18n._("QR codes")}
                            </span>
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        asChild
                        className="hidden sm:inline-flex"
                    >
                        <Link href="/#tools">{i18n._("Campus tools")}</Link>
                    </Button>
                    <Button
                        variant="ghost"
                        asChild
                        className="hidden sm:inline-flex"
                    >
                        <Link href="/#about">{i18n._("About")}</Link>
                    </Button>
                </nav>
                <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <ModeToggle />
                    <Button
                        variant="outline"
                        size="icon"
                        asChild
                        className="hidden sm:inline-flex"
                    >
                        <a
                            href="https://github.com/thelskitproject"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={i18n._(
                                "View LSKit on GitHub (new window)",
                            )}
                        >
                            <IconBrandGithub aria-hidden="true" />
                        </a>
                    </Button>
                </div>
            </div>
        </header>
    );
}
