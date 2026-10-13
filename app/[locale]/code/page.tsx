"use client";

import { useLingui } from "@lingui/react";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { LocaleLink as Link } from "@/components/locale-link";
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
    const { i18n } = useLingui();
    return (
        <Dialog>
            <Card className="gap-0 self-start py-0">
                <CardHeader className="block p-0">
                    <h2>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-24 w-full flex-col items-stretch justify-between gap-2 whitespace-normal rounded-xl p-3 text-left"
                                title={formatRoomName(
                                    entry.roomName || i18n._("Classroom"),
                                    entry.roomNumber,
                                )}
                            >
                                <span className="line-clamp-2 h-10 shrink-0 text-sm leading-5 font-semibold">
                                    {entry.roomName || i18n._("Classroom")}
                                </span>
                                <span className="flex w-full items-center justify-between gap-2">
                                    <span
                                        className="min-w-0 truncate text-xs font-normal text-muted-foreground"
                                        title={entry.buildingName}
                                    >
                                        {entry.buildingName}
                                    </span>
                                    <Badge variant="secondary">
                                        {entry.roomNumber}
                                    </Badge>
                                </span>
                                <span className="sr-only">
                                    {i18n._("View QR code")}
                                </span>
                            </Button>
                        </DialogTrigger>
                    </h2>
                </CardHeader>
            </Card>
            <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
                <DialogHeader className="pr-8">
                    <DialogTitle className="text-xl">
                        {formatRoomName(
                            entry.roomName || i18n._("Classroom"),
                            entry.roomNumber,
                        )}
                    </DialogTitle>
                    <DialogDescription>{entry.buildingName}</DialogDescription>
                </DialogHeader>
                <div className="min-w-0">
                    <QRCodeCanvas
                        matrix={entry.matrix}
                        label={i18n._("{building} {number} classroom QR code", {
                            building: entry.buildingName,
                            number: entry.roomNumber,
                        })}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function CodePage() {
    const { i18n } = useLingui();
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
                        {i18n._("Classroom QR codes")}
                    </h1>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        {i18n._("Select a classroom to view its QR code.")}
                    </p>
                </div>
                <Button asChild variant="outline" className="h-11">
                    <Link href="/code/new">
                        {i18n._("Share a classroom QR code")}
                    </Link>
                </Button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
                <Label htmlFor="code-search" className="sr-only">
                    {i18n._("Search by building, room name or number")}
                </Label>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-10 justify-between gap-3 sm:min-w-40"
                        >
                            <IconBuilding aria-hidden="true" />
                            {selectedBuildings.length
                                ? i18n._("Buildings ({count})", {
                                      count: selectedBuildings.length,
                                  })
                                : i18n._("All buildings")}
                            <IconChevronDown aria-hidden="true" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="max-h-[60dvh] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto"
                    >
                        <DropdownMenuLabel>
                            {i18n._("Select buildings")}
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
                            {i18n._("Clear filters")}
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
                        placeholder={i18n._(
                            "Search by building, room name or number",
                        )}
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
                            ? i18n._(
                                  "Could not refresh. Showing previously loaded classrooms.",
                              )
                            : i18n._(error)}
                    </p>
                    <Button variant="link" onClick={retry}>
                        {i18n._("Retry")}
                    </Button>
                </div>
            ) : (
                <p role="status" className="text-sm text-muted-foreground">
                    {loading
                        ? i18n._("Loading classrooms\u2026")
                        : codes.length === 0
                          ? i18n._("No classroom QR codes yet.")
                          : i18n._(
                                "{count, plural, one {# classroom} other {# classrooms}}",
                                { count: matches.length },
                            )}
                </p>
            )}
            {codes.length > 0 && matches.length === 0 && (
                <p className="text-sm">
                    {i18n._(
                        "No classrooms found. Try another search or clear the filters.",
                    )}
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
