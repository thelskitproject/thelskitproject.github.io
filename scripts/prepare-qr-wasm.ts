import { copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const directory = new URL("../public/wasm/", import.meta.url);
await mkdir(directory, { recursive: true });
await copyFile(
    createRequire(import.meta.url).resolve(
        "zxing-wasm/reader/zxing_reader.wasm",
    ),
    fileURLToPath(new URL("zxing_reader.wasm", directory)),
);
