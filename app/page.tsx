import Link from "next/link";
import styles from "./home.module.css";
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
                            利兹校园工具
                        </p>
                        <h1
                            className={`${styles.heading} text-[2.3rem] leading-[1.22] tracking-tight sm:text-6xl`}
                        >
                            找到教室，
                            <br />
                            打开二维码。
                        </h1>
                        <p className="mt-7 max-w-md text-base leading-8 text-muted-foreground">
                            按教学楼、房间名称或房间号查找教室二维码。
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Button
                                size="lg"
                                asChild
                                className="h-12 rounded-lg bg-blue-700 px-6 text-white hover:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600"
                            >
                                <Link href="/code">
                                    <IconQrcode aria-hidden="true" />{" "}
                                    查找教室二维码
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="ghost"
                                asChild
                                className="h-12 rounded-lg px-5"
                            >
                                <a href="#tools">
                                    查看工具{" "}
                                    <IconArrowUpRight aria-hidden="true" />
                                </a>
                            </Button>
                        </div>
                        <div className="mt-9 flex items-center gap-3 text-xs text-muted-foreground">
                            <span
                                className="size-2 rounded-lg bg-blue-600 dark:bg-blue-400"
                                aria-hidden="true"
                            />
                            <p>社区项目，非学校官方服务。</p>
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
                                        教室二维码
                                    </h2>
                                </CardTitle>
                            </div>
                            <CardDescription className="leading-7">
                                查找已有教室，也可以分享新二维码。
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="py-6">
                            <dl className="space-y-5 text-sm">
                                <div>
                                    <dt className="font-medium">查找教室</dt>
                                    <dd className="mt-2 leading-7 text-muted-foreground">
                                        输入教学楼、房间名称或房间号。
                                    </dd>
                                </div>
                                <Separator />
                                <div>
                                    <dt className="font-medium">分享二维码</dt>
                                    <dd className="mt-2 leading-7 text-muted-foreground">
                                        找不到教室？上传照片，分享二维码。
                                    </dd>
                                </div>
                                <Separator />
                                <div>
                                    <dt className="font-medium">使用前核对</dt>
                                    <dd className="mt-2 leading-7 text-muted-foreground">
                                        请核对教室信息，并按学校要求使用。
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
                                    项目主页{" "}
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
                            校园工具
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
                                        可用
                                    </Badge>
                                </div>
                                <CardTitle>
                                    <h3 className="text-2xl font-semibold">
                                        教室二维码
                                    </h3>
                                </CardTitle>
                                <CardDescription className="mt-2 max-w-sm leading-7 text-blue-100/85">
                                    查找教室，打开二维码。
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Separator className="bg-white/15" />
                                <p className="mt-5 text-xs leading-6 text-blue-100/80">
                                    请按学校要求签到。
                                </p>
                            </CardContent>
                            <CardFooter className="mt-auto">
                                <Button
                                    asChild
                                    variant="secondary"
                                    className="rounded-lg bg-white px-5 text-[#183153] hover:bg-blue-100"
                                >
                                    <Link href="/code">
                                        查找教室{" "}
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
                                        分享教室二维码
                                    </h3>
                                </CardTitle>
                                <CardDescription className="mt-2 leading-7">
                                    拍下二维码，补充教室信息。
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="mt-auto">
                                <Button asChild variant="outline">
                                    <Link href="/code/new">
                                        分享二维码{" "}
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
                        关于 LSKit
                    </h2>
                    <p className="mt-6 max-w-sm text-sm leading-8 text-muted-foreground">
                        为在利兹学习的同学提供校园工具。
                    </p>
                </div>
                <div className="space-y-7 md:pt-4">
                    <div>
                        <h3 className="text-lg font-semibold">反馈与建议</h3>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">
                            发现错误或有建议？欢迎告诉我们。
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
                                前往 GitHub{" "}
                                <IconArrowUpRight aria-hidden="true" />
                            </a>
                        </Button>
                    </div>
                    <Separator />
                    <div>
                        <h3 className="text-lg font-semibold">使用提醒</h3>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">
                            LSKit
                            并非学校官方服务。课程和考勤要求请以学校通知为准。
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
                                发现信息有误？
                            </h2>
                        </CardTitle>
                        <CardDescription className="mt-3 leading-7 text-[#506483]">
                            告诉我们，一起完善。
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
                                <IconBrandGithub aria-hidden="true" /> 反馈问题
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
                        利兹校园工具
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
