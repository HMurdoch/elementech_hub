// src/components/NavBar.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const LINKS = [
    { to: "/", label: "Home" },
    { to: "/technologies", label: "Technologies" },
    { to: "/projects", label: "Projects" },
    { to: "/courses", label: "Courses" },
    { to: "/cv", label: "CV" },
    { to: "/brainbox", label: "BrainBox" },
    { to: "/cms", label: "CMS" },
];

/** Reverse firework that coalesces into the word.
 * Pops on: mount, hover/focus, and route change (see burstSeed).
 */
function PixelBurstLabel({ text, burstSeed }) {
    const chars = React.useMemo(() => text.split(""), [text]);
    const [burstKey, setBurstKey] = React.useState(0);

    // on first mount
    React.useEffect(() => setBurstKey(k => k + 1), []);
    // when route changes (active link pops once)
    React.useEffect(() => setBurstKey(k => k + 1), [burstSeed]);

    // tiny deterministic RNG so letters “burst” from different offsets each time
    const rng = (i) => {
        let x = (burstKey * 9301 + (i + 1) * 49297 + 233280) % 233280;
        return x / 233280;
    };

    return (
        <span
            className="pixel-word"
            onMouseEnter={() => setBurstKey(k => k + 1)}
            onFocus={() => setBurstKey(k => k + 1)}
        >
            {/* blue streak under the letters */}
            <span className="streak" aria-hidden="true" />

            {chars.map((ch, i) => {
                const angle = rng(i) * Math.PI * 2;
                const radius = 18 + rng(i + 11) * 28;
                const dx = Math.cos(angle) * radius;
                const dy = Math.sin(angle) * radius;
                const delay = Math.round(rng(i + 7) * 180);

                return (
                    <span
                        key={`${burstKey}-${i}`}
                        className="pixel-word__ch"
                        style={{ "--dx": `${dx}px`, "--dy": `${dy}px`, "--delay": `${delay}ms` }}
                    >
                        {ch}
                    </span>
                );
            })}
        </span>
    );
}

// Simple Blue/Red toggle on the far right (persists)
function ThemeToggle() {
    const [theme, setTheme] = useState(
        () => localStorage.getItem("theme") || "blue"
    );

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        // notify listeners (ParticlesBackground)
        window.dispatchEvent(new CustomEvent("theme-changed", { detail: theme }));
    }, [theme]);

    const apply = (t) => setTheme(t);

    return (
        <div className="theme-toggle">
            <button
                className={`theme-chip ${theme === "blue" ? "is-active" : ""}`}
                onClick={() => apply("blue")}
                aria-label="Blue theme"
                title="Blue theme"
            >
                Blue
            </button>
            <button
                className={`theme-chip ${theme === "red" ? "is-active" : ""}`}
                onClick={() => apply("red")}
                aria-label="Red theme"
                title="Red theme"
            >
                Red
            </button>
        </div>
    );
}

export default function NavBar() {
    // keeps your “streak across all items” CSS enabled
    useEffect(() => {
        document.body.classList.add("nav-run");
        return () => document.body.classList.remove("nav-run");
    }, []);

    // route change “nudges” the active item’s burst once
    const location = useLocation();
    const burstSeed = location.pathname;

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
                            {/* Home icon on first item */}
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

                {/* theme chips on far right */}
                <li className="nav-li nav-li--end">
                    <ThemeToggle />
                </li>
            </ul>
        </nav>
    );
}
