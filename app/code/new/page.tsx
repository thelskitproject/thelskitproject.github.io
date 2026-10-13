"use client";

import { useRef, useState } from "react";
import Link from "next/link";
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
                        : "无法识别这张照片，请重试。",
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
                    : "无法准备记录，请检查教室信息。",
            );
        }
    }
    return (
        <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
            <Button variant="ghost" asChild className="-ml-3">
                <Link href="/code">
                    <IconArrowLeft aria-hidden="true" />
                    返回教室列表
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                    分享教室二维码
                </h1>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    填写教室信息，选择照片并确认二维码。
                </p>
            </div>
            <div className="grid items-start gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <h2>教室信息</h2>
                            </CardTitle>
                            <CardDescription>
                                选择教学楼，也可以输入新名称。
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="building-name">教学楼</Label>
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
                                        placeholder="选择或输入教学楼名称"
                                    />
                                    <ComboboxContent>
                                        <ComboboxEmpty>
                                            使用输入的新名称。
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
                                        教学楼列表暂时无法加载，可直接输入。
                                        <Button
                                            variant="link"
                                            size="sm"
                                            onClick={retry}
                                        >
                                            重试
                                        </Button>
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="room-name">房间名称</Label>
                                <Input
                                    id="room-name"
                                    required
                                    maxLength={200}
                                    aria-describedby="room-name-help"
                                    value={roomName}
                                    onChange={(event) =>
                                        setRoomName(event.target.value)
                                    }
                                    placeholder="照抄照片上的房间名称"
                                />
                                <p
                                    id="room-name-help"
                                    className="text-xs leading-6 text-muted-foreground"
                                >
                                    照抄照片上的文字，不含房间号；不要缩写或翻译。
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="room-number">房间号</Label>
                                <Input
                                    id="room-number"
                                    value={roomNumber}
                                    onChange={(event) =>
                                        setRoomNumber(event.target.value)
                                    }
                                    placeholder="例如 G.06 或 7M.02"
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <h2>二维码照片</h2>
                            </CardTitle>
                            <CardDescription>照片不会上传。</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <input
                                ref={photoInput}
                                id="qr-photo"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                aria-label="选择二维码照片"
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
                                            ? "松开即可"
                                            : file
                                              ? "拖入或点击更换照片"
                                              : "拖入二维码照片，或点击选择"}
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
                                            {busy ? "正在识别…" : "已选择照片"}
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
                                支持 PNG、JPG、WebP，最大 20
                                MB。请拍清完整二维码。
                            </p>

                            {error && (
                                <p
                                    role="alert"
                                    className="text-sm text-destructive"
                                >
                                    {error}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <h2>二维码预览</h2>
                        </CardTitle>
                        {(roomName.trim() || roomNumber.trim()) && (
                            <CardDescription>
                                {formatRoomName(roomName, roomNumber)}
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
                                    识别成功，请核对二维码。
                                </p>
                                <QRCodeCanvas
                                    matrix={matrix}
                                    label="二维码预览"
                                />
                            </>
                        ) : (
                            <div
                                role="status"
                                className="rounded-lg border border-dashed px-6 py-16 text-center text-sm leading-7 text-muted-foreground"
                            >
                                {busy
                                    ? "正在识别…"
                                    : "选择或拖入照片后，将自动识别二维码。"}
                            </div>
                        )}
                        <div className="text-xs leading-6 text-muted-foreground">
                            <p>提交需要 GitHub 账号</p>
                            <p>
                                上传即代表你同意
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            className="inline rounded-sm text-foreground underline underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            教室二维码共享条款
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        align="start"
                                        className="w-80 max-w-[calc(100vw-2rem)] max-h-[min(28rem,70vh)] overflow-y-auto space-y-3 text-xs leading-6"
                                    >
                                        <h3 className="text-sm font-medium">
                                            教室二维码共享条款
                                        </h3>
                                        <p>
                                            教室信息、二维码和你的 GitHub
                                            账号会公开显示，照片不会上传。请勿提交个人信息、私人凭证或不允许公开分享的二维码。
                                        </p>
                                        <p>
                                            提交即表示你有权公开分享这些信息，并已核对教室名称、房间号和二维码。请遵守学校规定，对提交内容负责。
                                        </p>
                                        <p>
                                            LSKit
                                            并非学校官方服务，不保证二维码正确或持续有效，请自行核实。请勿冒用身份、代签或违反学校规定。在法律允许的范围内，项目不承担因信息错误、失效或不当使用造成的损失；法律规定不得免除的责任除外。
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
                            提交教室记录
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
                        <DialogTitle>这些信息都正确吗？</DialogTitle>
                        <DialogDescription>
                            请核对教学楼、房间名称和房间号是否正确。
                        </DialogDescription>
                    </DialogHeader>
                    {review && (
                        <dl className="space-y-4 text-sm">
                            <div>
                                <dt className="text-muted-foreground">
                                    教学楼
                                </dt>
                                <dd className="mt-1 break-words font-medium">
                                    {review.buildingName}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">
                                    房间名称
                                </dt>
                                <dd className="mt-1 break-words font-medium">
                                    {review.roomName}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">
                                    房间号
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
                                有点问题，修改信息
                            </Button>
                        </DialogClose>
                        <Button
                            className="h-auto min-h-10 w-full whitespace-normal"
                            onClick={() => {
                                if (review) window.location.assign(review.url);
                            }}
                        >
                            都是对的，跳转GitHub添加二维码
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}
