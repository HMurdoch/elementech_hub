// src/pages/ProjectWorkspace.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import BrowserView from "../components/BrowserView";
import FileTree from "../components/FileTree";
import CodeViewer from "../components/CodeViewer";
import ScreenshotGallery from "../components/ScreenshotGallery";
import GlowPanel from "../components/GlowPanel";

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");

function slugify(s = "") {
    return String(s)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function findFirstFile(nodes = []) {
    for (const n of nodes) {
        if (n.type === "file") return n;
        const child = findFirstFile(n.children || []);
        if (child) return child;
    }
    return null;
}

export default function ProjectWorkspace() {
    const { tech = "", project = "" } = useParams();
    const [all, setAll] = useState(null);
    const [err, setErr] = useState("");
    const [openFile, setOpenFile] = useState(null);

    useEffect(() => {
        import("../data/projects.json")
              .then(mod => setAll(mod.default || mod.PROJECTS || []))
              .catch(e => setErr(String(e)));
      }, []);

    // Load projects.json with BASE-safe path
    useEffect(() => {
        const url = `${BASE}/data/projects.json`;
        fetch(url, { cache: "no-cache" })
            .then((r) => {
                if (!r.ok) throw new Error(`Failed to load ${url} (${r.status})`);
                return r.json();
            })
            .then(setAll)
            .catch((e) => setErr(e.message));
    }, []);

    const item = useMemo(() => {
        if (!all) return null;
        const t = tech.toLowerCase();
        const p = project.toLowerCase();

        // Accept either explicit slug, or fallback from title
        const candidates = all.filter((prj) => String(prj.tech || "").toLowerCase() === t);

        // first try explicit slug match
        let found = candidates.find((prj) => slugify(prj.slug || "") === p);
        if (found) return found;

        // then try slugified title
        found = candidates.find((prj) => slugify(prj.title || "") === p);
        return found || null;
    }, [all, tech, project]);

    useEffect(() => {
        if (item?.files) setOpenFile(findFirstFile(item.files) || null);
    }, [item]);

    if (err) {
        return (
            <GlowPanel title="Load error">
                <div className="text-red-300">{err}</div>
                <div className="mt-2 text-zinc-300">
                    Ensure <code>/public/data/projects.json</code> exists and is valid JSON.
                </div>
            </GlowPanel>
        );
    }
    if (!all) return <div>Loading…</div>;

    if (!item) {
        return (
            <div className="space-y-3">
                <GlowPanel title="Not found">
                    <div className="text-zinc-300">
                        Project not found. Check the <code>tech</code> and <code>slug</code> in{" "}
                        <code>public/data/projects.json</code>, or click{" "}
                        <Link className="text-red-300 underline" to="/technologies">
                            Back to Technologies
                        </Link>
                        .
                    </div>
                </GlowPanel>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">
                    <span className="text-red-300">
                        {item.tech?.charAt(0).toUpperCase() + item.tech?.slice(1)}
                    </span>{" "}
                    / {item.title}
                </h1>
                <Link to="/technologies" className="text-sm text-red-300 underline">
                    Back to Technologies
                </Link>
            </div>

            {/* 2x2 grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Browser */}
                <div className="space-y-3">
                    <GlowPanel title="Browser">
                        <BrowserView url={item.homepageUrl} />
                    </GlowPanel>
                </div>

                {/* Files + Code (stack) */}
                <div className="space-y-3">
                    <GlowPanel title="Files">
                        <div className="h-[52vh] overflow-auto rounded-xl border border-zinc-800/60 p-2">
                            <FileTree nodes={item.files || []} onOpenFile={setOpenFile} />
                        </div>
                    </GlowPanel>
                    <GlowPanel title="Code">
                        <CodeViewer node={openFile} />
                    </GlowPanel>
                </div>

                {/* Screenshots full width */}
                <div className="md:col-span-2">
                    <ScreenshotGallery shots={item.screenshots || []} />
                </div>
            </div>
        </div>
    );
}
