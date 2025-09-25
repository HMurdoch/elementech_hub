// src/pages/Landing.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * Read and react to <html data-theme="..."> changes.
 * Default is "blue".
 */
function useTheme() {
    const readTheme = () => {
        const t = document.documentElement.getAttribute("data-theme");
        return t === "red" ? "red" : "blue";
    };

    const [theme, setTheme] = useState(readTheme);

    useEffect(() => {
        const el = document.documentElement;
        const observer = new MutationObserver((mutations) => {
            for (const m of mutations) {
                if (m.attributeName === "data-theme") {
                    setTheme(readTheme());
                    break;
                }
            }
        });

        observer.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
        return () => observer.disconnect();
    }, []);

    return theme; // <- return a string, not an object
}

export default function Landing() {
    const theme = useTheme(); // "blue" | "red"

    // Choose image based on theme, add tiny cache buster, and
    // use the value as a key to force remount on theme swap.
    const imgSrc = useMemo(() => {
        const filename =
            theme === "red"
                ? "elementech_landing_red.png"
                : "elementech_landing_blue.png";
        return `/images/${filename}?t=${theme}`;
    }, [theme]);

    return (
        <section className="landing-hero">
            <div className="landing-intro">
                <h1 className="landing-welcome">Welcome</h1>

                <h2 className="landing-title">
                    <span>Hugh Murdoch</span>{" "}
                    <span> - Full-Stack Developer</span>
                </h2>

                <p className="landing-sub">
                    Explore technologies, projects, courses, my CV, and the Brain Box forum.
                    Use the navigation above, or click the home icon anytime to return here.
                </p>
            </div>

            <div className="landing-image-shell glow-panel glow-panel--hero">
                <img
                    key={imgSrc}                       // force remount when theme changes
                    src={imgSrc}
                    alt="Elementech Hub Interactive Portfolio - Hugh Murdoch"
                    className="landing-image"
                    loading="eager"
                    decoding="sync"
                />
            </div>
        </section>
    );
}
