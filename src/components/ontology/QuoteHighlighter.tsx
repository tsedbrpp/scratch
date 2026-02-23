import React from 'react';

/**
 * Renders text with embedded document quotes visually distinguished.
 * Detects text within "..." quotation marks (from LLM verbatim quotes)
 * and renders them as styled inline blockquotes matching the project's
 * existing quote style (italic, border-left, slightly highlighted).
 */
export function QuoteHighlighter({ text, className = '' }: { text: string; className?: string }) {
    // Match text within straight double-quotes — the format the LLM uses for verbatim document quotes
    const parts = text.split(/("(?:[^"\\]|\\.){8,}")/g);

    if (parts.length <= 1) {
        // No quotes detected — render plain
        return <span className={className}>{text}</span>;
    }

    return (
        <span className={className}>
            {parts.map((part, i) => {
                if (part.startsWith('"') && part.endsWith('"') && part.length > 10) {
                    // This is a quoted passage — render with blockquote styling
                    return (
                        <span
                            key={i}
                            className="italic bg-slate-100 text-slate-700 border-l-2 border-purple-300 pl-1.5 py-0.5 mx-0.5 inline-block rounded-r-sm"
                            title="Verbatim quote from document"
                        >
                            {part}
                        </span>
                    );
                }
                return <React.Fragment key={i}>{part}</React.Fragment>;
            })}
        </span>
    );
}
