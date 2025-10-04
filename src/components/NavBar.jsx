// src/components/NavBar.jsx
import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

/** ROUTES shown across the top */
const LINKS = [
    { to: "/", label: "Home" },
    { to: "/technologies", label: "Technologies" },
    { to: "/projects", label: "Projects" },
    { to: "/courses", label: "Courses" },
    { to: "/cv", label: "CV" },
    { to: "/brainbox", label: "BrainBox" },
    { to: "/cms", label: "CMS" },
];

/** Reverse firework label (letters fly in from random offsets then settle) */
function PixelBurstLabel({ text, burstSeed }) {
    const chars = React.useMemo(() => text.split(""), [text]);
    const [burstKey, setBurstKey] = React.useState(0);

    // run once on mount + again whenever route changes (new burst)
    React.useEffect(() => setBurstKey((k) => k + 1), []);
    React.useEffect(() => setBurstKey((k) => k + 1), [burstSeed]);

    const rng = (i) => {
        let x = (burstKey * 9301 + (i + 1) * 49297 + 233280) % 233280;
        return x / 233280;
    };

    return (
        <span
            className="pixel-word"
            onMouseEnter={() => setBurstKey((k) => k + 1)}
            onFocus={() => setBurstKey((k) => k + 1)}
        >
            <span className="streak" aria-hidden="true" />
            {chars.map((ch, i) => {
                const angle = rng(i) * Math.PI * 2;
                const radius = 18 + rng(i + 11) * 28;
                const dx = Math.cos(angle) * radius;
                const dy = Math.sin(angle) * radius;
                const delay = Math.round(rng(i + 7) * 180); // 0–180ms
                return (
                    <span
                        key={`${burstKey}-${i}`}
                        className="pixel-word__ch"
                        style={{
                            "--dx": `${dx}px`,
                            "--dy": `${dy}px`,
                            "--delay": `${delay}ms`,
                        }}
                    >
                        {ch}
                    </span>
                );
            })}
        </span>
    );
}

