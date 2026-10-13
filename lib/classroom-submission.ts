import { decodeMatrix, formatRoomName, type CheckinCode } from "./qr-code.ts";

export const classroomIssueURL =
    "https://github.com/thelskitproject/lskit-data/issues/new?template=add-classroom.yml";

export function createClassroomIssueURL(value: unknown) {
    const record = validateClassroomSubmission(value);
    if (!record.roomName)
        throw new Error("请照抄照片上的房间名称，不含房间号。");
    const url = new URL(classroomIssueURL);
    url.searchParams.set(
        "title",
        `[新增教室] ${formatRoomName(record.roomName, record.roomNumber)}`,
    );
    url.searchParams.set("record", JSON.stringify(record));
    return url.href;
}

export function validateClassroomSubmission(value: unknown): CheckinCode {
    if (!value || typeof value !== "object" || Array.isArray(value))
        throw new Error("请填写教室信息。");
    const record = value as Record<string, unknown>;
    if (
        Object.keys(record).sort().join(",") !==
        "buildingName,matrix,roomName,roomNumber"
    )
        throw new Error("教室信息不完整，请重新填写。");
    function name(key: string, label: string, optional = false) {
        const text = record[key];
        if (optional && text === null) return null;
        if (
            typeof text !== "string" ||
            !text.trim() ||
            text.length > 200 ||
            /[\u0000-\u001f\u007f]/.test(text)
        )
            throw new Error(`请填写${label}（最多 200 字）。`);
        return text.trim();
    }
    const buildingName = name("buildingName", "教学楼")!;
    const roomNumber = name("roomNumber", "房间号")!;
    const roomName = name("roomName", "房间名称", true);
    if (typeof record.matrix !== "string" || record.matrix.length > 5224)
        throw new Error("请先识别二维码。");
    decodeMatrix(record.matrix);
    return { buildingName, roomNumber, roomName, matrix: record.matrix };
}

export function parseClassroomIssue(body: string): CheckinCode {
    if (body.length > 15000) throw new Error("Issue 内容过长。");
    const blocks = [...body.matchAll(/^```json\s*\n([\s\S]*?)^```\s*$/gm)];
    if (blocks.length !== 1)
        throw new Error("请提供且只提供一个 json 代码块。");
    return validateClassroomSubmission(JSON.parse(blocks[0][1]));
}
