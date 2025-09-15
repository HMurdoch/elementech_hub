import React, { useState } from "react";

export default function FileTree({ nodes = [], onOpenFile }) {
    return (
        <div className="text-sm">
            {nodes.map(n => <TreeNode key={n.path} node={n} onOpenFile={onOpenFile} />)}
        </div>
    );
}

function TreeNode({ node, depth = 0, onOpenFile }) {
    const [open, setOpen] = useState(true);
    const isFolder = node.type === "folder";

    return (
        <div>
            <div
                className="group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 hover:bg-zinc-800/60"
                style={{ paddingLeft: depth * 12 + 8 }}
                onClick={() => (isFolder ? setOpen(v => !v) : onOpenFile(node))}
            >
                <span className="text-zinc-400">{isFolder ? (open ? "▾" : "▸") : "⎘"}</span>
                <span className={isFolder ? "text-zinc-200" : "text-zinc-300"}>{node.name}</span>
            </div>
            {isFolder && open && node.children?.length ? (
                <div className="ml-0 border-l border-zinc-800/60">
                    {node.children.map(c => (
                        <TreeNode key={c.path} node={c} depth={depth + 1} onOpenFile={onOpenFile} />
                    ))}
                </div>
            ) : null}
        </div>
    );
}