// src/components/ParticlesBackground.jsx
import { useEffect, useRef } from "react";

const PARTICLES_CDN = "https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js";

function loadParticlesLib() {
    return new Promise((resolve, reject) => {
        if (window.particlesJS) return resolve();
        const s = document.createElement("script");
        s.src = PARTICLES_CDN;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = (e) => reject(e);
        document.head.appendChild(s);
    });
}

function destroyParticles() {
    try {
        if (window.pJSDom && window.pJSDom.length) {
            window.pJSDom.forEach(({ pJS }) => {
                // official destroy
                pJS.fn.vendors.destroypJS();
            });
            window.pJSDom = [];
        }
        const el = document.getElementById("particles-js");
        if (el) el.innerHTML = ""; // remove stale canvas
    } catch {
        /* noop */
    }
}

function configFor(theme) {
    const red = "#ff3b3b";
    const blue = "#22b7ff";
    const particle = theme === "red" ? red : blue;

    return {
        particles: {
            number: { value: 180, density: { enable: true, value_area: 800 } },
            color: { value: particle },
            shape: { type: "circle", stroke: { width: 0, color: "#000" } },
            opacity: { value: 0.5, random: false },
            size: { value: 3, random: true },
            line_linked: {
                enable: true,
                distance: 150,
                color: particle,
                opacity: 0.35,
                width: 1,
            },
            move: {
                enable: true,
                speed: 1.4,
                direction: "none",
                random: false,
                straight: false,
                out_mode: "out",
                bounce: false,
            },
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "repulse" },
                onclick: { enable: true, mode: "push" },
                resize: true,
            },
            modes: {
                repulse: { distance: 120, duration: 0.4 },
                push: { particles_nb: 3 },
            },
        },
        retina_detect: true,
    };
}

export default function ParticlesBackground() {
    const themeRef = useRef(
        document.documentElement.getAttribute("data-theme") || "blue"
    );

    useEffect(() => {
        let mounted = true;

        const init = async (theme) => {
            try {
                await loadParticlesLib();
                if (!mounted) return;

                destroyParticles();
                const cfg = configFor(theme);
                // eslint-disable-next-line no-undef
                window.particlesJS("particles-js", cfg);
            } catch (e) {
                // silent failure – background is decorative
                // console.error("particles init failed", e);
            }
        };

        // init for current theme
        init(themeRef.current);

        // react to theme changes we dispatch from the navbar
        const onThemeChanged = (e) => {
            themeRef.current = e.detail || "blue";
            init(themeRef.current);
        };
        window.addEventListener("theme-changed", onThemeChanged);

        return () => {
            mounted = false;
            window.removeEventListener("theme-changed", onThemeChanged);
            destroyParticles();
        };
    }, []);

    return <div id="particles-js" aria-hidden="true" />;
}
