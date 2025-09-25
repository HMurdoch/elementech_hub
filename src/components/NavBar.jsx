import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const THEMES = [
    { key: "blue", label: "Blue & Black" },   // default
    { key: "red", label: "Red & Black" },
];

function setTheme(key) {
    const root = document.documentElement;
    if (key === "blue") {
        root.removeAttribute("data-theme"); // default theme
    } else {
        root.setAttribute("data-theme", key);
    }
    localStorage.setItem("theme", key);
}

export default function NavBar() {
    const [open, setOpen] = useState(false);
    const [theme, setThemeState] = useState(localStorage.getItem("theme") || "blue");
    const location = useLocation();

    useEffect(() => {
        setTheme(theme);
    }, [theme]);

    useEffect(() => {
        // close dropdown on route change
        setOpen(false);
    }, [location.pathname]);

    return (
        <header className="sticky top-0 z-40 backdrop-blur border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_75%,transparent)]">
            <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-2">
                <div className="flex items-center gap-4">
                    <Link to="/" className="inline-flex items-center gap-2 text-[var(--fg-soft)] hover:text-[var(--fg)]">
                        <span className="i-house w-5 h-5">🏠</span>
                        <span className="font-medium">Home</span>
                    </Link>
                    <Link className="text-[var(--fg-soft)] hover:text-[var(--fg)]" to="/technologies">Technologies</Link>
                    <Link className="text-[var(--fg-soft)] hover:text-[var(--fg)]" to="/projects">Projects</Link>
                    <Link className="text-[var(--fg-soft)] hover:text-[var(--fg)]" to="/courses">Courses</Link>
                    <Link className="text-[var(--fg-soft)] hover:text-[var(--fg)]" to="/cv">CV</Link>
                    <Link className="text-[var(--fg-soft)] hover:text-[var(--fg)]" to="/brainbox">Brain Box</Link>
                    <Link className="text-[var(--fg-soft)] hover:text-[var(--fg)]" to="/cms">CMS</Link>
                </div>

                <div className="relative">
                    <button className="btn-soft" onClick={() => setOpen(v => !v)} aria-label="Theme settings">
                        <span className="mr-2">⚙️</span> Theme
                    </button>
                    {open && (
                        <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-2 shadow-[0_8px_30px_rgba(0,0,0,.35)]">
                            {THEMES.map(t => (
                                <button
                                    key={t.key}
                                    onClick={() => setThemeState(t.key)}
                                    className={`w-full text-left rounded-md px-3 py-2 text-sm hover:text-[var(--fg)] hover:border-[var(--accent)] border ${theme === t.key ? "border-[var(--accent)] text-[var(--fg)]" : "border-transparent text-[var(--fg-soft)]"}`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
}
