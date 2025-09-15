import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import GlowPanel from "../components/GlowPanel"
import GradientButton from "../components/GradientButton"
import { setOverride, clearOverride } from "../data/loaders"

const FILES = [
    { key: "technologies", path: "/data/technologies.json", title: "Technologies" },
    { key: "projects", path: "/data/projects.json", title: "Projects" },
    { key: "courses", path: "/data/courses.json", title: "Courses" },
    { key: "cv", path: "/data/cv.json", title: "Curriculum Vitae" },
    { key: "brainbox", path: "/data/brainbox.json", title: "Brain Box (seed)" },
]

export default function CMS() {
    const [active, setActive] = useState(FILES[0].key)
    const [text, setText] = useState("{}")
    const [status, setStatus] = useState("")
    const file = FILES.find(f => f.key === active)

    const load = async () => {
        setStatus("Loading…")
        try {
            const r = await fetch(file.path, { cache: "no-cache" })
            const data = await r.json()
            setText(JSON.stringify(data, null, 2))
            setStatus("Loaded from server file")
        } catch (e) {
            setStatus("Failed to load: " + e.message)
        }
    }
    useEffect(() => { load() }, [active])

    const validate = () => {
        try { JSON.parse(text); setStatus("Valid JSON ✔️") }
        catch (e) { setStatus("Invalid JSON: " + e.message) }
    }
    const saveRuntime = () => {
        try { setOverride(active, JSON.parse(text)); setStatus("Saved runtime override (localStorage). Refresh pages to see changes.") }
        catch (e) { setStatus("Invalid JSON: " + e.message) }
    }
    const clear = () => { clearOverride(active); setStatus("Cleared runtime override. Reload to use server file.") }
    const download = () => {
        const a = document.createElement("a")
        const blob = new Blob([text], { type: "application/json" })
        a.href = URL.createObjectURL(blob); a.download = `${active}.json`; a.click(); URL.revokeObjectURL(a.href)
    }
    const onUpload = file => { const fr = new FileReader(); fr.onload = () => setText(fr.result); fr.readAsText(file) }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="space-y-4"
        >
            <GlowPanel title="CMS Editor">
                <div className="mb-3 flex flex-wrap gap-2">
                    {FILES.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setActive(f.key)}
                            className={`px-3 py-1 rounded border ${active === f.key
                                    ? "border-red-600 bg-red-900/30 text-red-200"
                                    : "border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-red-700"
                                }`}
                        >
                            {f.title}
                        </button>
                    ))}
                </div>

                <div className="mb-2 text-sm text-zinc-400">{status}</div>

                <div className="grid gap-3 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <textarea
                            value={text}
                            onChange={e => setText(e.target.value)}
                            rows={24}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 font-mono text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <button onClick={load} className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 hover:border-red-700">Reload from server</button>
                        <button onClick={validate} className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 hover:border-red-700">Validate JSON</button>
                        <GradientButton onClick={saveRuntime}>Save runtime override</GradientButton>
                        <button onClick={clear} className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 hover:border-red-700">Clear override</button>
                        <button onClick={download} className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 hover:border-red-700">Download JSON</button>
                        <label className="w-full inline-flex items-center justify-center gap-2 rounded border border-zinc-700 bg-zinc-800 px-3 py-2 hover:border-red-700 cursor-pointer">
                            Upload JSON
                            <input type="file" accept="application/json" className="hidden" onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
                        </label>
                        <p className="text-xs text-zinc-400 pt-2">
                            Saving to server files requires a backend. Runtime overrides are stored locally and applied immediately.
                        </p>
                    </div>
                </div>
            </GlowPanel>
        </motion.div>
    )
}
