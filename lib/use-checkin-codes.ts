"use client";

import { useEffect, useState } from "react";
import { loadCheckinCodes } from "./load-checkin-codes";
import type { CheckinCode } from "./qr-code";

export function useCheckinCodes() {
    const [state, setState] = useState<{
        codes: CheckinCode[] | null;
        error: string;
    }>({ codes: null, error: "" });
    const [revision, setRevision] = useState(0);
    useEffect(() => {
        let controller: AbortController | undefined;
        async function refresh() {
            if (document.visibilityState === "hidden") return;
            controller?.abort();
            const current = new AbortController();
            controller = current;
            try {
                const codes = await loadCheckinCodes(current.signal);
                if (!current.signal.aborted) setState({ codes, error: "" });
            } catch {
                if (!current.signal.aborted)
                    setState((previous) => ({
                        ...previous,
                        error: /*i18n*/ "Could not load classrooms. Please try again later.",
                    }));
            }
        }
        void refresh();
        const interval = window.setInterval(refresh, 60000);
        window.addEventListener("focus", refresh);
        document.addEventListener("visibilitychange", refresh);
        return () => {
            controller?.abort();
            window.clearInterval(interval);
            window.removeEventListener("focus", refresh);
            document.removeEventListener("visibilitychange", refresh);
        };
    }, [revision]);
    return {
        codes: state.codes ?? [],
        loading: state.codes === null && !state.error,
        error: state.error,
        retry: () => setRevision((value) => value + 1),
    };
}
