import React, { useEffect, useState } from "react";
import { loadCV, setOverride, clearOverride } from "../../data/loaders";

export default function CMSCVPanel() {
    const [txt, setTxt] = useState("");
    const [err, setErr] = useState("");
    const [savedAt, setSavedAt] = useState(null);

    useEffect(() => {
        loadCV()
            .then((data) => {
                setTxt(JSON.stringify(data, null, 2));
                setErr("");
            })
            .catch((e) => setErr(String(e)));
    }, []);

    function onSave() {
        try {
            const parsed = JSON.parse(txt);
            setOverride("cv", parsed);
            setSavedAt(new Date().toLocaleString());
            setErr("");
            alert("CV saved (override in localStorage). Refresh the CV page to see changes.");
        } catch (e) {
            setErr("Invalid JSON: " + e.message);
        }
    }

    function onReset() {
        clearOverride("cv");
        setSavedAt(null);
        alert("CV override cleared. The app will use /data/cv.json again.");
    }

    return (
        <div
            className="rounded-2xl p-3"
            style={{
                background: "var(--panel-surface)",
                border: "1px solid var(--panel-border)",
            }}
        >
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
                <h3
                    className="text-sm font-semibold tracking-wide"
                    style={{ color: "var(--text-primary)" }}
                >

                    <div className="cv-section-title">JSON CV Editor</div>
                </h3>
                {savedAt && (
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Last saved: {savedAt}
                    </div>
                )}
            </div>

            {/* Editor */}
            <textarea
                value={txt}
                onChange={(e) => setTxt(e.target.value)}
                spellCheck={false}
                className="w-full rounded-lg font-mono text-sm outline-none resize-y"
                style={{
                    height: 420,
                    padding: "12px",
                    color: "var(--text-primary)",
                    background: "color-mix(in srgb, var(--panel-surface) 85%, black)",
                    border: "1px solid var(--panel-border)",
                    boxShadow: "inset 0 0 0 9999px transparent",
                }}
                placeholder="{ /* paste your CV JSON here */ }"
            />

            {err && (
                <div className="mt-2 text-sm" style={{ color: "var(--accent)" }}>
                    {err}
                </div>
            )}

            {/* Actions */}
            <div className="mt-3 flex gap-2">
                <button
                    onClick={onSave}
                    className="rounded-lg px-3 py-2 text-sm"
                    style={{
                        background: "color-mix(in srgb, var(--accent) 22%, transparent)",
                        border: "1px solid color-mix(in srgb, var(--accent) 55%, transparent)",
                        color: "var(--text-primary)",
                    }}
                >
                    Save CV
                </button>
                <button
                    onClick={onReset}
                    className="rounded-lg px-3 py-2 text-sm"
                    style={{
                        background: "color-mix(in srgb, var(--panel-surface) 92%, black)",
                        border: "1px solid var(--panel-border)",
                        color: "var(--text-primary)",
                    }}
                >
                    Clear Override
                </button>
            </div>

            <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                Tip: Overrides are stored client-side in <code>localStorage</code>. To persist to source
                control, copy this JSON back into <code>public/data/cv.json</code>.
            </p>
        </div>
    );
}
