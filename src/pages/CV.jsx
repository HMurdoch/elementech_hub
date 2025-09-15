import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import GlowPanel from "../components/GlowPanel"
import GlowItem from "../components/GlowItem"
import { loadCV } from "../data/loaders"

export default function CV() {
    const [cv, setCv] = useState(null)
    useEffect(() => { loadCV().then(setCv) }, [])
    if (!cv) return <p>Loading…</p>

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, ease: "easeOut" }}
            >
                <GlowPanel title="Details">
                    <div className="text-zinc-200">{cv.details}</div>
                </GlowPanel>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
            >
                <GlowPanel title="Position Looking For">
                    <div className="text-zinc-200">{cv.position}</div>
                </GlowPanel>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
            >
                <GlowPanel title="Education">
                    <div className="space-y-3">
                        {cv.education.map((e, i) => (
                            <GlowItem key={i}>
                                <div className="truncate">
                                    <span className="font-semibold">{e.course}</span>
                                    <span className="text-zinc-400"> — {e.institute}</span>
                                </div>
                                {e.subjects?.length ? (
                                    <div className="mt-1 text-xs text-zinc-400">
                                        Subjects: {e.subjects.join(", ")}
                                    </div>
                                ) : null}
                            </GlowItem>
                        ))}
                    </div>
                </GlowPanel>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 0.15 }}
            >
                <GlowPanel title="Work Experience">
                    <div className="space-y-3">
                        {cv.experience.map((w, i) => (
                            <GlowItem key={i}>
                                <div className="truncate">
                                    <span className="font-semibold">{w.company}</span>
                                    <span className="text-zinc-400"> — {w.from}–{w.to}</span>
                                </div>
                                <div className="mt-1 text-sm text-zinc-300">{w.description}</div>
                                {w.technologies?.length ? (
                                    <div className="mt-1 text-xs text-zinc-400">
                                        Tech: {w.technologies.join(", ")}
                                    </div>
                                ) : null}
                            </GlowItem>
                        ))}
                    </div>
                </GlowPanel>
            </motion.div>
        </div>
    )
}
