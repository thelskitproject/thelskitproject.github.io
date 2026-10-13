"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import Link from "next/link";
import { QRCodeCanvas } from "@/components/qr-code-canvas";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { IconChevronDown, IconSearch, IconBuilding } from "@tabler/icons-react";
import { useCheckinCodes } from "@/lib/use-checkin-codes";
import {
    formatRoomName,
    matchesCheckinCode,
    type CheckinCode,
} from "@/lib/qr-code";

function CodeCard({ entry }: { entry: CheckinCode }) {
    return (
        <Dialog>
            <Card className="gap-0 self-start py-0">
                <CardHeader className="block p-0">
                    <h2>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-auto min-h-20 w-full flex-col items-stretch gap-2 whitespace-normal rounded-xl p-3 text-left"
                                title={formatRoomName(
                                    entry.roomName,
                                    entry.roomNumber,
                                )}
                            >
                                <span className="line-clamp-2 text-sm font-semibold">
                                    {formatRoomName(
                                        entry.roomName,
                                        entry.roomNumber,
                                    )}
                                </span>
                                <span className="sr-only">查看二维码</span>
                            </Button>
                        </DialogTrigger>
                    </h2>
                </CardHeader>
            </Card>
            <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
                <DialogHeader className="pr-8">
                    <DialogTitle className="text-xl">
                        {formatRoomName(entry.roomName, entry.roomNumber)}
                    </DialogTitle>
                    <DialogDescription>{entry.buildingName}</DialogDescription>
                </DialogHeader>
                <div className="min-w-0">
                    <QRCodeCanvas
                        matrix={entry.matrix}
                        label={`${entry.buildingName} ${entry.roomNumber} 教室二维码`}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function CodePage() {
    const [query, setQuery] = useState("");
    const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
    const { codes, loading, error, retry } = useCheckinCodes();
    const matches = codes.filter((entry) =>
        matchesCheckinCode(entry, query, selectedBuildings),
    );
    const buildings = Array.from(
        new Set(codes.map((entry) => entry.buildingName)),
    ).sort((a, b) => a.localeCompare(b));
    return (
        <main className="mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-6 sm:py-10">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        教室求码
                    </h1>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        点击教室查看二维码。
                    </p>
                </div>
                <Button asChild variant="outline" className="h-11">
                    <Link href="/code/new">分享教室二维码</Link>
                </Button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
                <Label htmlFor="code-search" className="sr-only">
                    搜索教学楼、房间名称或房间号
                </Label>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-10 justify-between gap-3 sm:min-w-40"
                        >
                            <IconBuilding aria-hidden="true" />
                            {selectedBuildings.length
                                ? `教学楼 (${selectedBuildings.length})`
                                : "全部教学楼"}
                            <IconChevronDown aria-hidden="true" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="max-h-[60dvh] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto"
                    >
                        <DropdownMenuLabel>
                            选择教学楼（可多选）
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {buildings.map((building) => (
                            <DropdownMenuCheckboxItem
                                key={building}
                                checked={selectedBuildings.includes(building)}
                                onSelect={(event) => event.preventDefault()}
                                onCheckedChange={(checked) =>
                                    setSelectedBuildings((current) =>
                                        checked === true
                                            ? [...current, building]
                                            : current.filter(
                                                  (value) => value !== building,
                                              ),
                                    )
                                }
                                className="whitespace-normal"
                            >
                                {building}
                            </DropdownMenuCheckboxItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            disabled={!selectedBuildings.length}
                            onSelect={() => setSelectedBuildings([])}
                        >
                            清除筛选
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <InputGroup className="h-10 flex-1 bg-card">
                    <InputGroupAddon>
                        <IconSearch aria-hidden="true" />
                    </InputGroupAddon>
                    <InputGroupInput
                        id="code-search"
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="搜索教学楼、房间名称或房间号"
                    />
                </InputGroup>
            </div>
            {error ? (
                <div
                    role="alert"
                    className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
                >
                    <p>
                        {codes.length
                            ? "更新失败，暂时显示上次加载的教室。"
                            : error}
                    </p>
                    <Button variant="link" onClick={retry}>
                        重试
                    </Button>
                </div>
            ) : (
                <p role="status" className="text-sm text-muted-foreground">
                    {loading
                        ? "正在加载教室…"
                        : codes.length === 0
                          ? "暂无教室二维码。"
                          : `${matches.length} 间教室`}
                </p>
            )}
            {codes.length > 0 && matches.length === 0 && (
                <p className="text-sm">
                    没有找到教室，请更换关键词或清除筛选。
                </p>
            )}
            <div
                aria-busy={loading}
                className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
                {matches.map((entry) => (
                    <CodeCard
                        key={`${entry.buildingName}\0${entry.roomNumber}`}
                        entry={entry}
                    />
                ))}
            </div>
        </main>
    );
}
