import React from "react";
export default function SectionHeader({ icon: Icon, title, action }) {
    return (
        <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
                {Icon ? <Icon className="h-5 w-5 text-red-400" /> : null}
                <h3 className="text-sm font-semibold tracking-wide text-red-300">{title}</h3>
            </div>
            {action}
        </div>
    );
}