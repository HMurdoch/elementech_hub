// src/pages/CMS.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GlowPanel from "../components/GlowPanel";
import { setOverride, clearOverride } from "../data/loaders";
import CMSCVPanel from "../components/cms/CMSCVPanel";

const FILES = [
    { key: "technologies", path: "/data/technologies.json", title: "Technologies" },
    { key: "projects", path: "/data/projects.json", title: "Projects" },
    { key: "courses", path: "/data/courses.json", title: "Courses" },
    { key: "cv", path: "/data/cv.json", title: "Curriculum Vitae" },
    { key: "brainbox", path: "/data/brainbox.json", title: "Brain Box (seed)" },
];

export default function CMS() {
    const [active, setActive] = useState(FILES[0].key);
    const [text, setText] = useState("{}");
    const [status, setStatus] = useState("");
    const file = FILES.find((f) => f.key === active);

    const load = async () => {
        setStatus("Loading…");
        try {
            const r = await fetch(file.path, { cache: "no-cache" });
            const data = await r.json();
            setText(JSON.stringify(data, null, 2));
            setStatus("Loaded from server file");
        } catch (e) {
            setStatus("Failed to load: " + e.message);
        }
    };

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [active]);

    const validate = () => {
        try {
            JSON.parse(text);
            setStatus("Valid JSON ✔️");
        } catch (e) {
            setStatus("Invalid JSON: " + e.message);
        }
    };

    const saveRuntime = () => {
        try {
            setOverride(active, JSON.parse(text));
            setStatus("Saved runtime override (localStorage). Refresh pages to see changes.");
        } catch (e) {
            setStatus("Invalid JSON: " + e.message);
        }
    };

    const clear = () => {
        clearOverride(active);
        setStatus("Cleared runtime override. Reload to use server file.");
    };

    const download = () => {
        const a = document.createElement("a");
        const blob = new Blob([text], { type: "application/json" });
        a.href = URL.createObjectURL(blob);
        a.download = `${active}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    const onUpload = (file) => {
        const fr = new FileReader();
        fr.onload = () => setText(fr.result);
        fr.readAsText(file);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="space-y-4"
        >
            <GlowPanel>
                <div className="cv-section-title">CMS Live Editor (Sandboxed)</div><br /><br />
                {/* Tabs */}
                <div className="cms-tabs mb-3">
                    {FILES.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setActive(f.key)}
                            className={`cms-tab ${active === f.key ? "cms-tab--active" : ""}`}
                        >
                            {f.title}
                        </button>
                    ))}
                </div>

                <div className="cms-status mb-2">{status}</div>

                <div className="grid gap-3 md:grid-cols-3">
                    {/* Left: JSON Editor */}
                    <div className="md:col-span-2">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={24}
                            className="cms-textarea"
                        />
                    </div>

                    {/* Right: Actions */}
                    <div className="space-y-2">
                        <button onClick={load} className="cms-btn">Reload from server</button>
                        <button onClick={validate} className="cms-btn">Validate JSON</button>
                        <button onClick={saveRuntime} className="cms-btn">Save Runtime Override</button>
                        <button onClick={clear} className="cms-btn">Clear Override</button>
                        <button onClick={download} className="cms-btn">Download JSON</button>

                        <label className="cms-btn cursor-pointer">
                            Upload JSON
                            <input
                                type="file"
                                accept="application/json"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
                            />
                        </label>

                        <p className="text-xs cms-status">
                            Saving to server files requires a backend. Runtime overrides are stored locally and
                            applied immediately.
                        </p>
                    </div>
                </div>
            </GlowPanel>

            {active === "cv" && (
                <GlowPanel>
                    <div className="cv-section-title">Curriculum Vitae — Live Editor</div><br /><br />
                    <CMSCVPanel />
                </GlowPanel>
            )}
        </motion.div>
    );
}
