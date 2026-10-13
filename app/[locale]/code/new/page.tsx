"use client";

import { useLingui } from "@lingui/react";

import { useRef, useState } from "react";
import { LocaleLink as Link } from "@/components/locale-link";
import {
    IconArrowLeft,
    IconLoader2,
    IconCircleCheck,
    IconUpload,
    IconPhoto,
} from "@tabler/icons-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxList,
    ComboboxItem,
} from "@/components/ui/combobox";
import { QRCodeCanvas } from "@/components/qr-code-canvas";
import { formatRoomName } from "@/lib/qr-code";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { parseQRCodePhoto, selectQRCodePhoto } from "@/lib/parse-qr-photo";
import { useCheckinCodes } from "@/lib/use-checkin-codes";
import { createClassroomIssueURL } from "@/lib/classroom-submission";

export default function NewCodePage() {
    const { i18n } = useLingui();
    const { codes, error: buildingsError, retry } = useCheckinCodes();
    const buildings = Array.from(
        new Set(codes.map((entry) => entry.buildingName)),
    ).sort();
    const [buildingName, setBuildingName] = useState("");
    const [roomName, setRoomName] = useState("");
    const [roomNumber, setRoomNumber] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [matrix, setMatrix] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [review, setReview] = useState<{
        buildingName: string;
        roomName: string;
        roomNumber: string;
        url: string;
    } | null>(null);
    const submitButton = useRef<HTMLButtonElement>(null);
    const attempt = useRef(0);
    const photoInput = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const dragDepth = useRef(0);
    async function selectPhotos(files: File[]) {
        if (busy) return;
        const current = ++attempt.current;
        setFile(null);
        setMatrix(null);
        setError("");
        setBusy(true);
        try {
            const selected = selectQRCodePhoto(files);
            setFile(selected);
            const result = await parseQRCodePhoto(selected);
            if (attempt.current === current) setMatrix(result.matrix);
        } catch (error) {
            if (attempt.current === current)
                setError(
                    error instanceof Error
                        ? error.message
                        : i18n._(
                              "Could not read this photo. Please try again.",
                          ),
                );
        } finally {
            if (attempt.current === current) setBusy(false);
        }
    }
    function submit() {
        setError("");
        try {
            const url = createClassroomIssueURL({
                buildingName,
                roomName: roomName.trim() || null,
                roomNumber,
                matrix,
            });
            setReview({
                buildingName: buildingName.trim(),
                roomName: roomName.trim(),
                roomNumber: roomNumber.trim(),
                url,
            });
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : i18n._(
                          "Could not prepare your submission. Check the classroom details.",
                      ),
            );
        }
    }
    return (
        <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
            <Button variant="ghost" asChild className="-ml-3">
                <Link href="/code">
                    <IconArrowLeft aria-hidden="true" />
                    {i18n._("Back to classrooms")}
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                    {i18n._("Share a classroom QR code")}
                </h1>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {i18n._(
                        "Enter the classroom details, choose a photo and check the QR code.",
                    )}
                </p>
            </div>
            <div className="grid items-start gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <h2>{i18n._("Classroom details")}</h2>
                            </CardTitle>
                            <CardDescription>
                                {i18n._(
                                    "Select a building or enter a new name.",
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="building-name">
                                    {i18n._("Building")}
                                </Label>
                                <Combobox
                                    items={buildings}
                                    value={buildingName || null}
                                    inputValue={buildingName}
                                    onInputValueChange={setBuildingName}
                                    onValueChange={(value) =>
                                        setBuildingName(value ?? "")
                                    }
                                >
                                    <ComboboxInput
                                        id="building-name"
                                        placeholder={i18n._(
                                            "Select or enter a building name",
                                        )}
                                    />
                                    <ComboboxContent>
                                        <ComboboxEmpty>
                                            {i18n._(
                                                "Use the new name you entered.",
                                            )}
                                        </ComboboxEmpty>
                                        <ComboboxList>
                                            {(building: string) => (
                                                <ComboboxItem
                                                    key={building}
                                                    value={building}
                                                >
                                                    {building}
                                                </ComboboxItem>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                                {buildingsError && (
                                    <p className="text-xs text-muted-foreground">
                                        {i18n._(
                                            "Building list unavailable. You can enter a name.",
                                        )}
                                        <Button
                                            variant="link"
                                            size="sm"
                                            onClick={retry}
                                        >
                                            {i18n._("Retry")}
                                        </Button>
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="room-name">
                                    {i18n._("Room name")}
                                </Label>
                                <Input
                                    id="room-name"
                                    required
                                    maxLength={200}
                                    aria-describedby="room-name-help"
                                    value={roomName}
                                    onChange={(event) =>
                                        setRoomName(event.target.value)
                                    }
                                    placeholder={i18n._(
                                        "Copy the room name from the photo",
                                    )}
                                />
                                <p
                                    id="room-name-help"
                                    className="text-xs leading-6 text-muted-foreground"
                                >
                                    {i18n._(
                                        "Copy the text exactly as shown in the photo, excluding the room number. Do not abbreviate or translate it.",
                                    )}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="room-number">
                                    {i18n._("Room number")}
                                </Label>
                                <Input
                                    id="room-number"
                                    value={roomNumber}
                                    onChange={(event) =>
                                        setRoomNumber(event.target.value)
                                    }
                                    placeholder={i18n._(
                                        "For example, G.06 or 7M.02",
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <h2>{i18n._("QR code photo")}</h2>
                            </CardTitle>
                            <CardDescription>
                                {i18n._("Your photo stays on your device.")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <input
                                ref={photoInput}
                                id="qr-photo"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                aria-label={i18n._("Choose a QR code photo")}
                                disabled={busy}
                                onChange={(event) => {
                                    if (event.target.files?.length)
                                        selectPhotos(
                                            Array.from(event.target.files),
                                        );
                                    event.target.value = "";
                                }}
                            />
                            <div
                                onDragEnter={(event) => {
                                    event.preventDefault();
                                    if (
                                        busy ||
                                        !event.dataTransfer.types.includes(
                                            "Files",
                                        )
                                    )
                                        return;
                                    dragDepth.current++;
                                    setDragging(true);
                                }}
                                onDragOver={(event) => {
                                    event.preventDefault();
                                    event.dataTransfer.dropEffect = busy
                                        ? "none"
                                        : "copy";
                                }}
                                onDragLeave={() => {
                                    dragDepth.current = Math.max(
                                        0,
                                        dragDepth.current - 1,
                                    );
                                    if (!dragDepth.current) setDragging(false);
                                }}
                                onDrop={(event) => {
                                    event.preventDefault();
                                    dragDepth.current = 0;
                                    setDragging(false);
                                    selectPhotos(
                                        Array.from(event.dataTransfer.files),
                                    );
                                }}
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={busy}
                                    onClick={() => photoInput.current?.click()}
                                    className={`h-auto w-full flex-col gap-3 border-dashed px-5 py-7 whitespace-normal ${dragging ? "border-primary bg-accent ring-2 ring-ring" : ""}`}
                                >
                                    <IconUpload
                                        className="size-6 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                    <span>
                                        {dragging
                                            ? i18n._("Drop your photo here")
                                            : file
                                              ? i18n._(
                                                    "Drop or click to replace your photo",
                                                )
                                              : i18n._(
                                                    "Drop a QR code photo here or click to choose",
                                                )}
                                    </span>
                                </Button>
                            </div>
                            {file && (
                                <div
                                    role="status"
                                    className="flex min-w-0 items-start gap-3 rounded-lg bg-muted/50 p-3"
                                >
                                    {busy ? (
                                        <IconLoader2
                                            className="mt-0.5 size-4 shrink-0 text-muted-foreground motion-safe:animate-spin"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <IconPhoto
                                            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">
                                            {busy
                                                ? i18n._(
                                                      "Reading QR code\u2026",
                                                  )
                                                : i18n._("Photo selected")}
                                        </p>
                                        <p
                                            title={file.name}
                                            className="mt-1 break-all text-sm leading-6"
                                        >
                                            {file.name}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <p className="text-xs leading-6 text-muted-foreground">
                                {i18n._(
                                    "PNG, JPG or WebP, up to 20 MB. Include the entire QR code clearly.",
                                )}
                            </p>

                            {error && (
                                <p
                                    role="alert"
                                    className="text-sm text-destructive"
                                >
                                    {i18n._(error)}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <h2>{i18n._("QR code preview")}</h2>
                        </CardTitle>
                        {(roomName.trim() || roomNumber.trim()) && (
                            <CardDescription>
                                {formatRoomName(
                                    roomName || i18n._("Classroom"),
                                    roomNumber,
                                )}
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {matrix ? (
                            <>
                                <p
                                    role="status"
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <IconCircleCheck
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    {i18n._(
                                        "QR code restored. Please check it.",
                                    )}
                                </p>
                                <QRCodeCanvas
                                    matrix={matrix}
                                    label={i18n._("QR code preview")}
                                />
                            </>
                        ) : (
                            <div
                                role="status"
                                className="rounded-lg border border-dashed px-6 py-16 text-center text-sm leading-7 text-muted-foreground"
                            >
                                {busy
                                    ? i18n._("Reading QR code\u2026")
                                    : i18n._(
                                          "Choose or drop a photo to read its QR code automatically.",
                                      )}
                            </div>
                        )}
                        <div className="text-xs leading-6 text-muted-foreground">
                            <p>
                                {i18n._(
                                    "A GitHub account is required to submit",
                                )}
                            </p>
                            <p>
                                {i18n._("By submitting, you agree to the ")}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            className="inline rounded-sm text-foreground underline underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            {i18n._(
                                                "classroom QR code sharing terms",
                                            )}
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        align="start"
                                        className="w-80 max-w-[calc(100vw-2rem)] max-h-[min(28rem,70vh)] overflow-y-auto space-y-3 text-xs leading-6"
                                    >
                                        <h3 className="text-sm font-medium">
                                            {i18n._(
                                                "classroom QR code sharing terms",
                                            )}
                                        </h3>
                                        <p>
                                            {i18n._(
                                                "Classroom details, the QR code and your GitHub account will be public. Your photo will not be uploaded. Do not submit personal information, private credentials or QR codes you may not share publicly.",
                                            )}
                                        </p>
                                        <p>
                                            {i18n._(
                                                "By submitting, you confirm you may share this information publicly and have checked the room name, number and QR code. Follow university rules and take responsibility for your submission.",
                                            )}
                                        </p>
                                        <p>
                                            {i18n._(
                                                "LSKit is unaffiliated with the university and does not guarantee QR codes are correct or remain valid. Please verify them yourself. Do not impersonate others, check in for someone else or violate university rules. To the extent permitted by law, the project is not liable for losses caused by incorrect or expired information or misuse. This does not exclude liability that cannot legally be excluded.",
                                            )}
                                        </p>
                                    </PopoverContent>
                                </Popover>
                            </p>
                        </div>
                        <Button
                            ref={submitButton}
                            onClick={submit}
                            disabled={!matrix || busy}
                            className="w-full"
                        >
                            {i18n._("Submit classroom")}
                        </Button>
                    </CardContent>
                </Card>
            </div>
            <Dialog
                open={review !== null}
                onOpenChange={(open) => {
                    if (!open) setReview(null);
                }}
            >
                <DialogContent
                    onCloseAutoFocus={(event) => {
                        event.preventDefault();
                        submitButton.current?.focus();
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>
                            {i18n._("Are these details correct?")}
                        </DialogTitle>
                        <DialogDescription>
                            {i18n._(
                                "Please check the building, room name and room number.",
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    {review && (
                        <dl className="space-y-4 text-sm">
                            <div>
                                <dt className="text-muted-foreground">
                                    {i18n._("Building")}
                                </dt>
                                <dd className="mt-1 break-words font-medium">
                                    {review.buildingName}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">
                                    {i18n._("Room name")}
                                </dt>
                                <dd className="mt-1 break-words font-medium">
                                    {review.roomName}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">
                                    {i18n._("Room number")}
                                </dt>
                                <dd className="mt-1 break-words font-medium">
                                    {review.roomNumber}
                                </dd>
                            </div>
                        </dl>
                    )}
                    <DialogFooter className="flex-col gap-2 sm:flex-col">
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                className="h-auto min-h-10 w-full whitespace-normal"
                            >
                                {i18n._("Something is wrong — edit details")}
                            </Button>
                        </DialogClose>
                        <Button
                            className="h-auto min-h-10 w-full whitespace-normal"
                            onClick={() => {
                                if (review) window.location.assign(review.url);
                            }}
                        >
                            {i18n._(
                                "Everything is correct — continue to GitHub",
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}
