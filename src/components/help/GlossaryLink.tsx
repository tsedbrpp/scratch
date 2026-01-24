"use client";

import { HelpTooltip } from "./HelpTooltip";

interface GlossaryLinkProps {
    term: string;
    definition: string;
    children: React.ReactNode;
}

/**
 * Inline glossary term with tooltip definition
 * Renders as dotted underline text that shows definition on hover
 */
export function GlossaryLink({ term, definition, children }: GlossaryLinkProps) {
    return (
        <HelpTooltip
            title={term}
            description={definition}
            glossaryTerm={term.toLowerCase().replace(/\s+/g, '-')}
            showIcon={false}
        >
            <span className="underline decoration-dotted decoration-slate-400 cursor-help hover:decoration-slate-600 transition-colors">
                {children}
            </span>
        </HelpTooltip>
    );
}
