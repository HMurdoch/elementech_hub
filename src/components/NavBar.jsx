// src/components/NavBar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

const LINKS = [
    { to: "/", label: "Home" },
    { to: "/technologies", label: "Technologies" },
    { to: "/projects", label: "Projects" },
    { to: "/courses", label: "Courses" },
    { to: "/cv", label: "CV" },
    { to: "/brainbox", label: "Brain Box" },
    { to: "/cms", label: "CMS" },
];

// One global 20s cycle that is shared by all links.
// We split it into equal “segments” (one per link), so the blue streak
// travels left→right once every 20 seconds.
// Total cycle = fast streak (3s) + idle (10s) = 13s
const STREAK_DURATION_MS = 3000;   // 3 seconds sweep
const IDLE_DURATION_MS = 10000;  // 10 seconds wait
const CYCLE_MS = STREAK_DURATION_MS + IDLE_DURATION_MS;
const TICK_MS = 60; // smooth but cheap

function useCycleClock() {
    const [, setTick] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setTick((n) => n + 1), TICK_MS);
        return () => clearInterval(id);
    }, []);
    return Date.now();
}

function StreakText({ text, index, total }) {
    const now = useCycleClock();
    const chars = useMemo(() => text.split(""), [text]);

    // global phase [0..1)
    const phase = (now % CYCLE_MS) / CYCLE_MS;

    // active only during the first STREAK_DURATION_MS
    const active = (now % CYCLE_MS) < STREAK_DURATION_MS;

    // slice for this link
    const slice = 1 / total;
    const start = index * slice;
    const end = start + slice;

    // Is the global phase currently inside THIS link’s slice?
    const inSlice = phase >= start && phase < end;

    // normalize localT within the active window [0..1)
    const localT = active ? (now % STREAK_DURATION_MS) / STREAK_DURATION_MS : null;

    // Move a 4-char window across the label when inSlice
    let from = -999, to = -999;
    if (localT !== null) {
        const span = chars.length + 5;
        const head = Math.floor(localT * span);
        from = head - 4;
        to = head;
    }

    return (
        <span className="nav-streak-text">
            {chars.map((ch, i) => {
                const on = inSlice && i >= from && i <= to;
                return (
                    <span key={i} className={on ? "nav-streak-on" : "nav-streak-off"}>
                        {ch}
                    </span>
                );
            })}
        </span>
    );
}
export default function NavBar() {
    return (
        <nav className="nav-wrap">
            <ul className="nav-list">
                {LINKS.map((link, i) => (
                    <li key={link.to} className="nav-li">
                        <NavLink
                            to={link.to}
                            end={link.to === "/"}
                            className={({ isActive }) =>
                                "nav-a" + (isActive ? " is-active" : "")
                            }
                        >
                            {/* home icon only for the first item */}
                            {i === 0 && (
                                <svg
                                    className="nav-home-ico"
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

                            {/* animated label */}
                            <StreakText
                                text={link.label}
                                index={i}
                                total={LINKS.length}
                            />
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
