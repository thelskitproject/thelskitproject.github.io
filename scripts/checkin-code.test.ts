import { test } from "node:test";
import assert from "node:assert/strict";
import QRCode from "qrcode";
import sharp from "sharp";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadCheckinCodes } from "../lib/load-checkin-codes.ts";

test("live data refreshes on each request and rejects invalid responses", async (t) => {
    const [record] = JSON.parse(
        await readFile(
            new URL("../data/checkin-codes.json", import.meta.url),
            "utf8",
        ),
    );
    let records: unknown = [record];
    let status = 200;
    t.mock.method(
        globalThis,
        "fetch",
        async (url: string, options: RequestInit) => {
            assert.ok(
                url.startsWith(
                    "https://raw.githubusercontent.com/thelskitproject/lskit-data/main/checkin-codes.min.json?",
                ),
            );
            assert.equal(options.cache, "no-store");
            return new Response(JSON.stringify(records), { status });
        },
    );
    assert.equal(
        (await loadCheckinCodes())[0].buildingName,
        record.buildingName,
    );
    records = [{ ...record, buildingName: "New building" }];
    assert.equal((await loadCheckinCodes())[0].buildingName, "New building");
    records = {};
    await assert.rejects(loadCheckinCodes);
    records = [record, record];
    await assert.rejects(loadCheckinCodes);
    records = [{ ...record, matrix: "invalid" }];
    await assert.rejects(loadCheckinCodes);
    status = 503;
    await assert.rejects(loadCheckinCodes);
});
import {
    parseClassroomIssue,
    validateClassroomSubmission,
    createClassroomIssueURL,
} from "../lib/classroom-submission.ts";

test("issue submissions preserve the binary matrix and reject extra fields", async () => {
    const entries = JSON.parse(
        await readFile(
            new URL("../data/checkin-codes.json", import.meta.url),
            "utf8",
        ),
    );
    const record = entries[0];
    const url = new URL(
        createClassroomIssueURL({
            ...record,
            buildingName: "教学楼 & North + Wing",
        }),
    );
    assert.equal(url.pathname, "/thelskitproject/lskit-data/issues/new");
    assert.equal(url.searchParams.get("template"), "add-classroom.yml");
    assert.deepEqual(JSON.parse(url.searchParams.get("record")!), {
        ...record,
        buildingName: "教学楼 & North + Wing",
    });
    assert.ok(url.searchParams.get("title")!.startsWith("[新增教室]"));
    assert.throws(() => createClassroomIssueURL({ ...record, roomNumber: "" }));
    const body = `### 教室记录\n\n\`\`\`json\n${JSON.stringify(record)}\n\`\`\``;
    assert.deepEqual(parseClassroomIssue(body), record);
    assert.throws(() => parseClassroomIssue(body + "\n" + body));
    assert.throws(() => parseClassroomIssue("not JSON"));
    assert.throws(() =>
        validateClassroomSubmission({ ...record, payload: "unwanted" }),
    );
    assert.throws(() =>
        validateClassroomSubmission({ ...record, matrix: "invalid" }),
    );
    assert.throws(() =>
        validateClassroomSubmission({ ...record, buildingName: " " }),
    );
    assert.throws(() =>
        validateClassroomSubmission({ ...record, roomNumber: "bad\nname" }),
    );
    assert.equal(
        validateClassroomSubmission({ ...record, roomName: null }).roomName,
        null,
    );
});
import {
    decodeImage,
    decodePerspectiveImage,
    verifyRestore,
    importCheckinCode,
    parseImportArgs,
} from "./import-checkin-code.ts";
import {
    decodeMatrix,
    encodeMatrix,
    matchesCheckinCode,
} from "../lib/qr-code.ts";

function expectedMatrix(code: QRCode.QRCode) {
    return Array.from({ length: code.modules.size }, (_, y) =>
        Array.from({ length: code.modules.size }, (_, x) =>
            code.modules.get(y, x) ? "1" : "0",
        ).join(""),
    );
}

const cases: [string, QRCode.QRCodeSegment[]][] = [
    ["numeric", [{ mode: "numeric", data: "001234567890" }]],
    ["alphanumeric", [{ mode: "alphanumeric", data: "LEEDS ROOM 2.01" }]],
    [
        "UTF-8 byte",
        [
            {
                mode: "byte",
                data: Buffer.from("https://example.org/签到?room=2.01"),
            },
        ],
    ],
    [
        "binary byte",
        [{ mode: "byte", data: Uint8Array.from([0, 255, 128, 1, 42]) }],
    ],
    [
        "mixed",
        [
            { mode: "alphanumeric", data: "LEEDS" },
            { mode: "byte", data: Buffer.from("room=2.01") },
        ],
    ],
];

