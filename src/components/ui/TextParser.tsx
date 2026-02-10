import React from 'react';
import { cn } from "@/lib/utils";

interface TextParserProps {
    text: string;
    className?: string;
    highlightKeyPhrases?: boolean;
}

const SOCIOLOGICAL_TRIGGERS = [
    "the state is imagined as",
    "the state is presented as",
    "market actors are cast as",
    "market actors are presumed to",
    "civil society is",
    "the individual appears",
    "the individual is imagined as",
    "technology is framed as",
    "governance is conceived as",
    "rights are framed as"
];

export function TextParser({ text, className, highlightKeyPhrases = true }: TextParserProps) {
    if (!text) return null;

    // Split by bullet point • using regex to capture it or just split
    // The text often comes as "• Point 1 • Point 2"
    const items = text.split('•').map(p => p.trim()).filter(p => p.length > 0);

    // If no bullets found, try splitting by newlines or just return text
    if (items.length === 0 && text.trim().length > 0) {
        items.push(text.trim());
    }

    const parseContent = (content: string) => {
        // 1. Handle Markdown Bold (*text*)
        const parts = content.split(/(\*[^*]+\*)/g);

        return parts.map((part, i) => {
            if (part.startsWith('*') && part.endsWith('*')) {
                return <span key={i} className="font-bold text-slate-800">{part.slice(1, -1)}</span>;
            }

            // 2. Handle Quotes (if enabled) - Standard " and smart “”
            // We split by quotes first, then handle triggers inside non-quotes? 
            // Or handle quotes as a block that might contain triggers?
            // Designing this to be simple: Highlight the Background of quotes.
            // Split by quotes:
            const quoteRegex = /([“"][^”"]+[”"])/g;
            const subParts = part.split(quoteRegex);

            return (
                <span key={i}>
                    {subParts.map((sp, k) => {
                        const isQuote = (sp.startsWith('“') || sp.startsWith('"')) && (sp.endsWith('”') || sp.endsWith('"'));

                        // Process triggers inside this part (whether quote or not)
                        // If it's a quote, we wrap the result in the highlight class

                        const processTriggers = (text: string) => {
                            if (!highlightKeyPhrases) return text;

                            // This is a naive recursive split for triggers
                            // To avoid complex recursion, let's just do one pass for the first matching trigger?
                            // Or simpler: just return text for now within quotes to avoid mess, 
                            // OR map properly.

                            // Let's iterate triggers
                            let fragments: (string | React.ReactNode)[] = [text];

                            for (const trigger of SOCIOLOGICAL_TRIGGERS) {
                                const newFragments: (string | React.ReactNode)[] = [];
                                const regex = new RegExp(`(${trigger})`, 'i');

                                fragments.forEach(frag => {
                                    if (typeof frag === 'string') {
                                        const split = frag.split(regex);
                                        split.forEach(s => {
                                            if (s.toLowerCase() === trigger.toLowerCase()) {
                                                newFragments.push(<span key={`${i}-${k}-${s}`} className="text-indigo-600 font-medium px-0.5 rounded">{s}</span>);
                                            } else {
                                                newFragments.push(s);
                                            }
                                        });
                                    } else {
                                        newFragments.push(frag);
                                    }
                                });
                                fragments = newFragments;
                            }
                            return fragments;
                        };

                        const contentWithTriggers = processTriggers(sp);

                        if (isQuote) {
                            return (
                                <span key={k} className="bg-amber-50 text-amber-900 border-b-2 border-amber-100 px-0.5 mx-0.5 rounded-sm">
                                    {contentWithTriggers}
                                </span>
                            );
                        }

                        return <span key={k}>{contentWithTriggers}</span>;
                    })}
                </span>
            );
        });
    };

    return (
        <ul className={cn("space-y-3", className)}>
            {items.map((item, i) => (
                <li key={i} className="text-sm text-slate-600 leading-relaxed flex gap-2 items-start group">
                    <span className="text-indigo-300 mt-[5px] select-none group-hover:text-indigo-500 transition-colors">•</span>
                    <span className="block">{parseContent(item)}</span>
                </li>
            ))}
        </ul>
    );
}

// Utility to extract a punchy headline
export function extractKeyTakeaway(text: string): string | null {
    if (!text) return null;

    // Try to find the first meaningful sentence
    const clean = text.replace(/[•*]/g, '').trim();
    const firstSentence = clean.split(/[.?!]/)[0];

    // If it's too short (e.g. "None"), ignore
    if (firstSentence.length < 10) return null;

    // Cap length
    if (firstSentence.length > 120) return firstSentence.substring(0, 120) + "...";

    return firstSentence + ".";
}
