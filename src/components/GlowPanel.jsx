import React from "react"

export default function GlowPanel({ title, children, className = "" }) {
    return (
        <div
            className={`relative rounded-2xl border border-red-900/40 bg-black/60 shadow-neon p-3 ${className}`}
        >
            {/* outer glow ring */}
            <div className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-red-600/15 blur-xl" />
            <div className="relative z-10">
                {title ? (
                    <div className="mb-2 flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                        <h2 className="text-sm font-semibold text-red-200">{title}</h2>
                    </div>
                ) : null}
                {children}
            </div>
        </div>
    )
}