"use client"

import {useState} from "react"

export function ReadMore({ text = "" }: { text?: string | null }) {
    const safeText = typeof text === "string" ? text : "";
    const [expanded, setExpanded] = useState(false);

    const shouldTruncate = safeText.length > 200;
    const displayText = expanded || !shouldTruncate
        ? safeText
        : safeText.slice(0, 200) + "...";

    return (
        <div>
            <p className="whitespace-pre-wrap">{displayText}</p>
            {shouldTruncate && (
                <button
                    className="text-blue-500 text-sm mt-1 hover:underline"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? "Read less" : "Read more"}
                </button>
            )}
        </div>
    );
}