for (const [name, segments] of cases) {
    test(`${name}: exact source pattern and payload`, async () => {
        const options: QRCode.QRCodeToBufferOptions = {
            errorCorrectionLevel: "H",
            scale: 8,
        };
        const qr = await decodeImage(await QRCode.toBuffer(segments, options));
        verifyRestore(qr.matrix, qr.decoded);
        assert.deepEqual(
            decodeMatrix(qr.matrix),
            expectedMatrix(QRCode.create(segments, options)),
        );
        assert.equal(
            decodeMatrix(qr.matrix).length,
            17 + 4 * qr.decoded.version,
        );
        if (name === "binary byte")
            assert.deepEqual(qr.decoded.binaryData, [0, 255, 128, 1, 42]);
    });
}

test("all eight masks and four correction levels retain identical modules", async () => {
    for (const level of ["L", "M", "Q", "H"] as const) {
        for (let mask = 0; mask < 8; mask++) {
            const options: QRCode.QRCodeToBufferOptions = {
                errorCorrectionLevel: level,
                maskPattern: mask as QRCode.QRCodeMaskPattern,
                scale: 8,
            };
            const text = "https://example.org/checkin?building=test&room=001";
            const qr = await decodeImage(await QRCode.toBuffer(text, options));
            verifyRestore(qr.matrix, qr.decoded);
            assert.deepEqual(
                decodeMatrix(qr.matrix),
                expectedMatrix(QRCode.create(text, options)),
                `${level}/${mask}`,
            );
        }
    }
});

test("Kanji preserves pattern and Shift-JIS bytes", async () => {
    const segments: QRCode.QRCodeSegment[] = [{ mode: "kanji", data: "漢字" }];
    const options = {
        scale: 8,
        toSJISFunc: (character: string) =>
            ({ 漢: 0x8abf, 字: 0x8e9a })[character] ?? 0,
    };
    const qr = await decodeImage(await QRCode.toBuffer(segments, options));
    verifyRestore(qr.matrix, qr.decoded);
    assert.deepEqual(
        decodeMatrix(qr.matrix),
        expectedMatrix(QRCode.create(segments, options)),
    );
    assert.deepEqual(qr.decoded.binaryData, [0x8a, 0xbf, 0x8e, 0x9a]);
});

test("rotation, JPEG and tinted background preserve original modules", async () => {
    const text = "https://example.org/room/001";
    const options = {
        errorCorrectionLevel: "M" as const,
        scale: 10,
        color: { dark: "#153045", light: "#f1eee0" },
    };
    const source = await QRCode.toBuffer(text, options);
    const photograph = await sharp(source)
        .rotate(12, { background: "#f1eee0" })
        .jpeg({ quality: 85 })
        .toBuffer();
    const qr = await decodeImage(photograph);
    verifyRestore(qr.matrix, qr.decoded);
    assert.deepEqual(
        decodeMatrix(qr.matrix),
        expectedMatrix(QRCode.create(text, options)),
    );
});

test("invalid images and matrices fail", async () => {
    await assert.rejects(() => decodeImage(Buffer.from("not an image")));
    const qr = await decodeImage(await QRCode.toBuffer("example"));
    const changed = structuredClone(qr);
    changed.decoded.binaryData[0] ^= 1;
    assert.throws(
        () => verifyRestore(changed.matrix, changed.decoded),
        /校验失败/,
    );
    changed.matrix = "invalid";
    assert.throws(() => decodeMatrix(changed.matrix), /矩阵无效/);
});

