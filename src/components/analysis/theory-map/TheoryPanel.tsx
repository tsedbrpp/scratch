import { TheoryPanelData, TheoryMapMode } from "./types";
import { TeaStrip } from "./TeaStrip";
import { EmbeddingLegibilityMap } from "./EmbeddingLegibilityMap";

interface Props {
    data: TheoryPanelData;
    mode: TheoryMapMode;
}

export function TheoryPanel({ data, mode }: Props) {
    // Mode-based styles to handle journal vs interactive
    const isJournal = mode === "journal";
    const containerClass = isJournal
        ? "border border-neutral-300 rounded-sm p-4 bg-white"
        : "border border-neutral-800 rounded-xl p-6 bg-neutral-900 shadow-2xl overflow-hidden relative";

    return (
        <div className={containerClass}>
            <div className="mb-6 border-b border-neutral-800 pb-4">
                <h2 className={`font-medium ${isJournal ? "text-xl text-black" : "text-2xl text-neutral-100"}`}>
                    {data.title}
                </h2>
                <p className={`text-sm mt-1.5 ${isJournal ? "text-neutral-500" : "text-neutral-400"}`}>
                    <strong>Micro Deep-Dive:</strong> Comparative mechanics of a single highly-contested concept.
                </p>
            </div>

            {/* The Central Bridge: TEA Mechanism Strip */}
            <TeaStrip tea={data.tea} mode={mode} theme={data.theme} />

            {/* The Split Comparative Readings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Left: Actor-Network Theory */}
                <div className={`p-4 rounded-lg ${isJournal ? "bg-neutral-50" : "bg-neutral-800/50"}`}>
                    <h3 className={`text-sm tracking-wider uppercase font-semibold mb-4 ${isJournal ? "text-neutral-600" : "text-neutral-400"}`}>
                        Actor-Network Reading
                    </h3>
                    <ul className="space-y-3 mb-6 text-sm text-neutral-300">
                        {data.ant.bullets.map((b, i) => (
                            <li key={i} className={`flex items-start ${isJournal ? "text-neutral-800" : ""}`}>
                                <span className="mr-2 mt-1 block w-1.5 h-1.5 rounded-full bg-emerald-500/50 shrink-0" />
                                <span>{b}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right: Assemblage Theory */}
                <div className={`p-4 rounded-lg ${isJournal ? "bg-neutral-50" : "bg-neutral-800/50"}`}>
                    <h3 className={`text-sm tracking-wider uppercase font-semibold mb-4 ${isJournal ? "text-neutral-600" : "text-neutral-400"}`}>
                        Assemblage Reading
                    </h3>
                    <ul className="space-y-3 mb-6 text-sm text-neutral-300">
                        {data.assemblage.bullets.map((b, i) => (
                            <li key={i} className={`flex items-start ${isJournal ? "text-neutral-800" : ""}`}>
                                <span className="mr-2 mt-1 block w-1.5 h-1.5 rounded-full bg-sky-500/50 shrink-0" />
                                <span>{b}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Primary finding/implication */}
            <div className={`mt-6 p-4 rounded-lg border-l-4 border-${data.theme}-500 ${isJournal ? "bg-neutral-100 text-black" : "bg-neutral-800/80 text-neutral-200"}`}>
                <p className="text-sm italic">{data.implication}</p>
            </div>

            {/* Secondary Scoring Map built into the panel footer or side */}
            <div className="mt-8 border-t border-neutral-800 pt-6">
                <EmbeddingLegibilityMap
                    term={data.tea.term}
                    embeddingScore={data.tea.embeddingScore}
                    legibilityScore={data.tea.legibilityScore}
                    legibilityType={data.tea.legibilityType}
                    theme={data.theme}
                    mode={mode}
                />
            </div>
        </div>
    );
}
