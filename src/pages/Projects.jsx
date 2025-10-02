// src/pages/Projects.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import GlowPanel from "../components/GlowPanel";
import GlowItem from "../components/GlowItem";

function FilterChip({ children, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={[
                "chip",
                active ? "chip--active" : "chip--ghost",
            ].join(" ")}
        >
            {children}
        </button>
    );
}

const Pill = ({ children, tip, className = "" }) => (
    <span className={`pill has-tip ${className}`} data-tip={tip || ""}>
        {children}
    </span>
);

export default function Projects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [q, setQ] = useState("");
    const [tagFilter, setTagFilter] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/data/projects.json", { cache: "no-cache" });
                const arr = await res.json();
                setProjects(Array.isArray(arr) ? arr : []);
            } catch {
                setProjects([]);
            }
        })();
    }, []);

    const allTags = useMemo(() => {
        const s = new Set();
        projects.forEach((p) => (p.tags || []).forEach((t) => s.add(t)));
        return Array.from(s).sort((a, b) => a.localeCompare(b));
    }, [projects]);

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        return projects.filter((p) => {
            const hay = `${p.title ?? ""} ${p.description ?? ""} ${(p.tags || []).join(" ")}`.toLowerCase();
            const qOk = needle ? hay.includes(needle) : true;
            const tOk = tagFilter ? (p.tags || []).includes(tagFilter) : true;
            return qOk && tOk;
        });
    }, [projects, q, tagFilter]);

    function toSlug(s) {
        return (s || "")
            .toString()
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }

    function openProject(p) {
        const tech = toSlug(p.tech || p.category || "");
        const slug = toSlug(p.slug || p.title || "example");
        if (tech && slug) {
            navigate(`/tech/${encodeURIComponent(tech)}/${slug}`);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="space-y-6"
        >
            <GlowPanel className="glow-panel">
                <div className="cv-section-title">Projects</div><br /><br />
               {/* search + filters */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search projects…"
                        className="min-w-[240px] flex-1 rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-sm outline-none focus:border-red-700"
                    />
                    <div className="flex flex-wrap gap-2">
                        <FilterChip active={!tagFilter} onClick={() => setTagFilter(null)}>
                            All
                        </FilterChip>
                        {allTags.map((t) => (
                            <FilterChip key={t} active={tagFilter === t} onClick={() => setTagFilter(t)}>
                                {t}
                            </FilterChip>
                        ))}
                    </div>
                </div>

                {/* full-width list */}
                <div className="flex flex-col gap-3">
                    {filtered.map((p) => {
                        const screenshots = Array.isArray(p.screenshots) ? p.screenshots : [];
                        const ssCount = screenshots.length;

                        return (
                            <GlowItem
                                key={`${p.tech}/${p.slug}/${p.title}`}
                                className="relative glow-panel cursor-pointer"
                                onClick={() => openProject(p)}
                            >
                                {/* content row */}
                                <div className="flex items-start gap-4 pr-12">
                                    <div className="min-w-0">
                                        <div className="truncate font-semibold text-zinc-100">{p.title}</div>
                                        {p.description && (
                                            <div className="mt-1 truncate text-sm text-zinc-400">{p.description}</div>
                                        )}

                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                            {/* meta chips with tooltips */}
                                            <Pill tip="Project status">{p.status || "WIP"}</Pill>
                                            {ssCount > 0 && <Pill tip={`${ssCount} screenshot${ssCount > 1 ? "s" : ""}`}>🖼 {ssCount}</Pill>}

                                            {/* external links shouldn’t navigate */}
                                            {p.homepageUrl && (
                                                <a
                                                    href={p.homepageUrl}
                                                    onClick={(e) => e.stopPropagation()}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="pill"
                                                    data-tip="Open Demo"
                                                >
                                                    Demo
                                                </a>
                                            )}
                                            {p.repoUrl && (
                                                <a
                                                    href={p.repoUrl}
                                                    onClick={(e) => e.stopPropagation()}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="pill"
                                                    data-tip="Open Repository"
                                                >
                                                    Repo
                                                </a>
                                            )}
                                        </div>

                                        {/* project tags (click to filter) */}
                                        {Array.isArray(p.tags) && p.tags.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {p.tags.map((t, i) => (
                                                    <button
                                                        key={i}
                                                        className="chip chip--ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setTagFilter(t);
                                                        }}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <span className="arrow-chip" aria-hidden>→</span>
                            </GlowItem>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="mt-4 text-sm text-zinc-400">No projects match.</div>
                )}
            </GlowPanel>
        </motion.div>
    );
}
