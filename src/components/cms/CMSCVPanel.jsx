import React, { useEffect, useState } from "react";
import { loadCV, setOverride, clearOverride } from "../../data/loaders";

export default function CMSCVPanel() {
    const [txt, setTxt] = useState("");
    const [err, setErr] = useState("");
    const [savedAt, setSavedAt] = useState(null);

    useEffect(() => {
        loadCV().then(data => {
            setTxt(JSON.stringify(data, null, 2));
            setErr("");
        }).catch(e => setErr(String(e)));
    }, []);

    function onSave() {
        try {
            const parsed = JSON.parse(txt);
            setOverride("cv", parsed);
            setSavedAt(new Date().toLocaleString());
            setErr("");
            alert("CV saved (override in localStorage). Refresh CV page to see changes.");
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
        <div className="rounded-2xl border border-red-900/40 bg-zinc-900/40 p-3">
            <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wide text-red-300">CV Editor (JSON)</h3>
                {savedAt && <div className="text-xs text-zinc-400">Last saved: {savedAt}</div>}
            </div>

            <textarea
                value={txt}
                onChange={e => setTxt(e.target.value)}
                spellCheck={false}
                className="h-[420px] w-full resize-y rounded-lg border border-zinc-800 bg-black/60 p-3 font-mono text-sm text-zinc-200 outline-none focus:border-red-700"
                placeholder="{ /* paste your CV JSON here */ }"
            />
            {err && <div className="mt-2 text-sm text-red-300">{err}</div>}

            <div className="mt-3 flex gap-2">
                <button
                    onClick={onSave}
                    className="rounded-lg border border-red-900/60 bg-red-900/30 px-3 py-2 text-sm text-red-100 hover:border-red-600 hover:bg-red-900/40"
                >
                    Save CV
                </button>
                <button
                    onClick={onReset}
                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
                >
                    Clear Override
                </button>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
                Tip: Overrides are stored client-side in <code>localStorage</code>. To persist to source control,
                copy this JSON back into <code>public/data/cv.json</code>.
            </p>
        </div>
    );
}
