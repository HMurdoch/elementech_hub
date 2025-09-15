import React from "react";
export default function AnimatedSystemGraphic() {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="pointer-events-none absolute -top-1/2 left-1/2 -translate-x-1/2 rounded-full blur-3xl"
                 style={{ width: "140vmax", height: "140vmax", background: "radial-gradient(circle, rgba(239,68,68,0.4) 0%, transparent 60%)" }} />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-500/20 animate-[spin_60s_linear_infinite]" />
            <div className="pointer-events-none absolute bottom-8 left-8 h-24 w-24 rounded-full bg-red-500/20 blur-xl animate-[pulse_5s_ease-in-out_infinite]" />
        </div>
    );
}