"use client";

import { useLingui } from "@lingui/react";

import { LocaleLink as Link } from "@/components/locale-link";
import styles from "@/app/home.module.css";
import {
    IconArrowUpRight,
    IconBrandGithub,
    IconQrcode,
    IconSchool,
    IconMapPin,
    IconHeartHandshake,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const github = "https://github.com/thelskitproject";

export default function Page() {
    const { i18n } = useLingui();
    return (
        <main className={styles.home}>
            <section className="mx-auto max-w-6xl px-6 pb-14 pt-12 sm:pb-20 sm:pt-20">
                <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
                    <div>
                        <p className="mb-7 flex items-center gap-2 text-sm text-muted-foreground">
                            <IconMapPin
                                className="size-4 text-blue-700 dark:text-blue-300"
                                aria-hidden="true"
                            />{" "}
                            {i18n._("Leeds campus tools")}
                        </p>
                        <h1
                            className={`${styles.heading} text-[2.3rem] leading-[1.22] tracking-tight sm:text-6xl`}
                        >
                            {i18n._("Find your classroom.")}
                            <br />
                            {i18n._("Open its QR code.")}
                        </h1>
                        <p className="mt-7 max-w-md text-base leading-8 text-muted-foreground">
                            {i18n._(
                                "Find a classroom QR code by building, room name or room number.",
                            )}
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Button
                                size="lg"
                                asChild
                                className="h-12 rounded-lg bg-blue-700 px-6 text-white hover:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600"
                            >
                                <Link href="/code">
                                    <IconQrcode aria-hidden="true" />{" "}
                                    {i18n._("Find a classroom QR code")}
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="ghost"
                                asChild
                                className="h-12 rounded-lg px-5"
                            >
                                <a href="#tools">
                                    {i18n._("Explore tools")}{" "}
                                    <IconArrowUpRight aria-hidden="true" />
                                </a>
                            </Button>
                        </div>
                        <div className="mt-9 flex items-center gap-3 text-xs text-muted-foreground">
                            <span
                                className="size-2 rounded-lg bg-blue-600 dark:bg-blue-400"
                                aria-hidden="true"
                            />
                            <p>
                                {i18n._(
                                    "A community project, unaffiliated with the university.",
                                )}
                            </p>
                        </div>
                    </div>
                    <Card className="gap-0 rounded-xl border bg-card py-0 shadow-sm ring-0">
                        <CardHeader className="gap-3 border-b py-6">
                            <div className="flex items-center gap-3">
                                <IconSchool
                                    className="size-5 text-blue-700 dark:text-blue-300"
                                    aria-hidden="true"
                                />
                                <CardTitle>
                                    <h2 className="text-lg font-semibold">
                                        {i18n._("Classroom QR codes")}
                                    </h2>
                                </CardTitle>
                            </div>
                            <CardDescription className="leading-7">
                                {i18n._(
                                    "Find a classroom or share a new QR code.",
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="py-6">
                            <dl className="space-y-5 text-sm">
                                <div>
                                    <dt className="font-medium">
                                        {i18n._("Find a classroom")}
                                    </dt>
                                    <dd className="mt-2 leading-7 text-muted-foreground">
                                        {i18n._(
                                            "Enter a building, room name or room number.",
                                        )}
                                    </dd>
                                </div>
                                <Separator />
                                <div>
                                    <dt className="font-medium">
                                        {i18n._("Share a QR code")}
                                    </dt>
                                    <dd className="mt-2 leading-7 text-muted-foreground">
                                        {i18n._(
                                            "Missing a classroom? Choose a photo to share its QR code.",
                                        )}
                                    </dd>
                                </div>
                                <Separator />
                                <div>
                                    <dt className="font-medium">
                                        {i18n._("Check before use")}
                                    </dt>
                                    <dd className="mt-2 leading-7 text-muted-foreground">
                                        {i18n._(
                                            "Check the classroom details and follow university requirements.",
                                        )}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                        <CardFooter className="border-t bg-muted/30 py-4">
                            <Button
                                asChild
                                variant="outline"
                                className="w-full"
                            >
                                <a
                                    href={github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <IconBrandGithub aria-hidden="true" />{" "}
                                    {i18n._("Project on GitHub")}{" "}
                                    <IconArrowUpRight aria-hidden="true" />
                                </a>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </section>

            <section
                id="tools"
                aria-labelledby="tools-title"
                className="scroll-mt-24 border-y bg-background/70"
            >
                <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
                    <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <h2
                            id="tools-title"
                            className={`${styles.heading} text-3xl leading-snug sm:text-4xl`}
                        >
                            {i18n._("Campus tools")}
                        </h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-[1.15fr_1fr]">
                        <Card className="gap-5 rounded-2xl bg-[#183153] text-white shadow-none ring-0">
                            <CardHeader>
                                <div className="mb-8 flex items-center justify-between">
                                    <IconQrcode
                                        className="size-9 text-blue-200"
                                        aria-hidden="true"
                                    />
                                    <Badge
                                        variant="outline"
                                        className="border-white/25 text-blue-100"
                                    >
                                        {i18n._("Available")}
                                    </Badge>
                                </div>
                                <CardTitle>
                                    <h3 className="text-2xl font-semibold">
                                        {i18n._("Classroom QR codes")}
                                    </h3>
                                </CardTitle>
                                <CardDescription className="mt-2 max-w-sm leading-7 text-blue-100/85">
                                    {i18n._(
                                        "Find a classroom and open its QR code.",
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Separator className="bg-white/15" />
                                <p className="mt-5 text-xs leading-6 text-blue-100/80">
                                    {i18n._(
                                        "Follow university requirements when checking in.",
                                    )}
                                </p>
                            </CardContent>
                            <CardFooter className="mt-auto">
                                <Button
                                    asChild
                                    variant="secondary"
                                    className="rounded-lg bg-white px-5 text-[#183153] hover:bg-blue-100"
                                >
                                    <Link href="/code">
                                        {i18n._("Find a classroom")}{" "}
                                        <IconArrowUpRight aria-hidden="true" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                        <Card className="rounded-2xl shadow-none">
                            <CardHeader>
                                <IconHeartHandshake
                                    className="mb-8 size-9 text-blue-700 dark:text-blue-300"
                                    aria-hidden="true"
                                />
                                <CardTitle>
                                    <h3 className="text-2xl font-semibold">
                                        {i18n._("Share a classroom QR code")}
                                    </h3>
                                </CardTitle>
                                <CardDescription className="mt-2 leading-7">
                                    {i18n._(
                                        "Take a photo of the QR code and add the classroom details.",
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="mt-auto">
                                <Button asChild variant="outline">
                                    <Link href="/code/new">
                                        {i18n._("Share a QR code")}{" "}
                                        <IconArrowUpRight aria-hidden="true" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </section>

            <section
                id="about"
                aria-labelledby="about-title"
                className="mx-auto grid max-w-6xl scroll-mt-24 gap-10 px-6 py-16 sm:py-20 md:grid-cols-[1fr_1.1fr] md:gap-20"
            >
                <div>
                    <IconHeartHandshake
                        className="mb-5 size-8 text-blue-700 dark:text-blue-300"
                        aria-hidden="true"
                    />
                    <h2
                        id="about-title"
                        className={`${styles.heading} text-3xl leading-snug sm:text-4xl`}
                    >
                        {i18n._("About LSKit")}
                    </h2>
                    <p className="mt-6 max-w-sm text-sm leading-8 text-muted-foreground">
                        {i18n._("Campus tools for students in Leeds.")}
                    </p>
                </div>
                <div className="space-y-7 md:pt-4">
                    <div>
                        <h3 className="text-lg font-semibold">
                            {i18n._("Feedback and suggestions")}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">
                            {i18n._(
                                "Found a mistake or have a suggestion? Let us know.",
                            )}
                        </p>
                        <Button
                            asChild
                            variant="link"
                            className="mt-2 h-auto px-0"
                        >
                            <a
                                href={github}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {i18n._("Visit GitHub")}{" "}
                                <IconArrowUpRight aria-hidden="true" />
                            </a>
                        </Button>
                    </div>
                    <Separator />
                    <div>
                        <h3 className="text-lg font-semibold">
                            {i18n._("Before you use LSKit")}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">
                            {i18n._(
                                "LSKit is unaffiliated with the university. Refer to university guidance for course and attendance requirements.",
                            )}
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 pb-16">
                <Card className="gap-4 rounded-2xl bg-[#E8EEFF] py-8 text-[#183153] shadow-none ring-0 md:flex-row md:items-center md:justify-between">
                    <CardHeader className="flex min-w-0 flex-1 flex-col items-start">
                        <CardTitle>
                            <h2
                                className={`${styles.heading} text-2xl sm:text-3xl`}
                            >
                                {i18n._("Found incorrect information?")}
                            </h2>
                        </CardTitle>
                        <CardDescription className="mt-3 leading-7 text-[#506483]">
                            {i18n._("Let us know and help improve it.")}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="shrink-0">
                        <Button
                            asChild
                            size="lg"
                            className="rounded-lg bg-[#183153] px-6 text-white hover:bg-[#24456f]"
                        >
                            <a
                                href={github}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <IconBrandGithub aria-hidden="true" />{" "}
                                {i18n._("Report a problem")}
                            </a>
                        </Button>
                    </CardFooter>
                </Card>
            </section>
            <footer className="border-t">
                <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        <span className="mr-3 text-base font-bold text-foreground">
                            LSKit
                        </span>
                        {i18n._("Leeds campus tools")}
                    </p>
                    <a
                        href={github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline-offset-4 hover:underline"
                    >
                        GitHub
                    </a>
                </div>
            </footer>
        </main>
    );
}
