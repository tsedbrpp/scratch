import { DocumentSection, ParsedDocument } from "./types";
import { STAKEHOLDER_KEYWORDS } from "./constants";

export function parseDocumentSections(text: string): ParsedDocument {
    const sections: DocumentSection[] = [];
    let taggedChars = 0;

    // Combined regex for structural markers (case-insensitive, multiline)
    const sectionPattern = /(?:^|\n)\s*(?:(?:(article|artikel|art\.)\s+(\d+(?:\.\d+)?))|(?:(section|sec\.)\s+(\d+(?:\.\d+)*))|(?:(recital|whereas)\s*(\d*))|(?:(chapter|part)\s+(\d+(?:\.\d+)?))|(?:(#{1,3})\s+(.+?)$)|(?:(\d+(?:\.\d+)*)\.\s+([A-Z][^\n]{5,})))\s*[—–:\-.]?\s*([^\n]*)/gim;

    const matches: Array<{ index: number; tag: string; heading: string }> = [];
    let match: RegExpExecArray | null;

    while ((match = sectionPattern.exec(text)) !== null) {
        let tag = '';
        let heading = '';

        if (match[1]) {
            // Article pattern
            tag = `Article ${match[2]}`;
            heading = match[13]?.trim() || '';
        } else if (match[3]) {
            // Section pattern
            tag = `Section ${match[4]}`;
            heading = match[13]?.trim() || '';
        } else if (match[5]) {
            // Recital/Whereas pattern
            tag = match[6] ? `Recital ${match[6]}` : 'Recital';
            heading = match[13]?.trim() || '';
        } else if (match[7]) {
            // Chapter/Part pattern
            tag = `${match[7].charAt(0).toUpperCase() + match[7].slice(1).toLowerCase()} ${match[8]}`;
            heading = match[13]?.trim() || '';
        } else if (match[9]) {
            // Markdown heading
            tag = `Heading (L${match[9].length})`;
            heading = match[10]?.trim() || '';
        } else if (match[11]) {
            // Numbered heading (e.g., "1. Introduction")
            tag = `Section ${match[11]}`;
            heading = match[12]?.trim() || '';
        }

        if (tag) {
            matches.push({ index: match.index, tag, heading });
        }
    }

    // Build sections from matches
    if (matches.length > 0) {
        for (let i = 0; i < matches.length; i++) {
            const start = matches[i].index;
            const end = i < matches.length - 1 ? matches[i + 1].index : text.length;
            const content = text.substring(start, end).trim();

            sections.push({
                tag: matches[i].tag,
                heading: matches[i].heading || undefined,
                content,
                charOffset: start,
                charLength: content.length,
            });
            taggedChars += content.length;
        }
    }

    // If no structural markers found, fall back to paragraph chunking
    if (sections.length === 0) {
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50);
        paragraphs.forEach((para, idx) => {
            const offset = text.indexOf(para);
            sections.push({
                tag: `Paragraph ${idx + 1}`,
                content: para.trim(),
                charOffset: offset >= 0 ? offset : 0,
                charLength: para.trim().length,
            });
        });
        // Fallback paragraphs don't count as "tagged"
        taggedChars = 0;
    }

    const parsingConfidence = text.length > 0 ? Math.min(taggedChars / text.length, 1.0) : 0;

    console.warn(`[GHOST_NODES] Parsed ${sections.length} sections (confidence: ${(parsingConfidence * 100).toFixed(0)}%)`);

    return { sections, parsingConfidence };
}

export function formatSectionsForPrompt(sections: DocumentSection[], charBudget: number): string {
    // Score each section by stakeholder relevance
    const scored = sections.map(s => {
        const textLower = (s.content + ' ' + (s.heading || '')).toLowerCase();
        const relevance = STAKEHOLDER_KEYWORDS.reduce(
            (score, kw) => score + (textLower.includes(kw) ? 1 : 0), 0
        );
        // Structural priority bonus for preamble, introduction, definitions, conclusion
        const structuralBonus = /preamble|introduction|definitions?|conclusion|scope|purpose/i.test(s.tag + ' ' + (s.heading || '')) ? 3 : 0;
        return { section: s, score: relevance + structuralBonus };
    });

    // Sort by relevance (highest first), then by document order for ties
    scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.section.charOffset - b.section.charOffset;
    });

    let output = '';
    let remaining = charBudget;

    for (const { section } of scored) {
        const header = section.heading
            ? `[SECTION: ${section.tag} — ${section.heading}] (chars ${section.charOffset}-${section.charOffset + section.charLength})`
            : `[SECTION: ${section.tag}] (chars ${section.charOffset}-${section.charOffset + section.charLength})`;

        const entry = `${header}\n${section.content}\n\n`;

        if (entry.length <= remaining) {
            output += entry;
            remaining -= entry.length;
        } else if (remaining > 200) {
            // Truncate this section to fit
            output += `${header}\n${section.content.substring(0, remaining - header.length - 20)}...\n\n`;
            break;
        } else {
            break;
        }
    }

    return output;
}
