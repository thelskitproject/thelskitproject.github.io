import { encodeMatrix, decodeMatrix } from "./qr-code.ts";

export type QRPhotoResult = {
    matrix: string;
};

export function validateQRCodePhoto(file: Pick<File, "size" | "type">) {
    if (!file.size)
        throw new Error(/*i18n*/ "This photo is empty. Choose another photo.");
    if (file.size > 20 * 1024 * 1024)
        throw new Error(/*i18n*/ "Photos must be 20 MB or smaller.");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
        throw new Error(
            /*i18n*/ "Choose a PNG, JPEG or WebP photo. Convert HEIC photos first.",
        );
    }
}

export async function parseQRCodePhoto(file: File): Promise<QRPhotoResult> {
    validateQRCodePhoto(file);
    let bitmap: ImageBitmap;
    try {
        bitmap = await createImageBitmap(file);
    } catch {
        throw new Error(
            /*i18n*/ "Could not open this photo. Check the file or choose another photo.",
        );
    }
    try {
        if (bitmap.width * bitmap.height > 20000000)
            throw new Error(
                /*i18n*/ "This photo is too large. Resize it to 20 megapixels or less.",
            );
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext("2d");
        if (!context)
            throw new Error(/*i18n*/ "Your browser cannot read this photo.");
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
            throw new Error(
                /*i18n*/ "No QR code found. Choose a clear photo showing the entire code.",
            );
        if (results.length > 1)
            throw new Error(
                /*i18n*/ "Multiple QR codes found. Crop the photo to one code and try again.",
            );
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
        throw new Error(
            /*i18n*/ "Could not restore the complete QR code. Choose another photo.",
        );
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
    if (files.length !== 1)
        throw new Error(/*i18n*/ "Choose or drop one QR code photo at a time.");
    validateQRCodePhoto(files[0]);
    return files[0];
}
