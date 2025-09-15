import React from "react"
import { motion } from "framer-motion"

export default function GlowItem({ children, right, onClick }) {
    return (
        <motion.button
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            onClick={onClick}
            className="group w-full rounded-xl border border-red-900/40 bg-zinc-900/40 px-3 py-3 text-left shadow-innerNeon hover:border-red-700/60"
        >
            <div className="flex items-center justify-between gap-3">
                <div className="text-zinc-200">{children}</div>
                <div className="text-zinc-400 group-hover:text-red-200 transition">
                    {right ?? "›"}
                </div>
            </div>
            {/* animated shine sweep on hover */}
            <span className="pointer-events-none absolute inset-y-0 -left-10 w-14 -skew-x-12 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 animate-shine" />
        </motion.button>
    )
}