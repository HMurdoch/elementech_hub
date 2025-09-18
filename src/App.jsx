import React, { Suspense } from "react"
import { Routes, Route, NavLink, useNavigate } from "react-router-dom"
import Landing from "./pages/Landing"         
import Technologies from "./pages/Technologies"               
import Projects from "./pages/Projects"
import Courses from "./pages/Courses"
import CV from "./pages/CV"
import BrainBox from "./pages/BrainBox"
import CMS from "./pages/CMS"
import ProjectWorkspace from "./pages/ProjectWorkspace";

function HomeIcon({ className = "h-5 w-5" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z"
                className="stroke-red-300" strokeWidth="1.5" />
        </svg>
    )
}

const Nav = () => {
    const nav = useNavigate()
    return (
        <nav className="sticky top-0 z-50 backdrop-blur bg-black/55 border-b border-red-900/40 shadow-neon">
            <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-4 text-red-300">
                <button
                    onClick={() => nav("/")}
                    aria-label="Home"
                    className="rounded-lg border border-red-900/40 bg-red-900/20 p-1.5 hover:bg-red-900/30"
                    title="Home"
                >
                    <HomeIcon />
                </button>

                <NavLink to="/technologies" className={({ isActive }) => isActive ? "neon-text" : "hover:text-red-200"}>Technologies</NavLink>
                <NavLink to="/projects" className={({ isActive }) => isActive ? "neon-text" : "hover:text-red-200"}>Projects</NavLink>
                <NavLink to="/courses" className={({ isActive }) => isActive ? "neon-text" : "hover:text-red-200"}>Courses</NavLink>
                <NavLink to="/cv" className={({ isActive }) => isActive ? "neon-text" : "hover:text-red-200"}>CV</NavLink>
                <NavLink to="/brainbox" className={({ isActive }) => isActive ? "neon-text" : "hover:text-red-200"}>Brain Box</NavLink>
                <NavLink to="/cms" className={({ isActive }) => isActive ? "neon-text" : "hover:text-red-200"}>CMS</NavLink>
            </div>
        </nav>
    )
}

function Fallback() { return <div className="p-4 text-zinc-400">Loading…</div> }
function NotFound() { return <div className="p-4 text-zinc-400">Not found. Try the menu above.</div> }

export default function App() {
    return (
        <div className="app-bg min-h-screen text-white">
            <Nav />
            <main className="relative z-10 mx-auto max-w-[1400px] px-4 py-6">
                <Suspense fallback={<Fallback />}>
                    <Routes>
                        {/* NEW landing route */}
                        <Route path="/" element={<Landing />} />

                        {/* Technologies moved to /technologies */}
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
        </div>
    )
}
