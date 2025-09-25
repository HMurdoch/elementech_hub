// src/components/GlowItem.jsx
import React from "react"

export default function GlowItem({ as: Tag = "div", className = "", children, right, onClick }) {
    return (
        <Tag
            onClick={onClick}
            className={`glow-item ${className}`}
        >
            <div className="flex items-center justify-between gap-3">
                <div>{children}</div>
                {right !== undefined && (
                    <div className="text-xs opacity-70">{right}</div>
                )}
            </div>
        </Tag>
    )
}