// src/pages/CV.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import GlowPanel from "../components/GlowPanel";
import GlowItem from "../components/GlowItem";
import { loadCV } from "../data/loaders";

// Format "2020-07" -> "2020/07 – 2021/05" (or "Present")
function formatRange(from, to) {
    if (!from && !to) return "";
    const f = from ? from.replace("-", "/") : "";
    const t = to ? to.replace("-", "/") : "Present";
    return `${f}${f && t ? " - " : ""}${t}`;
}

// Read theme from <html data-theme="...">, watch for changes
function useTheme() {
    const getTheme = () =>
        document.documentElement.getAttribute("data-theme") === "red"
            ? "red"
            : "blue";

    const [theme, setTheme] = React.useState(getTheme());

    useEffect(() => {
        const obs = new MutationObserver(() => setTheme(getTheme()));
        obs.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme"],
        });
        return () => obs.disconnect();
    }, []);

    return theme;
}

export default function CV() {
    const [cv, setCv] = useState(null);
    const [q, setQ] = useState("");
    const [showEdu, setShowEdu] = useState(true);
    const [showExp, setShowExp] = useState(true);
    const [yearFrom, setYearFrom] = useState("");
    const [yearTo, setYearTo] = useState("");

    // Themed overlay for “workspace” (company/course page)
    const [overlay, setOverlay] = useState(null); // {title, subtitle, years, type, url}
    const closeOverlay = useCallback(() => setOverlay(null), []);
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && closeOverlay();
        if (overlay) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [overlay, closeOverlay]);

    const theme = useTheme();

    useEffect(() => {
        loadCV()
            .then(setCv)
            .catch(() => setCv({}));
    }, []);

    const data = cv ?? {};
    const education = Array.isArray(data.education) ? data.education : [];
    const experience = Array.isArray(data.experience) ? data.experience : [];
    const details = typeof data.details === "string" ? data.details : "";
    const position = typeof data.position === "string" ? data.position : "";
    const isLoading = cv === null;

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
            // year range filter
            const yFrom = parseInt((yearFrom || "").slice(0, 4), 10);
            const yTo = parseInt((yearTo || "").slice(0, 4), 10);
            const wf = parseInt((w.from || "").slice(0, 4), 10);
            const wt = parseInt((w.to || "").slice(0, 4), 10);

            let inRange = true;
            if (!isNaN(yFrom)) inRange = inRange && (!isNaN(wf) ? wf >= yFrom : true);
            if (!isNaN(yTo))
                inRange = inRange && (isNaN(wt) ? new Date().getFullYear() <= yTo : wt <= yTo);
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

    const isHttp = (url) => typeof url === "string" && /^https?:\/\//i.test(url);

    return (
        <div className="space-y-6 print:bg-white print:text-black">
            {/* Toolbar */}
            <div
                className="cv-toolbar glow-panel rounded-xl p-3"
                style={{ background: "var(--panel-surface)", border: "1px solid var(--panel-border)" }}
            >
                <div className="flex flex-wrap items-center gap-2">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search Education & Experience…"
                        className="min-w-[220px] flex-1 rounded-lg border bg-black/20 px-3 py-2 text-sm outline-none ring-0"
                        style={{ borderColor: "var(--panel-border)", color: "var(--text-primary)" }}
                    />
                    <input
                        type="number"
                        value={yearFrom}
                        onChange={(e) => setYearFrom(e.target.value)}
                        placeholder="From (YYYY)"
                        className="w-32 rounded-lg border bg-black/20 px-3 py-2 text-sm outline-none"
                        style={{ borderColor: "var(--panel-border)", color: "var(--text-primary)" }}
                    />
                    <input
                        type="number"
                        value={yearTo}
                        onChange={(e) => setYearTo(e.target.value)}
                        placeholder="To (YYYY)"
                        className="w-32 rounded-lg border bg-black/20 px-3 py-2 text-sm outline-none"
                        style={{ borderColor: "var(--panel-border)", color: "var(--text-primary)" }}
                    />
                    <label
                        className="mx-2 inline-flex items-center gap-2 text-sm"
                        style={{ color: "var(--text-primary)" }}
                    >
                        <input
                            type="checkbox"
                            checked={showEdu}
                            onChange={(e) => setShowEdu(e.target.checked)}
                        />{" "}
                        Education
                    </label>
                    <label
                        className="inline-flex items-center gap-2 text-sm"
                        style={{ color: "var(--text-primary)" }}
                    >
                        <input
                            type="checkbox"
                            checked={showExp}
                            onChange={(e) => setShowExp(e.target.checked)}
                        />{" "}
                        Experience
                    </label>
                    <button onClick={handlePrint} className="ml-auto btn-accent">
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Details */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, ease: "easeOut" }}
            >
                <GlowPanel title="Details">
                    <div>{isLoading ? "Loading…" : details || "—"}</div>
                </GlowPanel>
            </motion.div>

            {/* Position Looking For */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
            >
                <GlowPanel title="Position Looking For">
                    <div>{isLoading ? "Loading…" : position || "—"}</div>
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
                    <GlowPanel
                        title={`Education & Academic Record (${isLoading ? 0 : filteredEducation.length})`}
                        className="glow-panel"
                    >
                        <div className="space-y-3">
                            {isLoading && <div className="text-zinc-400">Loading…</div>}

                            {!isLoading &&
                                filteredEducation.map((e, i) => {
                                    const clickable = isHttp(e.sourcelink);
                                    const open = () =>
                                        clickable &&
                                        setOverlay({
                                            title: e.course,
                                            subtitle: e.institute || "",
                                            years: e.years || "",
                                            type: (e.qualificationType2 || "").toUpperCase(),
                                            url: e.sourcelink,
                                        });

                                    return (
                                        <GlowItem
                                            key={`${e.course}-${i}`}
                                            className={`glow-item ${clickable ? "cv-clickable" : ""}`}
                                            role={clickable ? "button" : undefined}
                                            tabIndex={clickable ? 0 : undefined}
                                            onClick={open}
                                            onKeyDown={clickable ? (ev) => ev.key === "Enter" && open() : undefined}
                                            aria-label={clickable ? `Open ${e.course} website` : undefined}
                                        >
                                            {/* header row */}
                                            <div className="cv-row">
                                                <div className="cv-title">
                                                    <span className="font-semibold">{e.course}</span>
                                                    {e.institute && (
                                                        <span className="text-zinc-400"> - {e.institute}</span>
                                                    )}
                                                </div>

                                                {(e.years || e.qualificationType) && (
                                                    <div
                                                        className="cv-date text-center text-sm font-semibold"
                                                        style={{ color: "var(--accent)" }}
                                                    >
                                                        <div className="cv-date-badge">
                                                            <span className="cv-year">{e.years}</span>
                                                            <span>-</span>
                                                            <span className={`cv-type cv-type--${theme}`}>
                                                                {e.qualificationType?.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* optional subjects */}
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
                                    );
                                })}
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
                    <GlowPanel
                        title={`Work Experience (${isLoading ? 0 : filteredExperience.length})`}
                        className="glow-panel"
                    >
                        <div className="space-y-3">
                            {isLoading && <div className="text-zinc-400">Loading…</div>}

                            {!isLoading &&
                                filteredExperience.map((w, i) => {
                                    const clickable = isHttp(w.sourcelink);
                                    const open = () =>
                                        clickable &&
                                        setOverlay({
                                            title: w.company,
                                            subtitle: w.title || "",
                                            years: formatRange(w.from, w.to),
                                            type: "", // jobs don't have CERTIFICATION types
                                            url: w.sourcelink,
                                        });

                                    return (
                                        <GlowItem
                                            key={`${w.company}-${w.from}-${i}`}
                                            className={`glow-item ${clickable ? "cv-clickable" : ""}`}
                                            role={clickable ? "button" : undefined}
                                            tabIndex={clickable ? 0 : undefined}
                                            onClick={open}
                                            onKeyDown={clickable ? (ev) => ev.key === "Enter" && open() : undefined}
                                            aria-label={clickable ? `Open ${w.company} website` : undefined}
                                        >
                                            <div className="cv-row">
                                                <div className="cv-title">
                                                    <span className="font-semibold">{w.company}</span>
                                                    {w.title && <span className="text-zinc-400"> - {w.title}</span>}
                                                </div>
                                                <div
                                                    className="cv-experience-date text-center text-sm font-semibold"
                                                    style={{ color: "var(--accent)" }}
                                                >
                                                    {formatRange(w.from, w.to)}
                                                </div>
                                            </div>

                                            {w.description && (
                                                <div className="mt-1 text-sm text-zinc-300">{w.description}</div>
                                            )}

                                            {Array.isArray(w.duties) && w.duties.length > 0 && (
                                                <details className="mt-2">
                                                    <summary className="cursor-pointer text-xs text-zinc-400 hover:text-zinc-300">
                                                        Duties &amp; accomplishments ({w.duties.length})
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
                                    );
                                })}
                        </div>
                    </GlowPanel>
                </motion.div>
            )}

            {/* Overlay (ProjectWorkspace-style browser) */}

            {overlay && (
                <div className="cv-overlay">
                    <div className="cv-overlay-backdrop" onClick={closeOverlay} />
                    <div className="cv-overlay-card glow-panel" role="dialog" aria-modal="true">
                        <div className="cv-overlay-head">
                            <div className="cv-overlay-titles">
                                <div className="cv-title-line">
                                    <span className="font-semibold">{overlay.title}</span>
                                </div>
                                {overlay.subtitle && <div className="cv-sub text-zinc-400">{overlay.subtitle}</div>}
                            </div>
                            <div className="cv-badges">
                                {overlay.years && <span className="cv-year">{overlay.years}</span>}
                                {!!overlay.type && <span className={`cv-type ${theme}`}>{overlay.type}</span>}
                            </div>
                            <button className="btn btn-ghost cv-overlay-close" onClick={closeOverlay}>
                                Back
                            </button>
                        </div>

                        <div className="browser-frame glow-panel">
                            <div className="browser-chrome">
                                <div className="dots">
                                    <span className="dot red" />
                                    <span className="dot yellow" />
                                    <span className="dot green" />
                                </div>
                                <div className="url">{overlay.url}</div>
                                <div className="actions">
                                    <button
                                        className="btn btn-ghost sm"
                                        onClick={() => {
                                            const iframe = document.getElementById("cv-overlay-iframe");
                                            if (iframe) iframe.src = overlay.url;
                                        }}
                                    >
                                        Reload
                                    </button>
                                    <a className="btn btn-ghost sm" href={overlay.url} target="_blank" rel="noreferrer">
                                        Open in new tab
                                    </a>
                                </div>
                            </div>
                            <div className="browser-view">
                                <iframe id="cv-overlay-iframe" src={overlay.url} title={overlay.title} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
