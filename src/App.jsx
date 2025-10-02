import React, { Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Technologies from "./pages/Technologies";
import Projects from "./pages/Projects";
import Courses from "./pages/Courses";
import CV from "./pages/CV";
import BrainBox from "./pages/BrainBox";
import CMS from "./pages/CMS";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import NavBar from "./components/NavBar";
import ParticlesBackground from "./components/ParticlesBackground";

function Fallback() {
    return <div className="p-4 text-[var(--fg-soft)]">Loading…</div>;
}
function NotFound() {
    return <div className="p-4 text-[var(--fg-soft)]">Not found. Try the menu above.</div>;
}

export default function App() {
    // Init theme once (default = blue)
    useEffect(() => {
        const saved = localStorage.getItem("theme") || "blue";
        if (saved === "blue") {
            document.documentElement.removeAttribute("data-theme");
        } else {
            document.documentElement.setAttribute("data-theme", saved);
        }
    }, []);

    return (
        <div className="min-h-screen relative app-bg">
            <>
            <ParticlesBackground />
            <NavBar />
            <main className="relative z-10 mx-auto max-w-[1400px] px-4 py-6">
                <Suspense fallback={<Fallback />}>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/technologies" element={<Technologies />} />
                        <Route path="/tech/:tech/:project" element={<ProjectWorkspace />} />
                        <Route path="/projects/*" element={<Projects />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/cv" element={<CV />} />
                        <Route path="/brainbox" element={<BrainBox />} />
                        <Route path="/cms" element={<CMS />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </main>
            </>
        </div>

    );
}