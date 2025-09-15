import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import GlowPanel from "../components/GlowPanel"
import GlowItem from "../components/GlowItem"
import { loadCourses } from "../data/loaders"

export default function Courses() {
    const [courses, setCourses] = useState([])
    useEffect(() => { loadCourses().then(setCourses) }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
        >
            <GlowPanel title="Courses">
                <div className="space-y-3">
                    {courses.map(c => (
                        <GlowItem key={c.id}>
                            <div className="truncate">
                                <span className="font-semibold">{c.title}</span>
                                <span className="text-zinc-400"> — {c.institute}</span>
                            </div>
                            <div className="mt-1 text-xs text-zinc-400">
                                {c.qualificationType} • Tech: {c.technologies.join(", ")}
                            </div>
                        </GlowItem>
                    ))}
                </div>
            </GlowPanel>
        </motion.div>
    )
}