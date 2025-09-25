// src/pages/Landing.jsx
import React, { useMemo } from "react";

/**
 * Reads the current theme from <html data-theme="..."> if present.
 * Falls back to "blue" (your default).
 */
function useTheme() {
    return useMemo(() => {
        const el = document.documentElement;
        const fromAttr = el.getAttribute("data-theme");
        if (fromAttr === "red" || fromAttr === "blue") return fromAttr;
        return "blue";
    }, []);
}

export default function Landing() {
    const theme = useTheme();

    // Choose hero image by theme
    const heroSrc =
        theme === "red"
            ? "/images/elementech_landing_red.png"
            : "/images/elementech_landing_blue.png";

    return (
        <div className="landing-wrap">
            <section className="landing-hero">
                <h1 className="landing-welcome">Welcome</h1>

                {/* Headline uses theme variables from your CSS (title-accent classes) */}
                <h2 className="landing-title">
                    <span className="title-accent-1">Hugh Murdoch</span>
                    <span className="title-sep"> - </span>
                    <span className="title-accent-2">Full-Stack Developer</span>
                </h2>

                <p className="landing-sub">
                    Explore technologies, projects, courses, my CV, and the Brain Box
                    forum. Use the navigation above, or click the home icon anytime to
                    return here.
                </p>

                {/* Frame keeps the theme glow; the image itself is now 50% width */}
                <div className="landing-image-frame">
                    <img
                        src={heroSrc}
                        alt="Portfolio hero"
                        className="landing-image"
                        loading="eager"
                    />
                </div>
            </section>
        </div>
    );
}
