"use client";

import { useEffect, useMemo, useRef } from "react";
import { decodeMatrix } from "@/lib/qr-code";

export function QRCodeCanvas({
    matrix,
    label,
}: {
    matrix: string;
    label: string;
}) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const rows = useMemo(() => decodeMatrix(matrix), [matrix]);
    const size = rows.length;
    useEffect(() => {
        const context = canvas.current?.getContext("2d");
        if (!context) return;
        const scale = 8;
        context.fillStyle = "white";
        context.fillRect(0, 0, (size + 8) * scale, (size + 8) * scale);
        context.fillStyle = "black";
        rows.forEach((row, y) => {
            Array.from(row).forEach((bit, x) => {
                if (bit === "1")
                    context.fillRect(
                        (x + 4) * scale,
                        (y + 4) * scale,
                        scale,
                        scale,
                    );
            });
        });
    }, [rows, size]);
    return (
        <canvas
            ref={canvas}
            width={(size + 8) * 8}
            height={(size + 8) * 8}
            role="img"
            aria-label={label}
            className="mx-auto h-auto w-full max-w-96 [image-rendering:pixelated]"
        >
            {label}，请使用支持 Canvas 的浏览器。
        </canvas>
    );
}
