import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function CodeViewer({ node }) {
    const panel = "rounded-2xl border border-zinc-800/70 bg-zinc-900/70 backdrop-blur p-3";
    if (!node) {
        return (
            <div className={`${panel} flex h-full items-center justify-center text-zinc-400`}>
                <div className="flex flex-col items-center gap-2">
                    <span>‹ Select a file to preview code ›</span>
                </div>
            </div>
        );
    }
    return (
        <div className={`${panel} relative h-full`}>
            <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-zinc-300 font-medium">{node.path}</div>
                {node.language && <span className="rounded bg-red-900/50 px-2 py-0.5 text-xs text-red-200">{node.language}</span>}
            </div>
            <div className="h-[40vh] overflow-auto rounded-lg border border-zinc-800">
                <SyntaxHighlighter language={node.language || "jsx"} style={vscDarkPlus} customStyle={{ margin: 0, background: "#0a0a0a" }}>
                    {node.code || "// (No inline code provided for this file)"}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}