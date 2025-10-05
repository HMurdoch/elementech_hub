// src/pages/Landing.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import QuoteHero from "../components/QuoteHero";

/** Read <html data-theme="..."> and stay in sync */
function useTheme() {
    const read = () =>
        document.documentElement.getAttribute("data-theme") === "red"
            ? "red"
            : "blue";
    const [theme, setTheme] = useState(read);
    useEffect(() => {
        const el = document.documentElement;
        const obs = new MutationObserver(muts => {
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

/** Canvas “particles write text” hero with a faint 1px theme outline */
function ParticleTextHero({ theme, text = "HUGH MURDOCH\nAI WEBMASTER" }) {
    const hostRef = useRef(null);

    const state = useRef({
        c1: null, // trails
        c2: null, // text mask
        c3: null, // output
        rafId: 0,
        intervalId: 0,
        particles: [],
        frequency: 20,
        mounted: false
    });

    // theme palette
    const palette = useMemo(
        () =>
            theme === "red"
                ? { big: "#FF5E4C", small: "#ED413C", bg: "#0B0B0B", outline: "#ED413C" }
                : { big: "#42E4FF", small: "#00B7FF", bg: "#070B11", outline: "#00B7FF" },
        [theme]
    );

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;

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

        const st = state.current;

        const fit = () => {
            const { width, height } = host.getBoundingClientRect();
            for (const L of [st.c1, st.c2, st.c3]) {
                L.canvas.width = Math.max(1, Math.round(width));
                L.canvas.height = Math.max(1, Math.round(height));
            }
            writeMask(st.c2, text); // redraw mask at new size
        };

        // Draw the text mask (fill + hairline stroke) on layer c2
        const writeMask = (layer, t) => {
            const { canvas, ctx } = layer;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const lines = t.split("\n");

            const base = Math.max(28, Math.min(canvas.width / 10, 120));
            const lineHeight = Math.round(base * 0.7);

            ctx.save();
            ctx.font = `600 ${base}px Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#111"; // used only as alpha for masking
            ctx.strokeStyle = palette.outline;
            /*ctx.lineWidth = 1;*/
            ctx.globalAlpha = 0.30;   // faint
            ctx.lineWidth = 1;        // true 1px
            ctx.lineJoin = "round";
            ctx.miterLimit = 2;

            const midX = canvas.width / 2;
            const midY = canvas.height / 2;
            const blockH = lineHeight * lines.length;
            const startY = midY - blockH / 2 + lineHeight / 2;

            lines.forEach((line, i) => {
                const y = startY + i * lineHeight;
                ctx.fillText(line, midX, y);
                ctx.strokeText(line, midX, y); // same metrics = same size
            });
            ctx.restore();
        };

        // After compositing, lightly stroke the outline on the output
        const strokeOutline = (layer, t) => {
            const { canvas, ctx } = layer;
            const lines = t.split("\n");

            const base = Math.max(28, Math.min(canvas.width / 10, 120));
            const lineHeight = Math.round(base * 0.7);

            ctx.save();
            ctx.font = `600 ${base}px Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`; // match writeMask
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.strokeStyle = palette.outline;
            ctx.globalAlpha = 0.35;     // faint
            ctx.lineWidth = 1;

            const midX = canvas.width / 2;
            const midY = canvas.height / 2;
            const blockH = lineHeight * lines.length;
            const startY = midY - blockH / 2 + lineHeight / 2;

            lines.forEach((line, i) => {
                const y = startY + i * lineHeight;
                ctx.strokeText(line, midX, y);
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
                this.s = 3 + Math.random();
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
            ctx.globalAlpha = 0.03;
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
            const src = st.c1; // trails
            const mask = st.c2; // text+stroke
            const out = st.c3; // output

            out.ctx.clearRect(0, 0, out.canvas.width, out.canvas.height);
            out.ctx.drawImage(mask.canvas, 0, 0);
            out.ctx.globalCompositeOperation = "source-atop";
            out.ctx.drawImage(src.canvas, 0, 0);
            out.ctx.globalCompositeOperation = "source-over";

            blur(src, 2); // soften trail a touch
        };

        const popolate = () => {
            st.particles.push(
                new Particle(st.c1.ctx, st.c1.canvas.width, st.c1.canvas.height)
            );
            if (st.particles.length > 1200) st.particles.splice(0, 200);
        };

        const tick = () => {
            st.rafId = requestAnimationFrame(tick);
            clearTrail();
            st.particles = st.particles.filter(p => p.move());
            mask();
            strokeOutline(st.c3, text); // <- draw faint 1px border on top
        };

        const mountLayers = () => {
            host.innerHTML = "";
            st.c1 = createLayer();
            st.c2 = createLayer();
            st.c3 = createLayer();
            st.c1.canvas.style.zIndex = "0";
            st.c2.canvas.style.zIndex = "0";
            st.c3.canvas.style.zIndex = "0";
            host.appendChild(st.c3.canvas); // only output goes in DOM
            fit();
        };

        if (!st.mounted) {
            mountLayers();
            st.intervalId = window.setInterval(popolate, st.frequency);
            st.rafId = requestAnimationFrame(tick);
            st.mounted = true;
        } else {
            writeMask(st.c2, text); // theme changed
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
    }, [palette, text]);

    return (
        <div
            ref={hostRef}
            className="particle-text-hero"
            aria-hidden="true"
            role="img"
            style={{
                position: "relative",
                width: "100%",
                height: "260px",
                pointerEvents: "none"
            }}
        />
    );
}

export default function Landing() {
    const theme = useTheme();

    const heroImg = useMemo(() => {
        const file =
            theme === "red" ? "elementech_landing_red.png" : "elementech_landing_blue.png";
        return `/images/${file}?t=${theme}`;
    }, [theme]);

    return (
        <section className="landing-hero">
            <ParticleTextHero theme={theme} text={"HUGH MURDOCH\nAI WEBMASTER"} />
            <QuoteHero />
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
