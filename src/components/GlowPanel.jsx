// src/components/GlowPanel.jsx
import React from "react"

export default function GlowPanel({ title, children, className = "" }) {
    return (
        <section className={`glow-panel ${className}`}>
            {title ? <h3 className="glow-heading">{title}</h3> : null}
            {children}
        </section>
    )
}