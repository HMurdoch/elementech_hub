// src/pages/CV.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import GlowPanel from "../components/GlowPanel";
import GlowItem from "../components/GlowItem";
import { loadCV } from "../data/loaders";

function formatRange(from, to) {
    if (!from && !to) return "";
    const f = from ? from.replace("-", "/") : "";
    const t = to ? to.replace("-", "/") : "Present";
    return `${f}${f && t ? " - " : ""}${t}`;
}

export default function CV() {
    const [cv, setCv] = useState(null);
    const [q, setQ] = useState(""); // text query
    const [showEdu, setShowEdu] = useState(true);
    const [showExp, setShowExp] = useState(true);
    const [yearFrom, setYearFrom] = useState("");
    const [yearTo, setYearTo] = useState("");

    useEffect(() => {
        loadCV().then(setCv).catch(() => setCv({}));
    }, []);

    // Always define a stable data structure so hooks below run every render
    const data = cv ?? {};
    const education = Array.isArray(data.education) ? data.education : [];
    const experience = Array.isArray(data.experience) ? data.experience : [];
    const details = typeof data.details === "string" ? data.details : "";
    const position = typeof data.position === "string" ? data.position : "";

    const normQ = q.trim().toLowerCase();

    const filteredEducation = useMemo(() => {
        return education.filter((e) => {
            if (!normQ) return true;
            const hay = [
                e.course,
                e.institute,
                e.years,
                e.qualificationType,
                ...(e.subjects || []),
            ]
                .join(" ")
                .toLowerCase();
            return hay.includes(normQ);
        });
    }, [education, normQ]);

    const filteredExperience = useMemo(() => {
        return experience.filter((w) => {
            // Year range filter (if provided)
            const yFrom = parseInt((yearFrom || "").slice(0, 4), 10);
            const yTo = parseInt((yearTo || "").slice(0, 4), 10);
            const wf = parseInt((w.from || "").slice(0, 4), 10);
            const wt = parseInt((w.to || "").slice(0, 4), 10);

            let inRange = true;
            if (!isNaN(yFrom)) {
                inRange = inRange && (!isNaN(wf) ? wf >= yFrom : true);
            }
            if (!isNaN(yTo)) {
                const endY = isNaN(wt) ? new Date().getFullYear() : wt;
                inRange = inRange && endY <= yTo;
            }
            if (!inRange) return false;

            if (!normQ) return true;
            const hay = [
                w.company,
                w.title,
                w.description,
                w.from,
                w.to,
                ...(w.duties || []),
                ...(w.technologies || []),
            ]
                .join(" ")
                .toLowerCase();
            return hay.includes(normQ);
        });
    }, [experience, normQ, yearFrom, yearTo]);

    function handlePrint() {
        document.querySelectorAll("details").forEach((d) => (d.open = true));
        window.print();
    }

    const isLoading = cv === null;

    return (
        <div className="space-y-6 print:bg-white print:text-black">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-900/40 bg-zinc-900/40 p-3 glow-panel">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search Education & Experience…"
                    className="min-w-[220px] flex-1 rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-sm outline-none ring-0 focus:border-red-700"
                />
                <input
                    type="number"
                    value={yearFrom}
                    onChange={(e) => setYearFrom(e.target.value)}
                    placeholder="From (YYYY)"
                    className="w-32 rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-sm outline-none focus:border-red-700"
                />
                <input
                    type="number"
                    value={yearTo}
                    onChange={(e) => setYearTo(e.target.value)}
                    placeholder="To (YYYY)"
                    className="w-32 rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-sm outline-none focus:border-red-700"
                />
                <label className="mx-2 inline-flex items-center gap-2 text-sm text-zinc-300">
                    <input
                        type="checkbox"
                        checked={showEdu}
                        onChange={(e) => setShowEdu(e.target.checked)}
                    />
                    Education
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
                    <input
                        type="checkbox"
                        checked={showExp}
                        onChange={(e) => setShowExp(e.target.checked)}
                    />
                    Experience
                </label>

                <button
                    onClick={handlePrint}
                    className="ml-auto rounded-lg border border-red-900/60 bg-red-900/30 px-3 py-2 text-sm text-red-100 hover:border-red-600 hover:bg-red-900/40 glow-panel"
                >
                    Download PDF
                </button>
            </div>

            {/* Details */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, ease: "easeOut" }}
            >
                <GlowPanel title="Details" className="glow-panel glow-item">
                    <div className="glow-item">
                        {isLoading ? "Loading…" : details || "—"}
                    </div>
                </GlowPanel>
            </motion.div>

            {/*{console.log("X: " + details)}*/}

            {/* Position */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
            >
                <GlowPanel title="Position Looking For" className="glow-panel glow-item">
                    <div className="glow-item">
                        {isLoading ? "Loading…" : position || "—"}
                    </div>
                </GlowPanel>
            </motion.div>

            {/* Education */}
            {showEdu && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
                >
                    <GlowPanel title={`Education & Academic Record (${isLoading ? 0 : filteredEducation.length})`} className="glow-panel">
                        <div className="space-y-3">
                            {isLoading && <div className="text-zinc-400">Loading…</div>}
                            {!isLoading &&
                                filteredEducation.map((e, i) => (
                                    <GlowItem key={i} className="glow-item">
                                        <div className="flex flex-wrap items-baseline justify-between gap-2 glow-item">
                                            <div className="truncate">
                                                <span className="font-semibold">{e.course}</span>
                                                {e.institute && (
                                                    <span className="text-zinc-400"> - {e.institute}</span>
                                                )}
                                            </div>
                                            {(e.years || e.qualificationType) && (
                                                <div className="text-xs text-red-300">
                                                    {e.years ? e.years : ""}
                                                    {e.years && e.qualificationType ? " - " : ""}
                                                    {e.qualificationType ? e.qualificationType : ""}
                                                </div>
                                            )}
                                        </div>
                                        {Array.isArray(e.subjects) && e.subjects.length > 0 && (
                                            <details className="mt-2">
                                                <summary className="cursor-pointer text-xs text-zinc-400 hover:text-zinc-300">
                                                    Subjects ({e.subjects.length})
                                                </summary>
                                                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-zinc-300">
                                                    {e.subjects.map((s, j) => (
                                                        <li key={j}>{s}</li>
                                                    ))}
                                                </ul>
                                            </details>
                                        )}
                                    </GlowItem>
                                ))}
                        </div>
                    </GlowPanel>
                </motion.div>
            )}

            {/* Work Experience */}
            {showExp && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.45, ease: "easeOut", delay: 0.15 }}
                >
                    <GlowPanel title={`Work Experience (${isLoading ? 0 : filteredExperience.length})`} className="glow-panel">
                        <div className="space-y-3">
                            {isLoading && <div className="text-zinc-400">Loading…</div>}
                            {!isLoading &&
                                filteredExperience.map((w, i) => (
                                    <GlowItem key={i}>
                                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                                            <div className="truncate">
                                                <span className="font-semibold">{w.company}</span>
                                                {w.title && (
                                                    <span className="text-zinc-400"> - {w.title}</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-red-300">
                                                {formatRange(w.from, w.to)}
                                            </div>
                                        </div>

                                        {w.description && (
                                            <div className="mt-1 text-sm text-zinc-300">
                                                {w.description}
                                            </div>
                                        )}

                                        {Array.isArray(w.duties) && w.duties.length > 0 && (
                                            <details className="mt-2">
                                                <summary className="cursor-pointer text-xs text-zinc-400 hover:text-zinc-300">
                                                    Duties & accomplishments ({w.duties.length})
                                                </summary>
                                                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-zinc-300">
                                                    {w.duties.map((d, j) => (
                                                        <li key={j}>{d}</li>
                                                    ))}
                                                </ul>
                                            </details>
                                        )}

                                        {Array.isArray(w.technologies) && w.technologies.length > 0 && (
                                            <div className="mt-2 text-xs text-zinc-400">
                                                Tech: {w.technologies.join(", ")}
                                            </div>
                                        )}
                                    </GlowItem>
                                ))}
                        </div>
                    </GlowPanel>
                </motion.div>
            )}
        </div>
    );
}
