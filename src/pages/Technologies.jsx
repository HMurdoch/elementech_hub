// src/pages/Technologies.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import GlowPanel from "../components/GlowPanel";
import GlowItem from "../components/GlowItem";
import { loadTechnologies } from "../data/loaders";

// Normalize tech objects coming from JSON (string or object)
function asTechObject(item) {
    if (typeof item === "string") return { name: item, summary: "", examples: [] };
    const { name, title, summary = "", examples = [] } = item || {};
    return {
        name: name || title || "Untitled",
        summary,
        examples: Array.isArray(examples) ? examples : [],
    };
}

// Merge duplicates (string + object) and keep first non-empty fields
function normalizeAndDedup(list) {
    const map = new Map();
    for (const raw of list) {
        const t = asTechObject(raw);
        const key = t.name.trim().toLowerCase();
        const prev = map.get(key);
        if (!prev) {
            map.set(key, t);
        } else {
            map.set(key, {
                name: prev.name || t.name,
                summary: t.summary || prev.summary,
                examples: (t.examples && t.examples.length ? t.examples : prev.examples) || [],
            });
        }
    }
    return Array.from(map.values());
}

function TechRow({ tech }) {
    const [open, setOpen] = useState(true);
    const nav = useNavigate();

    return (
        <GlowItem className="glow-item">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between text-left"
            >
                <div className="pr-3">
                    <div className="font-semibold">{tech.name}</div>
                    {tech.summary ? <div className="text-sm opacity-70">{tech.summary}</div> : null}
                </div>
                <span className="opacity-70">{open ? "−" : "+"}</span>
            </button>

            {open && (
                <div className="mt-3">
                    {tech.examples?.length ? (
                        // ✅ Two equal columns that fill the whole width
                        <ul className="examples-grid w-full list-none p-0 m-0">
                            {tech.examples.map((ex, i) => (
                                <li key={i}>
                                    <button
                                        onClick={() => {
                                            const slug = (ex.slug || ex.label || "example")
                                                .toLowerCase()
                                                .replace(/[^a-z0-9]+/g, "-")
                                                .replace(/(^-|-$)/g, "");
                                            const to =
                                                ex.route ||
                                                `/tech/${encodeURIComponent(tech.name.toLowerCase())}/${slug}`;
                                            nav(to);
                                        }}
                                        className="glow-item w-full rounded-lg px-3 py-2 text-left text-sm"
                                        style={{
                                            background: "var(--panel-surface)",
                                            border: "1px solid var(--panel-border)",
                                        }}
                                    >
                                        {ex.label ?? ex.url}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-sm opacity-60">No examples provided.</div>
                    )}
                </div>
            )}
        </GlowItem>
    );
}

export default function Technologies() {
    const [techs, setTechs] = useState([]);

    useEffect(() => {
        loadTechnologies().then((list) => setTechs(normalizeAndDedup(list)));
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
        >
            <GlowPanel title="Technologies" className="glow-panel">
                <div className="space-y-3">
                    {techs.map((t, i) => (
                        <TechRow key={i} tech={t} />
                    ))}
                </div>
            </GlowPanel>
        </motion.div>
    );
}
