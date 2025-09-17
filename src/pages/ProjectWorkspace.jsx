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
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function findFirstFile(nodes = []) {
    for (const n of nodes) {
        if (n.type === "file") return n;
        const c = findFirstFile(n.children || []);
        if (c) return c;
    }
    return null;
}

export default function ProjectWorkspace() {
    const { tech = "", project = "" } = useParams();
    const [all, setAll] = useState(null);
    const [err, setErr] = useState("");
    const [openFile, setOpenFile] = useState(null);

    useEffect(() => {
        const url = `${BASE}/data/projects.json`;
        fetch(url, { cache: "no-cache" })
            .then((r) => {
                if (!r.ok) throw new Error(`Failed to load ${url} (${r.status})`);
                return r.json();
            })
            .then(setAll)
            .catch((e) => setErr(String(e.message || e)));
    }, []);

    const item = useMemo(() => {
        if (!all) return null;
        const t = tech.toLowerCase();
        const p = project.toLowerCase();
        const group = all.filter((prj) => String(prj.tech || "").toLowerCase() === t);
        let found = group.find((prj) => slugify(prj.slug || "") === p);
        if (found) return found;
        found = group.find((prj) => slugify(prj.title || "") === p);
        return found || null;
    }, [all, tech, project]);

    useEffect(() => {
        if (item?.files) setOpenFile(findFirstFile(item.files) || null);
    }, [item]);

    if (err) {
        return (
            <GlowPanel title="Load error">
                <div className="text-red-300">{err}</div>
            </GlowPanel>
        );
    }
    if (!all) return <div>Loading…</div>;
    if (!item) {
        return (
            <GlowPanel title="Not found">
                <div className="text-zinc-300">
                    Project not found.{" "}
                    <Link to="/technologies" className="text-red-300 underline">
                        Back to Technologies
                    </Link>
                </div>
            </GlowPanel>
        );
    }

    const tags = Array.isArray(item.tags) && item.tags.length ? item.tags : [item.tech].filter(Boolean);
    const Panel = ({ title, children }) => (
        <GlowPanel
            title={title}
            className="rounded-2xl border border-zinc-800/70 bg-zinc-900/70 backdrop-blur p-3 shadow-[0_0_25px_rgba(239,68,68,0.35)]"
        >
            {children}
        </GlowPanel>
    );

    return (
        <div className="w-full px-4 md:px-6">
            <div className="mx-auto max-w-[1700px]"> {/* 20% wider container */}

                {/* Header */}
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Link
                            to="/technologies"
                            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-3 py-1.5 text-sm text-zinc-200 hover:border-red-500/40 hover:text-red-300"
                        >
                            ← Back
                        </Link>
                        <h1 className="text-lg font-semibold text-zinc-100">
                            <span className="text-red-300">
                                {item.tech?.charAt(0).toUpperCase() + item.tech?.slice(1)}
                            </span>{" "}
                            / {item.title}
                        </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {tags.map((t) => (
                            <span
                                key={t}
                                className="rounded-md border border-red-900/40 bg-red-900/30 px-2 py-0.5 text-xs text-red-200"
                            >
                                {t}
                            </span>
                        ))}
                        {item.repoUrl && (
                            <a
                                href={item.repoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-red-300 hover:underline"
                            >
                                View repo ↗
                            </a>
                        )}
                    </div>
                </div>

                {/* ===== 5-column grid ===== */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:auto-rows-[minmax(360px,auto)]">
                    {/* (1) Files — left 2 cols */}
                    <div className="lg:col-span-2">
                        <Panel title="Project Files">
                            <div className="h-[58vh] overflow-auto rounded-xl border border-zinc-800/60 p-2 lg:h-[48vh] xl:h-[52vh] 2xl:h-[56vh]">
                                <FileTree nodes={item.files || []} onOpenFile={setOpenFile} />
                            </div>
                        </Panel>
                    </div>

                    {/* (2) Browser — right 3 cols */}
                    <div className="lg:col-span-3">
                        <Panel title="Browser">
                            <BrowserView url={item.homepageUrl} />
                        </Panel>
                    </div>

                    {/* (3) Screenshots — left 2 cols */}
                    <div className="lg:col-span-2">
                        <Panel title="Screenshots">
                            <ScreenshotGallery shots={item.screenshots || []} />
                        </Panel>
                    </div>

                    {/* (4) Code — right 3 cols */}
                    <div className="lg:col-span-3">
                        <Panel title="Code">
                            <CodeViewer node={openFile} />
                        </Panel>
                    </div>
                </div>
                {/* ===== /5-column grid ===== */}

            </div>
        </div>
    );
}
