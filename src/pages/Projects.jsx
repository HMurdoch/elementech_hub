import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import GlowPanel from "../components/GlowPanel"
import GlowItem from "../components/GlowItem"
import { loadProjects } from "../data/loaders"

export default function Projects() {
    const [projects, setProjects] = useState([])
    useEffect(() => { loadProjects().then(setProjects) }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
        >
            <GlowPanel title="Projects">
                <div className="space-y-3">
                    {projects.map(p => (
                        <GlowItem key={p.id} right="↗" onClick={() => window.open(p.homepageUrl, "_blank")}>
                            <div className="truncate">
                                <span className="font-semibold">{p.title}</span>
                                <span className="text-zinc-400"> — {p.description}</span>
                            </div>
                        </GlowItem>
                    ))}
                </div>
            </GlowPanel>
        </motion.div>
    )
}