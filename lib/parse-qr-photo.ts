import { encodeMatrix, decodeMatrix } from "./qr-code.ts";

export type QRPhotoResult = {
    matrix: string;
};

export function validateQRCodePhoto(file: Pick<File, "size" | "type">) {
    if (!file.size) throw new Error("照片为空，请重新选择。");
    if (file.size > 20 * 1024 * 1024) throw new Error("照片不能超过 20 MB。");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
        throw new Error("请选择 PNG、JPEG 或 WebP 照片；HEIC 请先转换格式。");
    }
}

export async function parseQRCodePhoto(file: File): Promise<QRPhotoResult> {
    validateQRCodePhoto(file);
    let bitmap: ImageBitmap;
    try {
        bitmap = await createImageBitmap(file);
    } catch {
        throw new Error("无法读取这张照片，请检查文件或换一张图片。");
    }
    try {
        if (bitmap.width * bitmap.height > 20000000)
            throw new Error("照片分辨率过高，请缩小至 2000 万像素以内。");
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("当前浏览器无法读取照片。");
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(bitmap, 0, 0);
        const { prepareZXingModule, readBarcodes } =
            await import("zxing-wasm/reader");
        prepareZXingModule({
            overrides: {
                locateFile: (path: string) =>
                    path.endsWith(".wasm") ? "/wasm/zxing_reader.wasm" : path,
            },
        });
        const results = await readBarcodes(
            context.getImageData(0, 0, canvas.width, canvas.height),
            {
                formats: ["QRCodeModel2"],
                tryHarder: true,
                maxNumberOfSymbols: 2,
            },
        );
        if (!results.length)
            throw new Error("未识别到二维码，请换一张完整、清晰的照片。");
        if (results.length > 1)
            throw new Error("照片包含多个二维码，请裁剪为一个后再试。");
        return { matrix: binaryQRCodeFromSymbol(results[0].symbol) };
    } finally {
        bitmap.close();
    }
}

export function binaryQRCodeFromSymbol(symbol: {
    data: Uint8ClampedArray;
    width: number;
    height: number;
}) {
    const { data, width, height } = symbol;
    if (
        width !== height ||
        width < 21 ||
        width > 177 ||
        width % 4 !== 1 ||
        data.length !== width * height ||
        data.some((pixel) => pixel !== 0 && pixel !== 255)
    ) {
        throw new Error("无法提取完整的二维码模块矩阵，请换一张照片。");
    }
    const matrix = encodeMatrix(
        Array.from({ length: height }, (_, y) =>
            Array.from({ length: width }, (_, x) =>
                data[y * width + x] === 0 ? "1" : "0",
            ).join(""),
        ),
    );
    decodeMatrix(matrix);
    return matrix;
}

export function selectQRCodePhoto(files: readonly File[]) {
    if (files.length !== 1) throw new Error("请一次选择或拖入一张二维码照片。");
    validateQRCodePhoto(files[0]);
    return files[0];
}
