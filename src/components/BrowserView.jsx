import React, { useEffect, useState } from "react";

export default function BrowserView({ url }) {
    const [src, setSrc] = useState(url);
    useEffect(() => setSrc(url), [url]);

    return (
        <div className="overflow-hidden rounded-2xl border border-red-900/40 bg-zinc-950/80 shadow-[0_0_25px_rgba(239,68,68,0.45)] glow-panel">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                    <span className="inline-block h-2 w-2 rounded-full bg-yellow-500" />
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                    <span className="mx-2 h-4 w-px bg-zinc-800" />
                    <span className="truncate max-w-[42ch]">{src}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="h-7 rounded border border-zinc-700 bg-zinc-800 px-3" onClick={() => setSrc(src)}>Reload</button>
                    <button className="h-7 rounded border border-zinc-700 bg-zinc-800 px-3" onClick={() => window.open(src, "_blank")}>
                        Open in new tab
                    </button>
                </div>
            </div>
            <div className="h-[52vh] w-full bg-zinc-900">
                <iframe
                    title="app-browser"
                    src={src}
                    className="h-full w-full"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-downloads"
                />
            </div>
        </div>
    );
}