test("file import is atomic, keeps room strings, and rejects duplicates", async () => {
    const directory = await mkdtemp(join(tmpdir(), "lskit-qr-"));
    try {
        const destination = join(directory, "codes.json");
        await writeFile(destination, "[]\n");
        const image = await QRCode.toBuffer(
            "https://example.org/checkin?room=001",
        );
        await importCheckinCode(
            image,
            " Test Building ",
            "001",
            "Edit 1",
            destination,
        );
        const saved = await readFile(destination, "utf8");
        const [entry] = JSON.parse(saved);
        assert.equal(entry.buildingName, "Test Building");
        assert.equal(entry.roomNumber, "001");
        assert.equal(entry.roomName, "Edit 1");
        assert.deepEqual(Object.keys(entry).sort(), [
            "buildingName",
            "matrix",
            "roomName",
            "roomNumber",
        ]);
        verifyRestore(entry.matrix);
        await assert.rejects(
            () =>
                importCheckinCode(
                    image,
                    "test building",
                    "001",
                    "Edit 1",
                    destination,
                ),
            /已有记录/,
        );
        await assert.rejects(() =>
            importCheckinCode(
                Buffer.from("bad"),
                "Other",
                "002",
                null,
                destination,
            ),
        );
        assert.equal(await readFile(destination, "utf8"), saved);
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
});

test("versions 1, 7, 10, 27 and 40 preserve every module", async () => {
    for (const version of [1, 7, 10, 27, 40]) {
        const options = { version, scale: 6 };
        const qr = await decodeImage(await QRCode.toBuffer("LEEDS", options));
        verifyRestore(qr.matrix, qr.decoded);
        assert.deepEqual(
            decodeMatrix(qr.matrix),
            expectedMatrix(QRCode.create("LEEDS", options)),
        );
    }
});

test("perspective extraction preserves source pattern", async () => {
    const code = QRCode.create("https://example.org/room/001", { version: 5 });
    const width = 600;
    const pixels = Buffer.alloc(width * width * 4, 255);
    for (let y = 0; y < width; y++) {
        for (let x = 0; x < width; x++) {
            // Inverse of x=(420u+40v+60)/(0.2u+0.1v+1), y=(20u+430v+70)/(0.2u+0.1v+1).
            const a = 420 - 0.2 * x;
            const b = 40 - 0.1 * x;
            const c = 20 - 0.2 * y;
            const d = 430 - 0.1 * y;
            const determinant = a * d - b * c;
            const u = ((x - 60) * d - b * (y - 70)) / determinant;
            const v = (a * (y - 70) - (x - 60) * c) / determinant;
            if (
                u >= 0 &&
                u < 1 &&
                v >= 0 &&
                v < 1 &&
                code.modules.get(
                    Math.floor(v * code.modules.size),
                    Math.floor(u * code.modules.size),
                )
            ) {
                const offset = (y * width + x) * 4;
                pixels.fill(0, offset, offset + 3);
            }
        }
    }
    const image = await sharp(pixels, {
        raw: { width, height: width, channels: 4 },
    })
        .png()
        .toBuffer();
    const qr = await decodeImage(image);
    verifyRestore(qr.matrix, qr.decoded);
    assert.deepEqual(decodeMatrix(qr.matrix), expectedMatrix(code));
    const { data, info } = await sharp(image)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    const corrected = await decodePerspectiveImage(
        new Uint8ClampedArray(data),
        info.width,
        info.height,
    );
    assert.deepEqual(decodeMatrix(corrected.matrix), expectedMatrix(code));
});

test("packed Base64 rejects truncated bytes and nonzero padding", async () => {
    const qr = await decodeImage(await QRCode.toBuffer("LEEDS"));
    assert.deepEqual(
        decodeMatrix(encodeMatrix(decodeMatrix(qr.matrix))),
        decodeMatrix(qr.matrix),
    );
    const bytes = Buffer.from(qr.matrix, "base64");
    assert.throws(
        () => decodeMatrix(bytes.subarray(1).toString("base64")),
        /矩阵无效/,
    );
    bytes[bytes.length - 1] |= 1;
    assert.throws(() => decodeMatrix(bytes.toString("base64")), /矩阵无效/);
});

test("unified search matches all room fields and combined terms", () => {
    const entry = {
        buildingName: "Clothworkers North Building",
        roomNumber: "G.06",
        roomName: "Edit 1",
        matrix: "",
    };
    for (const query of [
        "",
        "   ",
        "CLOTHWORKERS",
        "g.06",
        "Edit 1",
        "  north   edit  G.06 ",
    ]) {
        assert.equal(matchesCheckinCode(entry, query), true, query);
    }
    assert.equal(matchesCheckinCode(entry, "north G.07"), false);
    assert.equal(
        matchesCheckinCode({ ...entry, roomName: null }, "Edit"),
        false,
    );
});

test("named import arguments are order-independent and preserve room numbers", () => {
    const expected = {
        image: "qr.png",
        buildingName: "North Building",
        roomNumber: "001",
        roomName: "Edit 1",
    };
    assert.deepEqual(
        parseImportArgs([
            "qr.png",
            "--room-name",
            "Edit 1",
            "--room-number",
            "001",
            "--building-name",
            "North Building",
        ]),
        expected,
    );
    assert.deepEqual(
        parseImportArgs([
            "--building-name=North Building",
            "--room-number=001",
            "qr.png",
            "--room-name=Edit 1",
        ]),
        expected,
    );
    assert.equal(
        parseImportArgs([
            "qr.png",
            "--building-name",
            "North",
            "--room-number",
            "001",
        ]).roomName,
        null,
    );
});

test("import arguments reject missing, duplicate, unknown and empty values", () => {
    const valid = [
        "qr.png",
        "--building-name",
        "North",
        "--room-number",
        "001",
    ];
    for (const args of [
        [],
        ["qr.png"],
        [...valid, "--room-number", "002"],
        [...valid, "--unknown", "value"],
        [...valid, "second.png"],
        [...valid, "--room-name", "  "],
        [...valid, "--room-name"],
    ]) {
        assert.throws(() => parseImportArgs(args));
    }
});

test("perspective detector rejects multiple QR codes instead of choosing one", async () => {
    const first = await QRCode.toBuffer("first", { scale: 8 });
    const second = await QRCode.toBuffer("second", { scale: 8 });
    const image = await sharp({
        create: { width: 600, height: 300, channels: 4, background: "white" },
    })
        .composite([
            { input: first, left: 10, top: 10 },
            { input: second, left: 320, top: 10 },
        ])
        .raw()
        .toBuffer();
    await assert.rejects(
        () => decodePerspectiveImage(new Uint8ClampedArray(image), 600, 300),
        /一个二维码/,
    );
});

test("photo upload rejects empty, oversized and unsupported files", async () => {
    const { validateQRCodePhoto } = await import("../lib/parse-qr-photo.ts");
    for (const type of ["image/png", "image/jpeg", "image/webp"]) {
        assert.doesNotThrow(() => validateQRCodePhoto({ type, size: 1024 }));
    }
    assert.throws(
        () => validateQRCodePhoto({ type: "image/png", size: 0 }),
        /为空/,
    );
    assert.throws(
        () =>
            validateQRCodePhoto({
                type: "image/png",
                size: 20 * 1024 * 1024 + 1,
            }),
        /20 MB/,
    );
    assert.throws(
        () => validateQRCodePhoto({ type: "image/heic", size: 1024 }),
        /转换格式/,
    );
});

test("building selection combines with search and an empty selection includes all", () => {
    const entry = {
        buildingName: "North",
        roomName: "Edit 1",
        roomNumber: "001",
        matrix: "",
    };
    assert.equal(matchesCheckinCode(entry, "Edit", []), true);
    assert.equal(matchesCheckinCode(entry, "Edit", ["South", "North"]), true);
    assert.equal(matchesCheckinCode(entry, "Edit", ["South"]), false);
    assert.equal(matchesCheckinCode(entry, "missing", ["North"]), false);
});

test("browser extraction returns the source binary pattern and rejects invalid symbols", async () => {
    const { binaryQRCodeFromSymbol } = await import("../lib/parse-qr-photo.ts");
    const source = QRCode.create("not exposed in browser", {
        maskPattern: 4,
        errorCorrectionLevel: "Q",
    });
    const rows = expectedMatrix(source);
    const size = source.modules.size;
    const pixels = Uint8ClampedArray.from(rows.join(""), (bit) =>
        bit === "1" ? 0 : 255,
    );
    const matrix = binaryQRCodeFromSymbol({
        data: pixels,
        width: size,
        height: size,
    });
    assert.deepEqual(decodeMatrix(matrix), rows);
    assert.throws(
        () =>
            binaryQRCodeFromSymbol({
                data: pixels,
                width: size,
                height: size + 1,
            }),
        /完整/,
    );
    assert.throws(
        () =>
            binaryQRCodeFromSymbol({
                data: pixels.subarray(1),
                width: size,
                height: size,
            }),
        /完整/,
    );
    pixels[0] = 128;
    assert.throws(
        () =>
            binaryQRCodeFromSymbol({ data: pixels, width: size, height: size }),
        /完整/,
    );
});

test("photo picker and drop input share single-file validation", async () => {
    const { selectQRCodePhoto } = await import("../lib/parse-qr-photo.ts");
    const photo = new File(["image"], "a long photo name.png", {
        type: "image/png",
    });
    assert.equal(selectQRCodePhoto([photo]), photo);
    assert.throws(() => selectQRCodePhoto([]), /一张/);
    assert.throws(() => selectQRCodePhoto([photo, photo]), /一张/);
    assert.throws(
        () =>
            selectQRCodePhoto([
                new File(["text"], "wrong.txt", { type: "text/plain" }),
            ]),
        /请选择/,
    );
});
