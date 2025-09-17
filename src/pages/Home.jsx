// src/pages/Home.jsx
import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import GlowPanel from "../components/GlowPanel"
import { loadTechnologies } from "../data/loaders"

// Normalize tech objects
function asTechObject(item) {
    if (typeof item === "string") return { name: item, summary: "", examples: [] }
    const { name, title, summary = "", examples = [] } = item || {}
    return {
        name: name || title || "Untitled",
        summary,
        examples: Array.isArray(examples) ? examples : []
    }
}

// Merge duplicates (string + object)
function normalizeAndDedup(list) {
    const map = new Map()
    for (const raw of list) {
        const t = asTechObject(raw)
        const key = t.name.trim().toLowerCase()
        const prev = map.get(key)
        if (!prev) {
            map.set(key, t)
        } else {
            map.set(key, {
                name: prev.name || t.name,
                summary: t.summary || prev.summary,
                examples: (t.examples && t.examples.length ? t.examples : prev.examples) || []
            })
        }
    }
    return Array.from(map.values())
}

function TechRow({ tech }) {
    const [open, setOpen] = useState(false)
    const nav = useNavigate()

    return (
        <div className="rounded-xl border border-red-900/40 bg-zinc-900/40 p-3 shadow-innerNeon">
            <button
                onClick={() => setOpen(v => !v)}
                className="flex w-full items-center justify-between text-left"
            >
                <div>
                    <div className="font-semibold text-zinc-100">{tech.name}</div>
                    {tech.summary ? (
                        <div className="text-sm text-zinc-400">{tech.summary}</div>
                    ) : null}
                </div>
                <span className="text-zinc-400">{open ? "-" : "+"}</span>
            </button>

            {open && (
                <div className="mt-3 space-y-2">
                    {tech.examples?.length ? (
                        <ul className="grid gap-2 md:grid-cols-2">
                            {tech.examples.map((ex, i) => (
                                <li key={i}>
                                    <button
                                        onClick={() => {
                                            // slugify label for URL
                                            const slug = (ex.slug || ex.label || "example")
                                                .toLowerCase()
                                                .replace(/[^a-z0-9]+/g, "-")
                                                .replace(/(^-|-$)/g, "")
                                            const to = ex.route || `/tech/${encodeURIComponent(tech.name.toLowerCase())}/${slug}`
                                            nav(to)
                                        }}
                                        className="block w-full rounded-lg border border-red-900/40 bg-black/40 px-3 py-2 text-left text-sm text-red-200 hover:border-red-700 hover:bg-red-900/10"
                                    >
                                        {ex.label ?? ex.url}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-sm text-zinc-500">No examples provided.</div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function Home() {
    const [techs, setTechs] = useState([])

    useEffect(() => {
        loadTechnologies().then(list => setTechs(normalizeAndDedup(list)))
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
        >
            <GlowPanel title="Technologies">
                <div className="space-y-3">
                    {techs.map((t, i) => (
                        <TechRow key={i} tech={t} />
                    ))}
                </div>
            </GlowPanel>
        </motion.div>
    )
}