/** Mini popover with theme options (Blue&White / Blue&Red) */
function SettingsMenu() {
    const [open, setOpen] = useState(false);
    const [theme, setTheme] = useState(
        () => localStorage.getItem("theme") || "blue"
    );
    const btnRef = useRef(null);
    const popRef = useRef(null);

    const apply = (t) => {
        setTheme(t);
        document.documentElement.setAttribute("data-theme", t);
        localStorage.setItem("theme", t);
        // Let listeners (e.g., particles) react
        window.dispatchEvent(new CustomEvent("theme-changed", { detail: t }));
        setOpen(false);
    };

    useEffect(() => {
        const onDoc = (e) => {
            if (!open) return;
            if (
                popRef.current &&
                !popRef.current.contains(e.target) &&
                btnRef.current &&
                !btnRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        const onEsc = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDoc);
            document.removeEventListener("keydown", onEsc);
        };
    }, [open]);

    return (
        <div className="nav-settings">
            <button
                ref={btnRef}
                className="nav-cog btn-soft has-tip"
                data-tip="Settings"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
            >
                {/* cog icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        fill="currentColor"
                        d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm9 4a7.6 7.6 0 0 0-.09-1l2-1.55-2-3.46-2.42.5a7.9 7.9 0 0 0-1.73-1l-.37-2.45H9.61l-.37 2.45a7.9 7.9 0 0 0-1.73 1l-2.42-.5-2 3.46L2.1 11a7.6 7.6 0 0 0 0 2l-2 1.55 2 3.46 2.42-.5c.54.4 1.11.74 1.73 1l.37 2.45h4.58l.37-2.45c.62-.26 1.19-.6 1.73-1l2.42.5 2-3.46-2-1.55c.06-.33.09-.66.09-1Z"
                    />
                </svg>
            </button>

            {open && (
                <div ref={popRef} className="nav-pop" role="menu" aria-label="Settings">
                    <div className="nav-pop-title">Theme</div>
                    <button
                        role="menuitemradio"
                        aria-checked={theme === "blue"}
                        className={`nav-pop-item ${theme === "blue" ? "is-active" : ""}`}
                        onClick={() => apply("blue")}
                    >
                        <span className="dot dot--blue" /> Blue &amp; White
                    </button>
                    <button
                        role="menuitemradio"
                        aria-checked={theme === "red"}
                        className={`nav-pop-item ${theme === "red" ? "is-active" : ""}`}
                        onClick={() => apply("red")}
                    >
                        <span className="dot dot--red" /> Blue &amp; Red
                    </button>
                </div>
            )}
        </div>
    );
}

// --- Settings (Themes) dropdown placed inside the nav list ---
function ThemeMenu() {
    const [open, setOpen] = React.useState(false);
    const [theme, setTheme] = React.useState(
        () => localStorage.getItem("theme") || "blue"
    );
    const rootRef = React.useRef(null);

    const apply = (t) => {
        setTheme(t);
        document.documentElement.setAttribute("data-theme", t);
        localStorage.setItem("theme", t);
        window.dispatchEvent(new CustomEvent("theme-changed", { detail: t }));
        setOpen(false);
    };

    React.useEffect(() => {
        const onDoc = (e) => {
            if (!open) return;
            if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
        };
        const onEsc = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDoc);
            document.removeEventListener("keydown", onEsc);
        };
    }, [open]);

    return (
        <div className="nav-settings" ref={rootRef}>
            <button
                className="nav-themes-btn"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
            >
                {/* cog icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        fill="currentColor"
                        d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm9 4a7.6 7.6 0 0 0-.09-1l2-1.55-2-3.46-2.42.5a7.9 7.9 0 0 0-1.73-1l-.37-2.45H9.61l-.37 2.45a7.9 7.9 0 0 0-1.73 1l-2.42-.5-2 3.46L2.1 11a7.6 7.6 0 0 0 0 2l-2 1.55 2 3.46 2.42-.5c.54.4 1.11.74 1.73 1l.37 2.45h4.58l.37-2.45c.62-.26 1.19-.6 1.73-1l2.42.5 2-3.46-2-1.55c.06-.33.09-.66.09-1Z"
                    />
                </svg>
                <span className="nav-themes-label">Themes</span>
            </button>

            {open && (
                <div className="nav-pop" role="menu" aria-label="Theme">
                    <div className="nav-pop-title">Theme</div>
                    <button
                        role="menuitemradio"
                        aria-checked={theme === "blue"}
                        className={`nav-pop-item ${theme === "blue" ? "is-active" : ""}`}
                        onClick={() => apply("blue")}
                    >
                        <span className="dot dot--blue" /> Blue &amp; Black
                    </button>
                    <button
                        role="menuitemradio"
                        aria-checked={theme === "red"}
                        className={`nav-pop-item ${theme === "red" ? "is-active" : ""}`}
                        onClick={() => apply("red")}
                    >
                        <span className="dot dot--red" /> Red &amp; Black
                    </button>
                </div>
            )}
        </div>
    );
}


/** Main Nav */
export default function NavBar() {
    useEffect(() => {
        document.body.classList.add("nav-run"); // enables the timed “streak”
        return () => document.body.classList.remove("nav-run");
    }, []);

    const location = useLocation();
    const burstSeed = location.pathname; // new burst on route change

    return (
        <nav className="site-nav">
            <ul className="nav-list">
                {LINKS.map((link, i) => (
                    <li key={link.to} className="nav-li">
                        <NavLink
                            to={link.to}
                            end={link.to === "/"}
                            className={({ isActive }) =>
                                "nav-link" + (isActive ? " nav-link--active" : "")
                            }
                        >
                            {i === 0 && (
                                <svg
                                    className="nav-ico"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M3 10.5L12 3l9 7.5" />
                                    <path d="M9 21V12h6v9" />
                                </svg>
                            )}
                            <PixelBurstLabel text={link.label} burstSeed={burstSeed} />
                        </NavLink>
                    </li>
                ))}

                {/* right-side settings */}
                <li className="nav-li nav-li--end">
                    <ThemeMenu />
                </li>
            </ul>
        </nav>
    );
}
