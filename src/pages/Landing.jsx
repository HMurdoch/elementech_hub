// src/pages/Landing.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Reads <html data-theme="..."> and updates when it changes.
 * Returns "blue" | "red"
 */
function useTheme() {
    const read = () =>
        document.documentElement.getAttribute("data-theme") === "red"
            ? "red"
            : "blue";

    const [theme, setTheme] = useState(read);

    useEffect(() => {
        const el = document.documentElement;
        const obs = new MutationObserver((muts) => {
            for (const m of muts) {
                if (m.attributeName === "data-theme") {
                    setTheme(read());
                    break;
                }
            }
        });
        obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
        return () => obs.disconnect();
    }, []);

    return theme;
}

/**
 * Canvas-based “particles write text” hero.
 * Draws the text using a mask and fills it with traveling particles.
 * All canvases have pointer-events: none so the navbar remains fully clickable.
 */
function ParticleTextHero({ theme, text = "HUGH MURDOCH\nAI WEBMASTER" }) {
    const hostRef = useRef(null);

    // keep a stable bag of refs for animation state
    const state = useRef({
        c1: null, // { canvas, ctx }
        c2: null,
        c3: null,
        rafId: 0,
        intervalId: 0,
        particles: [],
        frequency: 20,
        mounted: false,
    });

    // theme palette (you can tweak the hues here)
    const palette = useMemo(
        () =>
            theme === "red"
                ? {
                    big: "#FF5E4C",
                    small: "#ED413C",
                    bg: "#0B0B0B",
                }
                : {
                    big: "#42E4FF", // cyanish
                    small: "#00B7FF", // bright blue
                    bg: "#070B11",
                },
        [theme]
    );

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;

        // ----- helpers -----
        const createLayer = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.style.position = "absolute";
            canvas.style.inset = "0";
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            canvas.style.pointerEvents = "none";
            return { canvas, ctx };
        };

        const fit = () => {
            const { width, height } = host.getBoundingClientRect();
            for (const L of [st.c1, st.c2, st.c3]) {
                L.canvas.width = Math.max(1, Math.round(width));
                L.canvas.height = Math.max(1, Math.round(height));
            }
            // redraw text mask at new size
            writeText(st.c2, text);
        };

        const writeText = (layer, t) => {
            const { canvas, ctx } = layer;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const lines = t.split("\n");

            // responsive sizing
            const base = Math.max(28, Math.min(canvas.width / 10, 120));
            const lineHeight = Math.round(base * 0.7);

            ctx.save();
            ctx.font = `600 ${base}px Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#111"; // text used as mask only

            const midX = canvas.width / 2;
            const midY = canvas.height / 2;
            const blockH = lineHeight * lines.length;
            const startY = midY - blockH / 2 + lineHeight / 2;

            lines.forEach((line, i) => {
                ctx.fillText(line, midX, startY + i * lineHeight);
            });
            ctx.restore();
        };

        class Particle {
            constructor(ctx, w, h) {
                this.ctx = ctx;
                this.w = w;
                this.h = h;
                this.x = w / 2;
                this.y = h / 2;
                this.a = Math.random() * Math.PI * 2;
                this.s = 3 + Math.random(); // speed
                this.radius = 0.5 + Math.random() * 20;
                this.color = this.radius > 5 ? palette.big : palette.small;
            }
            render() {
                const { ctx } = this;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.closePath();
            }
            move() {
                this.x += Math.cos(this.a) * this.s;
                this.y += Math.sin(this.a) * this.s;
                this.a += Math.random() * 0.8 - 0.4;
                if (
                    this.x < -this.radius ||
                    this.y < -this.radius ||
                    this.x > this.w + this.radius ||
                    this.y > this.h + this.radius
                ) {
                    return false;
                }
                this.render();
                return true;
            }
        }

        const clearTrail = () => {
            const { ctx, canvas } = st.c1;
            ctx.globalAlpha = 0.03; // long trail
            ctx.fillStyle = palette.bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1;
        };

        const blur = (layer, amt) => {
            const { ctx, canvas } = layer;
            ctx.filter = `blur(${amt}px)`;
            ctx.drawImage(canvas, 0, 0);
            ctx.filter = "none";
        };

        const mask = () => {
            const src = st.c1;
            const mask = st.c2;
            const out = st.c3;

            // paint text mask into output, then keep only trail where mask exists
            out.ctx.clearRect(0, 0, out.canvas.width, out.canvas.height);
            out.ctx.drawImage(mask.canvas, 0, 0);
            out.ctx.globalCompositeOperation = "source-atop";
            out.ctx.drawImage(src.canvas, 0, 0);
            out.ctx.globalCompositeOperation = "source-over";

            // slight blur on the source trail to soften edges
            blur(src, 2);
        };

        const popolate = () => {
            st.particles.push(
                new Particle(st.c1.ctx, st.c1.canvas.width, st.c1.canvas.height)
            );
            // keep list bounded (prevents runaway allocations)
            if (st.particles.length > 1200) st.particles.splice(0, 200);
        };

        const tick = () => {
            st.rafId = requestAnimationFrame(tick);
            clearTrail();
            st.particles = st.particles.filter((p) => p.move());
            mask();
        };

        const mountLayers = () => {
            host.innerHTML = ""; // reset
            st.c1 = createLayer();
            st.c2 = createLayer();
            st.c3 = createLayer();
            st.c1.canvas.style.zIndex = "0";
            st.c2.canvas.style.zIndex = "0";
            st.c3.canvas.style.zIndex = "0";
            // Only output canvas is added to DOM (so we draw “into” it)
            host.appendChild(st.c3.canvas);
            fit();
        };

        const st = state.current;
        if (!st.mounted) {
            mountLayers();
            st.intervalId = window.setInterval(popolate, st.frequency);
            st.rafId = requestAnimationFrame(tick);
            st.mounted = true;
        } else {
            // theme changed — just redraw text + keep anim running
            writeText(st.c2, text);
        }

        const onResize = () => fit();
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
            if (st.intervalId) window.clearInterval(st.intervalId);
            if (st.rafId) cancelAnimationFrame(st.rafId);
            st.intervalId = 0;
            st.rafId = 0;
            st.particles = [];
            st.mounted = false;
        };
    }, [palette, text]); // re-run and rebuild when theme palette or text changes

    return (
        <div
            ref={hostRef}
            className="particle-text-hero"
            aria-hidden="true"
            role="img"
            // Height of the banner area; tweak to taste or make it responsive via CSS
            style={{
                position: "relative",
                width: "100%",
                height: "260px",
                pointerEvents: "none",
            }}
        />
    );
}

export default function Landing() {
    const theme = useTheme();

    // keep the rest of your landing content (image card, etc.)
    const heroImg = useMemo(() => {
        const file =
            theme === "red" ? "elementech_landing_red.png" : "elementech_landing_blue.png";
        return `/images/${file}?t=${theme}`;
    }, [theme]);

    return (
        <section className="landing-hero">
            {/* New particles write-text banner */}
            <ParticleTextHero
                theme={theme}
                text={"HUGH MURDOCH\nAI WEBMASTER"}
            />

            {/* Optional one-liner under the banner */}
            <p className="landing-sub" style={{ textAlign: "center", marginTop: "8px" }}>
                Explore technologies, projects, courses, my CV, and the Brain Box forum.
            </p>

            {/* Keep your existing image panel below (unchanged) */}
            <div className="landing-image-shell glow-panel glow-panel--hero">
                <img
                    key={heroImg}
                    src={heroImg}
                    alt="Elementech Hub Interactive Portfolio - Hugh Murdoch"
                    className="landing-image"
                    loading="eager"
                    decoding="sync"
                />
            </div>
        </section>
    );
}
