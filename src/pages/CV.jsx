// src/pages/CV.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlowPanel from "../components/GlowPanel";
import GlowItem from "../components/GlowItem";
import { loadCV } from "../data/loaders";

// Format "2020-07" -> "2020/07 - 2021/05" (or "Present")
function formatRange(from, to) {
    if (!from && !to) return "";
    const f = from ? from.replace("-", "/") : "";
    const t = to ? to.replace("-", "/") : "Present";
    return `${f}${f && t ? " - " : ""}${t}`;
}

// Read theme from <html data-theme="..."> and keep in sync
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

/* ------------------------------------------------------------------ */
/* Details parsing (shows only 'Hugh Murdoch' in the Name row)         */
/* ------------------------------------------------------------------ */
function parseDetailsLine(str = "") {
    // name = everything before the first separator " - " or " · " (robust fallback to first words)
    let name = (str.split(/(?:\s[·-]\s)/)[0] || "").trim();
    if (!name) {
        const m = str.match(/^\s*([A-Za-z]+(?:\s+[A-Za-z'.-]+){0,3})/);
        name = (m && m[1]) || "";
    }

    const email = (str.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0];
    const dob =
        (str.match(/\b(19|20)\d{2}[-/](0\d|1[0-2])[-/](0\d|[12]\d|3[01])\b/) || [])[0];
    const phone = (str.match(/(\+\d[\d\s()/-]{6,})/) || [])[0];
    const nationality = (str.match(/\bSouth African\b/i) || [])[0];

    const rows = [];
    if (name) rows.push({ label: "Name", val: name, ico: "👤" }); // <- only the name
    if (nationality) rows.push({ label: "Nationality", val: nationality, ico: "🌍" });
    if (dob) rows.push({ label: "DOB", val: dob, ico: "📅" });
    if (phone) rows.push({ label: "Mobile", val: phone, ico: "📱" });
    if (email) rows.push({ label: "Email", val: email, ico: "✉️" });
    return rows;
}

// retrigger the fall-in every 8s
function useEightSecondCycle() {
    const [k, setK] = React.useState(0);
    React.useEffect(() => {
        const id = setInterval(() => setK((n) => n + 1), 8000);
        return () => clearInterval(id);
    }, []);
    return k;
}

// A small section title that looks like your green headings (and glows)
function SectionTitleBar({ children }) {
    return (
        <div className="cv-title-bar">
            <span className="cv-title-dot" />
            <span className="cv-title">{children}</span>
        </div>
    );
}

export default function CV() {
    const [cv, setCv] = useState(null);
    const [q, setQ] = useState("");
    const [showEdu, setShowEdu] = useState(true);
    const [showExp, setShowExp] = useState(true);
    const [yearFrom, setYearFrom] = useState("");
    const [yearTo, setYearTo] = useState("");
    const theme = useTheme();

    useEffect(() => {
        loadCV().then(setCv).catch(() => setCv({}));
    }, []);

    const data = cv ?? {};
    const education = Array.isArray(data.education) ? data.education : [];
    const experience = Array.isArray(data.experience) ? data.experience : [];
    const details = typeof data.details === "string" ? data.details : "";
    const position = typeof data.position === "string" ? data.position : "";
    const isLoading = cv === null;

    const normQ = q.trim().toLowerCase();
    const isHttp = (url) => typeof url === "string" && /^https?:\/\//i.test(url);

    // Open link in minimalist pop-up window
    function openExternal(url) {
        if (!isHttp(url)) return;
        const features = [
            "noopener",
            "noreferrer",
            "toolbar=no",
            "location=no",
            "menubar=no",
            "status=no",
            "scrollbars=yes",
            "resizable=yes",
            "width=1200",
            "height=800",
            `left=${Math.max(20, (window.screen.width - 1200) / 2)}`,
            `top=${Math.max(20, (window.screen.height - 800) / 2)}`,
        ].join(",");
        window.open(url, "_blank", features);
    }

    const filteredEducation = useMemo(() => {
        return education.filter((e) => {
            if (!normQ) return true;
            const hay = [e.course, e.institute, e.years, e.qualificationType, ...(e.subjects || [])]
                .join(" ")
                .toLowerCase();
            return hay.includes(normQ);
        });
    }, [education, normQ]);

    const filteredExperience = useMemo(() => {
        return experience.filter((w) => {
            // range filter
            const yFrom = parseInt((yearFrom || "").slice(0, 4), 10);
            const yTo = parseInt((yearTo || "").slice(0, 4), 10);
            const wf = parseInt((w.from || "").slice(0, 4), 10);
            const wt = parseInt((w.to || "").slice(0, 4), 10);

            let inRange = true;
            if (!isNaN(yFrom)) inRange = inRange && (!isNaN(wf) ? wf >= yFrom : true);
            if (!isNaN(yTo)) inRange = inRange && (isNaN(wt) ? new Date().getFullYear() <= yTo : wt <= yTo);
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

    /* ------------------------------------------------------------------ */
    /* Positions list with "hero" streak animation on the first role      */
    /* ------------------------------------------------------------------ */

    function HeroRoleText({ text }) {
        const [pos, setPos] = useState(-5); // active color window start
        const chars = useMemo(() => (text ?? "").split(""), [text]);

        useEffect(() => {
            const id = setInterval(() => {
                setPos((p) => (p > chars.length ? -5 : p + 1));
            }, 100); // Slowed down from 60ms to 100ms
            return () => clearInterval(id);
        }, [chars.length]);

        return (
            <span className="inline-block font-semibold"
                style={{ fontSize: "1.08rem", letterSpacing: "0.1px" }}>
                {chars.map((ch, i) => {
                    const active = i >= pos && i < pos + 5; // 4 chars behind turn back to white
                    return (
                        <span
                            key={i}
                            style={{
                                color: active ? "var(--accent)" : "var(--text-primary)",
                                textShadow: active ? "0 0 10px var(--accent)" : "none",
                                transition: "color 80ms linear",
                            }}
                        >
                            {ch}
                        </span>
                    );
                })}
            </span>
        );
    }

    // Blue text with white strobe effect for education degree titles
    function DegreeStrobeText({ text }) {
        const [pos, setPos] = useState(-5);
        const chars = useMemo(() => (text ?? "").split(""), [text]);

        useEffect(() => {
            const id = setInterval(() => {
                setPos((p) => (p > chars.length ? -5 : p + 1));
            }, 60);
            return () => clearInterval(id);
        }, [chars.length]);

        return (
            <span className="inline-block font-semibold">
                {chars.map((ch, i) => {
                    const active = i >= pos && i < pos + 5;
                    return (
                        <span
                            key={i}
                            style={{
                                color: active ? "#ffffff" : "#60a5fa", // white strobe over blue text
                                textShadow: active ? "0 0 10px #ffffff" : "none",
                                transition: "color 80ms linear",
                            }}
                        >
                            {ch}
                        </span>
                    );
                })}
            </span>
        );
    }

    function PositionsList({ items }) {
        const cleaned = useMemo(() => {
            if (!items) return [];
            if (Array.isArray(items)) return items.filter(Boolean);
            return String(items)
                .split(" / ")
                .map((s) => s.trim())
                .filter(Boolean);
        }, [items]);

        const [runId, setRunId] = useState(0);
        useEffect(() => {
            const id = setInterval(() => setRunId((n) => n + 1), 8000);
            return () => clearInterval(id);
        }, []);

        return (
            <div className="cv-positions">
                <motion.ul
                    key={runId}
                    initial="hidden"
                    animate="show"
                    variants={{
                        show: { transition: { staggerChildren: 0.05 } },
                    }}
                >
                    {cleaned.map((role, i) => (
                        <motion.li
                            key={`${runId}-${i}-${role}`}
                            className={`cv-pos-item ${i === 0 ? "cv-pos-hero" : ""}`}
                            variants={{
                                hidden: { y: -12, opacity: 0, filter: "blur(3px)" },
                                show: {
                                    y: 0,
                                    opacity: 1,
                                    filter: "blur(0px)",
                                    transition: { type: "spring", damping: 22, stiffness: 280 },
                                },
                            }}
                        >
                            <span className="cv-pos-bullet" aria-hidden="true">▸</span>
                            {i === 0 ? <HeroRoleText text={role} /> : role}
                        </motion.li>
                    ))}
                </motion.ul>
            </div>
        );
    }

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
                    <label className="mx-2 inline-flex items-center gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
                        <input type="checkbox" checked={showEdu} onChange={(e) => setShowEdu(e.target.checked)} /> Education
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
                        <input type="checkbox" checked={showExp} onChange={(e) => setShowExp(e.target.checked)} /> Experience
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
                <GlowItem>
                    <div className="cv-section-title">Details</div>
                    <div className="cv-details glow-panel mt-3">
                        {(() => {
                            const detailRows = parseDetailsLine(details);
                            const cycle = useEightSecondCycle();
                            return (
                                <ul key={cycle} className="cv-details-list">
                                    {detailRows.map((r, i) => (
                                        <li className="cv-detail-row" key={r.label} style={{ animationDelay: `${i * 90}ms` }}>
                                            <span className="cv-detail-ico" aria-hidden>
                                                {r.ico}
                                            </span>
                                            <span className="cv-detail-label">{r.label}</span>
                                            <span className="cv-detail-val">{r.val}</span>
                                        </li>
                                    ))}
                                </ul>
                            );
                        })()}
                    </div>
                </GlowItem>
            </motion.div>

            {/* Position Looking For */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
            >
                <GlowItem>
                    <div className="cv-section-title">Perfect Positions</div>
                    <div className="panel-line glow-panel mt-3 cv-details">
                        <PositionsList items={data.positionLookingFor || position} />
                    </div>
                </GlowItem>
            </motion.div>

            {/* Education */}
            {showEdu && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
                >
                    <GlowItem>
                        <div className="cv-section-title">
                            Education & Academic Record ({isLoading ? 0 : filteredEducation.length})
                        </div>
                        <div className="space-y-3 panel-line glow-panel mt-3 cv-details">
                            {isLoading && <div className="text-zinc-400">Loading…</div>}

                            {!isLoading &&
                                filteredEducation.map((e, i) => {
                                    const clickable = isHttp(e.sourcelink);
                                    const onOpen = () => clickable && openExternal(e.sourcelink);

                                    return (
                                        <GlowItem
                                            key={`${e.course}-${i}`}
                                            className={`glow-item ${clickable ? "cv-clickable" : ""}`}
                                            role={clickable ? "button" : undefined}
                                            tabIndex={clickable ? 0 : undefined}
                                            onClick={onOpen}
                                            onKeyDown={clickable ? (ev) => ev.key === "Enter" && onOpen() : undefined}
                                            aria-label={clickable ? `Open ${e.course} website` : undefined}
                                        >
                                            {/* header row */}
                                            <div className="cv-row">
                                                {(e.years || e.qualificationType || clickable) && (
                                                    <div className="cv-row">
                                                        <div className="cv-title">
                                                            {(e.qualificationType?.toLowerCase().includes('degree') || 
                                                              e.qualificationType?.toLowerCase().includes('honors')) ? (
                                                                <DegreeStrobeText text={e.course} />
                                                            ) : (
                                                                <span className="font-semibold" style={{ color: "#60a5fa" }}>{e.course}</span>
                                                            )}
                                                            {e.institute && <span className="text-zinc-400"> - {e.institute}</span>}
                                                        </div>

                                                        <div className="cv-right flex items-center gap-2">
                                                            {(e.years || e.qualificationType) && (
                                                                <div className="cv-date text-sm" style={{ color: "var(--accent)" }}>
                                                                    {e.years && <span className="cv-type">{e.years}</span>}
                                                                    {e.qualificationType && (
                                                                        <>
                                                                            <span className="mx-1">-</span>
                                                                            <span className={`cv-year cv-type--${theme}`}>
                                                                                {e.qualificationType.toUpperCase()}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* World icon in fixed column */}
                                                            <div className="cv-link-slot w-7 flex justify-center">
                                                                {e.sourcelink && (
                                                                    <button
                                                                        className="cv-link-btn"
                                                                        onClick={(ev) => {
                                                                            ev.stopPropagation();
                                                                            openExternal(e.sourcelink);
                                                                        }}
                                                                        title="Open link"
                                                                    >
                                                                        <svg
                                                                            width="16"
                                                                            height="16"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            strokeWidth="1.8"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                        >
                                                                            <circle cx="12" cy="12" r="10" />
                                                                            <line x1="2" y1="12" x2="22" y2="12" />
                                                                            <path d="M12 2a15.3 15.3 0 0 1 0 20a15.3 15.3 0 0 1 0-20z" />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                            </div>
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
                    </GlowItem>
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
                    <GlowItem>
                        <div className="cv-section-title">{`Work Experience (${isLoading ? 0 : filteredExperience.length})`}</div>
                        <div className="space-y-3 panel-line glow-panel mt-3 cv-details">
                            {isLoading && <div className="text-zinc-400">Loading…</div>}

                            {!isLoading &&
                                filteredExperience.map((w, i) => {
                                    const clickable = isHttp(w.sourcelink);
                                    const onOpen = () => clickable && openExternal(w.sourcelink);
                                    
                                    // Check if this is a combined position (show only title/date for second entry)
                                    const isCombinedSecondary = w.combinedPosition && i > 0 && 
                                        filteredExperience[i - 1]?.company === w.company &&
                                        filteredExperience[i - 1]?.combinedPosition;

                                    return (
                                        <GlowItem
                                            key={`${w.company}-${w.from}-${i}`}
                                            className={`glow-item ${clickable ? "cv-clickable" : ""}`}
                                            role={clickable ? "button" : undefined}
                                            tabIndex={clickable ? 0 : undefined}
                                            onClick={onOpen}
                                            onKeyDown={clickable ? (ev) => ev.key === "Enter" && onOpen() : undefined}
                                            aria-label={clickable ? `Open ${w.company} website` : undefined}
                                        >
                                            {!isCombinedSecondary ? (
                                                <div className="cv-row">
                                                    <div className="cv-title">
                                                        <span className="font-semibold" style={{ color: "#60a5fa" }}>{w.company}</span>
                                                        {w.title && <span className="text-zinc-400"> - {w.title}</span>}
                                                    </div>

                                                    <div className="cv-right flex items-center gap-2">
                                                        <div className="cv-date text-sm font-semibold" style={{ color: "var(--accent)" }}>
                                                            {formatRange(w.from, w.to)}
                                                        </div>

                                                        <div className="cv-link-slot w-7 flex justify-center">
                                                            {w.sourcelink && (
                                                                <button
                                                                    className="cv-link-btn"
                                                                    onClick={(ev) => {
                                                                        ev.stopPropagation();
                                                                        openExternal(w.sourcelink);
                                                                    }}
                                                                    title="Open link"
                                                                >
                                                                    <svg
                                                                        width="16"
                                                                        height="16"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="1.8"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    >
                                                                        <circle cx="12" cy="12" r="10" />
                                                                        <line x1="2" y1="12" x2="22" y2="12" />
                                                                        <path d="M12 2a15.3 15.3 0 0 1 0 20a15.3 15.3 0 0 1 0-20z" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="cv-row mt-3">
                                                    <div className="cv-title">
                                                        <span className="text-zinc-400">{w.title}</span>
                                                    </div>
                                                    <div className="cv-right flex items-center gap-2">
                                                        <div className="cv-date text-sm font-semibold" style={{ color: "var(--accent)" }}>
                                                            {formatRange(w.from, w.to)}
                                                        </div>
                                                        <div className="cv-link-slot w-7"></div>
                                                    </div>
                                                </div>
                                            )}

                                            {w.description && (
                                                <div className="mt-1 text-sm text-zinc-300">
                                                    {w.description.split('\n').map((line, idx) => {
                                                        const trimmed = line.trim();
                                                        if (!trimmed) return <div key={idx} className="h-2"></div>;
                                                        
                                                        const isBullet = trimmed.startsWith('•');
                                                        
                                                        return (
                                                            <div 
                                                                key={idx} 
                                                                className={isBullet ? "pl-8" : ""}
                                                                style={{ marginBottom: isBullet ? '0' : '0.5rem' }}
                                                            >
                                                                {trimmed}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
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
                                                <div className="mt-2 text-xs text-zinc-400">Tech: {w.technologies.join(", ")}</div>
                                            )}
                                        </GlowItem>
                                    );
                                })}
                        </div>
                    </GlowItem>
                </motion.div>
            )}
        </div>
    );
}
