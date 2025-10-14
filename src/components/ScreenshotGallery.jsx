import React, { useState } from "react";

import technologiesVanillaJSScreenshot01 from '../images/vanilla_js/screenshot-01.png'; 
import technologiesVanillaJSScreenshot02 from '../images/vanilla_js/screenshot-02.png';
import technologiesVanillaJSScreenshot03 from '../images/vanilla_js/screenshot-03.png'; 

const vanillaJSScreenshots = [
    {
        id: 1,
        src: technologiesVanillaJSScreenshot01,
        caption: "Initial UI",
    },
    {
        id: 2,
        src: technologiesVanillaJSScreenshot02,
        caption: "Tabs example",
    },
    {
        id: 3,
        src: technologiesVanillaJSScreenshot03,
        caption: "Dynamic content",
    },
];

export default function ScreenshotGallery({ shots = [vanillaJSScreenshots] }) {
    const [active, setActive] = useState(null);
    const panel = "rounded-2xl border border-zinc-800/70 bg-zinc-900/70 backdrop-blur p-3";

    return (
        <div className={panel}>
            <div className="mb-2 text-sm font-semibold tracking-wide text-red-300"></div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {shots.length ? (
                    shots.map(s => (
                        <button key={s.id} className="group overflow-hidden rounded-xl border border-zinc-800/70" onClick={() => setActive(s)}>
                            <img src={s.src} alt={s.caption || "screenshot"} className="h-28 w-full object-cover transition duration-300 group-hover:scale-105" />
                            {s.caption && <div className="truncate px-2 py-1 text-xs text-zinc-400">{s.caption}</div>}
                        </button>
                    ))
                ) : (
                    <div className="col-span-full py-6 text-center text-sm text-zinc-500">Add screenshots to this project.</div>
                )}
            </div>

            {active && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" onClick={() => setActive(null)}>
                    <img src={active.src} alt={active.caption || "screenshot"} className="max-h-[85vh] max-w-[90vw] rounded-xl shadow-2xl" />
                    {active.caption && <div className="mt-3 text-sm text-zinc-300">{active.caption}</div>}
                </div>
            )}
        </div>
    );
}