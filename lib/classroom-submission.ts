import { decodeMatrix, formatRoomName, type CheckinCode } from "./qr-code.ts";

export const classroomIssueURL =
    "https://github.com/thelskitproject/lskit-data/issues/new?template=add-classroom.yml";

export function createClassroomIssueURL(value: unknown) {
    const record = validateClassroomSubmission(value);
    if (!record.roomName)
        throw new Error(
            /*i18n*/ "Copy the room name exactly from the photo, excluding the room number.",
        );
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
        throw new Error(/*i18n*/ "Enter the classroom details.");
    const record = value as Record<string, unknown>;
    if (
        Object.keys(record).sort().join(",") !==
        "buildingName,matrix,roomName,roomNumber"
    )
        throw new Error(
            /*i18n*/ "Classroom details are incomplete. Please enter them again.",
        );
    function name(key: string, label: string, optional = false) {
        const text = record[key];
        if (optional && text === null) return null;
        if (
            typeof text !== "string" ||
            !text.trim() ||
            text.length > 200 ||
            /[\u0000-\u001f\u007f]/.test(text)
        )
            throw new Error(label);
        return text.trim();
    }
    const buildingName = name(
        "buildingName",
        /*i18n*/ "Please enter a building name (up to 200 characters).",
    )!;
    const roomNumber = name(
        "roomNumber",
        /*i18n*/ "Please enter a room number (up to 200 characters).",
    )!;
    const roomName = name(
        "roomName",
        /*i18n*/ "Please enter a room name (up to 200 characters).",
        true,
    );
    if (typeof record.matrix !== "string" || record.matrix.length > 5224)
        throw new Error(/*i18n*/ "Choose a photo and read its QR code first.");
    decodeMatrix(record.matrix);
    return { buildingName, roomNumber, roomName, matrix: record.matrix };
}

export function parseClassroomIssue(body: string): CheckinCode {
    if (body.length > 15000)
        throw new Error(/*i18n*/ "Issue body is too long.");
    const blocks = [...body.matchAll(/^```json\s*\n([\s\S]*?)^```\s*$/gm)];
    if (blocks.length !== 1)
        throw new Error("Provide exactly one JSON code block.");
    return validateClassroomSubmission(JSON.parse(blocks[0][1]));
}
