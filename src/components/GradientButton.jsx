import React from "react"

export default function GradientButton({ children, ...props }) {
    return (
        <button
            {...props}
            className="relative rounded-xl border border-red-900/50 bg-gradient-to-b from-red-900/30 to-red-900/10 px-3 py-2 text-sm text-red-200 shadow-neon hover:shadow-neonLg"
        >
            <span className="relative z-10">{children}</span>
            <span className="pointer-events-none absolute inset-0 rounded-xl bg-red-600/10 blur-md" />
        </button>
    )
}