import React from "react";
import { motion } from "framer-motion";

export default function Landing() {
    return (
        <div className="relative overflow-hidden">
            {/* full-page red-to-black fade backdrop */}
            <div className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-b from-red-900/40 via-black/80 to-black" />

            {/* optional ambient radial glows */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80rem_30rem_at_10%_-10%,rgba(239,68,68,0.25),transparent_55%),radial-gradient(60rem_30rem_at_110%_-20%,rgba(239,68,68,0.22),transparent_60%)]" />

            {/* top red beam */}
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-red-600/50 to-transparent blur-2xl" />

            <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mb-3 text-center text-4xl font-semibold"
            >
                <span className="neon-text">Welcome</span> — Portfolio Hub
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="mx-auto mb-8 max-w-2xl text-center text-zinc-400"
            >
                Explore technologies, projects, courses, my CV, and the Brain Box forum. Use the
                navigation above, or click the home icon anytime to return here.
            </motion.p>

            {/* Centered sample image */}
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, duration: 0.6, ease: "easeOut" }}
                className="mx-auto flex max-w-3xl items-center justify-center rounded-2xl border border-red-900/40 bg-black/60 p-4 shadow-[0_0_45px_rgba(239,68,68,0.45)]"
            >
                <img
                    src="/images/elementech_landing.png"
                    alt="Landing hero"
                    className="max-h-[55vh] w-auto rounded-lg"
                />
            </motion.div>
        </div>
    );
}
