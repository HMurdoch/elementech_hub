import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import GlowPanel from "../components/GlowPanel";
import GlowItem from "../components/GlowItem";

function TagPill({ children, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={[
                "rounded-lg border px-2 py-1 text-xs transition",
                active
                    ? "border-red-600 bg-red-900/40 text-red-100"
                    : "border-red-900/40 bg-zinc-900/50 text-red-200 hover:border-red-600",
                "shadow-[0_0_12px_rgba(239,68,68,0.15)]",
            ].join(" ")}
        >
            {children}
        </button>
    );
}

function StatusChip({ status }) {
    const s = (status || "").toLowerCase();
    const cls =
        s === "live"
            ? "border-emerald-600/70 text-emerald-200"
            : s === "archived"
                ? "border-zinc-600/70 text-zinc-300"
                : "border-amber-600/70 text-amber-200";
    return (
        <span className={`rounded-md border px-2 py-0.5 text-[11px] bg-black/40 ${cls}`}>
            {status || "WIP"}
        </span>
    );
}
const SmallBadge = ({ children, title }) => (
    <span
        title={title}
        className="rounded-md border border-red-900/40 bg-black/40 px-2 py-0.5 text-[11px] text-red-200"
    >
        {children}
    </span>
);

export default function Projects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]); // <-- array root
    const [q, setQ] = useState("");
    const [tagFilter, setTagFilter] = useState(null);

    // Load from /public/data/projects.json (array root)
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/data/projects.json", { cache: "no-cache" });
                const arr = await res.json(); // array
                setProjects(Array.isArray(arr) ? arr : []);
            } catch (e) {
                console.error("Failed to load projects.json", e);
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

    function openProject(p) {
        // Prefer live homepage if present; otherwise route to workspace
        if (p.homepageUrl) {
            window.open(p.homepageUrl, "_blank", "noopener,noreferrer");
            return;
        }
        if (p.tech && p.slug) {
            navigate(`/tech/${p.tech}/${p.slug}`);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="space-y-6"
        >
            <GlowPanel title="Projects">
                {/* Controls */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search projects…"
                        className="min-w-[220px] flex-1 rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-sm outline-none ring-0 focus:border-red-700"
                    />
                    <div className="flex flex-wrap gap-2">
                        <TagPill active={!tagFilter} onClick={() => setTagFilter(null)}>
                            All
                        </TagPill>
                        {allTags.map((t) => (
                            <TagPill key={t} active={tagFilter === t} onClick={() => setTagFilter(t)}>
                                {t}
                            </TagPill>
                        ))}
                    </div>
                </div>

                {/* 2-col grid */}
                <div className="grid gap-3 md:grid-cols-2">
                    {filtered.map((p) => {
                        const screenshots = Array.isArray(p.screenshots) ? p.screenshots : [];
                        const ssCount = screenshots.length;
                        const status = p.status || (p.homepageUrl ? "Live" : "WIP");

                        return (
                            <GlowItem
                                key={`${p.tech}/${p.slug}/${p.title}`}
                                className="cursor-pointer"
                                onClick={() => openProject(p)}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="truncate font-semibold text-zinc-100">{p.title}</div>
                                        {p.description && (
                                            <div className="mt-1 truncate text-sm text-zinc-400">{p.description}</div>
                                        )}

                                        {/* meta: status + screenshots + links */}
                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                            <StatusChip status={status} />
                                            {ssCount > 0 && <SmallBadge title={`${ssCount} screenshot${ssCount > 1 ? "s" : ""}`}>🖼 {ssCount}</SmallBadge>}
                                            {p.homepageUrl && (
                                                <a
                                                    href={p.homepageUrl}
                                                    onClick={(e) => e.stopPropagation()}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="rounded-md border border-red-900/40 bg-black/40 px-2 py-0.5 text-[11px] text-red-200 hover:border-red-600"
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
                                                    className="rounded-md border border-red-900/40 bg-black/40 px-2 py-0.5 text-[11px] text-red-200 hover:border-red-600"
                                                >
                                                    Repo
                                                </a>
                                            )}
                                        </div>

                                        {/* tags */}
                                        {Array.isArray(p.tags) && p.tags.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {p.tags.map((t, i) => (
                                                    <span
                                                        key={i}
                                                        className="rounded-lg border border-red-900/40 bg-zinc-900/50 px-2 py-0.5 text-xs text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setTagFilter(t);
                                                        }}
                                                    >
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* chevron */}
                                    <span className="shrink-0 rounded-md border border-red-900/40 bg-black/40 px-2 py-1 text-xs text-red-300">
                                        →
                                    </span>
                                </div>
                            </GlowItem>
                        );
                    })}
                </div>

                {filtered.length === 0 && <div className="mt-4 text-sm text-zinc-400">No projects match.</div>}
            </GlowPanel>
        </motion.div>
    );
}
