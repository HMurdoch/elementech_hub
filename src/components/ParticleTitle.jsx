import React, { useEffect, useRef, useState } from "react";

/**
 * ParticleTitle
 * Renders a CodePen-style "particles write text" animation.
 *
 * Props:
 *  - lines: string[] (text lines to display)
 *  - fontSize: number (px)
 *  - lineHeight: number (px; default = fontSize * 0.75)
 *  - blur: number (canvas blur for the trailing effect; default 2)
 *  - frequency: number (ms between particle spawns; default 20)
 *  - density: number (0..1 alpha clear amount; default 0.03)
 *  - className: string (optional wrapper class)
 */
export default function ParticleTitle({
    lines = ["HUGH MURDOCH", "FULL-STACK DEVELOPER"],
    fontSize = 96,
    lineHeight,
    blur = 2,
    frequency = 20,
    density = 0.03,
    className = "",
}) {
    const wrapRef = useRef(null);
    const c1Ref = useRef(null); // particles
    const c2Ref = useRef(null); // text
    const c3Ref = useRef(null); // composite
    const rafRef = useRef(0);
    const timerRef = useRef(0);
    const [mounted, setMounted] = useState(false);

    // Internal particle
    class Particle {
        constructor(ctx, w, h, palette) {
            this.ctx = ctx;
            this.w = w;
            this.h = h;
            this.x = w / 2;
            this.y = h / 2;
            this.speed = 3 + Math.random();
            this.angle = 0;
            this.radius = 0.5 + Math.random() * 20;
            // 2-color palette from CSS vars (theme aware)
            const color =
                this.radius > 5 ? palette[0] : palette[1];
            this.color = color;
        }
        render() {
            const ctx = this.ctx;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }
        move() {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            this.angle += Math.random() * 0.8 - 0.4;
            if (this.x < 0 || this.x > this.w - this.radius) return false;
            if (this.y < 0 || this.y > this.h - this.radius) return false;
            this.render();
            return true;
        }
    }

    useEffect(() => {
        if (!wrapRef.current) return;
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const wrap = wrapRef.current;
        const c1 = c1Ref.current;
        const c2 = c2Ref.current;
        const c3 = c3Ref.current;
        const pCtx = c1.getContext("2d"); // particles
        const tCtx = c2.getContext("2d"); // text
        const mCtx = c3.getContext("2d"); // composite

        const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

        function sizeCanvases() {
            const { width } = wrap.getBoundingClientRect();
            const height = wrap.offsetHeight;

            [c1, c2, c3].forEach((cv) => {
                cv.width = Math.floor(width * dpr);
                cv.height = Math.floor(height * dpr);
                cv.style.width = `${width}px`;
                cv.style.height = `${height}px`;
            });

            pCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            tCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            mCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

            drawText();
        }

        function readPalette() {
            const style = getComputedStyle(document.documentElement);
            // variables defined in CSS per theme (see step 2)
            const p1 = style.getPropertyValue("--particle-1").trim() || "#3fd1ff";
            const p2 = style.getPropertyValue("--particle-2").trim() || "#5ca8ff";
            const bg = style.getPropertyValue("--hero-bg").trim() || "#111111";
            const txt = style.getPropertyValue("--hero-text-mask").trim() || "#111111";
            const link = style.getPropertyValue("--particle-link").trim() || p1;
            return { p1, p2, bg, txt, link };
        }

        function drawText() {
            const { txt } = readPalette();
            const w = c2.width / dpr;
            const h = c2.height / dpr;
            tCtx.clearRect(0, 0, w, h);
            tCtx.font = `${fontSize}px Montserrat, Inter, system-ui, sans-serif`;
            tCtx.fillStyle = txt;
            tCtx.textAlign = "center";
            tCtx.textBaseline = "middle";
            const lh = lineHeight || Math.round(fontSize * 0.75);
            const offset = ((lines.length - 1) * lh) / 2;
            lines.forEach((line, i) => {
                tCtx.fillText(line, w / 2, h / 2 + i * lh - offset);
            });
        }

        let particles = [];
        const palette = () => {
            const { p1, p2 } = readPalette();
            return [p1, p2];
        };

        function spawn() {
            particles.push(new Particle(pCtx, c1.width / dpr, c1.height / dpr, palette()));
            if (particles.length > 1200) particles.splice(0, particles.length - 1200);
        }

        function clearParticles() {
            const { bg } = readPalette();
            pCtx.globalAlpha = density;
            pCtx.fillStyle = bg;         // trail fade color
            pCtx.fillRect(0, 0, c1.width / dpr, c1.height / dpr);
            pCtx.globalAlpha = 1;
        }

        function blurLayer(ctx, cvs, amt) {
            ctx.filter = `blur(${amt}px)`;
            ctx.drawImage(cvs, 0, 0);
            ctx.filter = "none";
        }

        function composite() {
            // draw text onto c3
            mCtx.clearRect(0, 0, c3.width / dpr, c3.height / dpr);
            mCtx.drawImage(c2, 0, 0, c2.width, c2.height);
            mCtx.globalCompositeOperation = "source-atop";
            mCtx.drawImage(c1, 0, 0);
            mCtx.globalCompositeOperation = "source-over";
            blurLayer(pCtx, c1, blur);
        }

        function frame() {
            clearParticles();
            particles = particles.filter((p) => p.move());
            composite();
            rafRef.current = requestAnimationFrame(frame);
        }

        sizeCanvases();
        const spawnNow = () => spawn();
        timerRef.current = window.setInterval(spawnNow, frequency);
        rafRef.current = requestAnimationFrame(frame);
        window.addEventListener("resize", sizeCanvases);

        // react to theme changes live (MutationObserver on html[data-theme])
        const mo = new MutationObserver(() => {
            drawText(); // remask
        });
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

        return () => {
            window.clearInterval(timerRef.current);
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener("resize", sizeCanvases);
            mo.disconnect();
        };
    }, [mounted, lines, fontSize, lineHeight, blur, frequency, density]);

    return (
        <div className={`particle-title ${className}`} ref={wrapRef} aria-hidden="true">
            <canvas ref={c1Ref} />
            <canvas ref={c2Ref} />
            <canvas ref={c3Ref} />
        </div>
    );
}
