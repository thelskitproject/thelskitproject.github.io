import { IconBrandGithub } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";

export default function LayoutHeader({ className }: { className?: string }) {
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
                        利兹校园工具
                    </span>
                </Link>
                <nav aria-label="主导航" className="flex items-center gap-1">
                    <Button variant="ghost" asChild>
                        <Link href="/code">教室二维码</Link>
                    </Button>
                    <Button
                        variant="ghost"
                        asChild
                        className="hidden sm:inline-flex"
                    >
                        <Link href="/#tools">校园工具</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href="/#about">关于</Link>
                    </Button>
                </nav>
                <div className="flex items-center gap-2">
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
                            aria-label="在 GitHub 查看 LSKit（新窗口）"
                        >
                            <IconBrandGithub aria-hidden="true" />
                        </a>
                    </Button>
                </div>
            </div>
        </header>
    );
}
