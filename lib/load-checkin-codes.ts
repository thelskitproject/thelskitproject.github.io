import { validateClassroomSubmission } from "./classroom-submission.ts";

const dataURL =
    "https://raw.githubusercontent.com/thelskitproject/lskit-data/main/checkin-codes.min.json";

export async function loadCheckinCodes(signal?: AbortSignal) {
    const timeout = AbortSignal.timeout(15000);
    const response = await fetch(`${dataURL}?t=${Date.now()}`, {
        cache: "no-store",
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
    if (!response.ok)
        throw new Error(
            /*i18n*/ "Could not load classrooms. Please try again later.",
        );
    const records: unknown = await response.json();
    if (!Array.isArray(records))
        throw new Error(/*i18n*/ "Classroom data is unavailable.");
    const codes = records.map(validateClassroomSubmission);
    const keys = codes.map(
        (entry) =>
            `${entry.buildingName.toLowerCase()}\0${entry.roomNumber.toLowerCase()}`,
    );
    if (new Set(keys).size !== keys.length)
        throw new Error(/*i18n*/ "Classroom data is unavailable.");
    return codes;
}
