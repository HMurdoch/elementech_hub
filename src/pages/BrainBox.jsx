import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import GlowPanel from "../components/GlowPanel"
import GlowItem from "../components/GlowItem"
import { loadBrainbox } from "../data/loaders"

export default function BrainBox() {
    const [ideas, setIdeas] = useState([])
    useEffect(() => { loadBrainbox().then(setIdeas) }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
        >

            <div align="center">
                <img src="/images/under_construction.svg" className="w-1/4 h-auto" />
            </div>

            <GlowPanel title="Brain Box — Ideas">
                <div className="space-y-3">
                    {ideas.map((idea, i) => (
                        <GlowItem key={i}>
                            <div className="truncate">
                                <span className="font-semibold">{idea.heading}</span>
                                <span className="text-zinc-400">
                                    {" "}
                                    — Tech: {idea.technologies.join(", ")}
                                </span>
                            </div>
                            <div className="mt-1 text-sm text-zinc-300">{idea.overview}</div>
                        </GlowItem>
                    ))}
                </div>
            </GlowPanel>
        </motion.div>
    )
}