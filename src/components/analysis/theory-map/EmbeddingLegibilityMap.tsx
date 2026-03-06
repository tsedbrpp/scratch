import { TheoryMapMode } from "./types";

interface Props {
    term: string;
    embeddingScore: number;
    legibilityScore: number;
    legibilityType: "public" | "partial" | "distorted" | "market";
    theme: string;
    mode: TheoryMapMode;
}

export function EmbeddingLegibilityMap({ term, embeddingScore, legibilityScore, mode, theme }: Props) {
    const isJournal = mode === "journal";

    // Constrain coordinates to standard SVG bounding box percentage (0-100)
    const xPos = Math.max(5, Math.min(95, embeddingScore));
    const yPos = Math.max(5, Math.min(95, 100 - legibilityScore)); // Invert Y so High Legibility is at top

    // Generate descriptive text for the positioning map
    const getExplanation = () => {
        const embedText = embeddingScore >= 50 ? "high structural embedding" : "low structural embedding";
        const legibText = legibilityScore >= 50 ? "high public legibility" : "low public legibility";

        return `This mapping indicates that "${term}" exhibits ${embedText} alongside ${legibText} within the analyzed policy frameworks.`;
    };

    return (
        <div className={`pt-4 pb-2 w-full ${isJournal ? "text-neutral-800" : "text-neutral-200"}`}>
            <div className="flex justify-between items-center mb-4">
                <h4 className={`text-xs uppercase tracking-widest font-bold ${isJournal ? "text-neutral-500" : "text-neutral-500"}`}>
                    Positioning Map
                </h4>
                <div className="text-xs font-mono text-neutral-500">
                    E:{embeddingScore} | L:{legibilityScore}
                </div>
            </div>

            <div className={`relative w-full h-32 rounded-lg ${isJournal ? "bg-neutral-50 border border-neutral-200" : "bg-neutral-950/50 border border-neutral-800"} overflow-hidden`}>
                {/* XY Axis Lines */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-neutral-500/30" />
                <div className="absolute top-1/2 left-0 right-0 h-px bg-neutral-500/30" />

                {/* Axis Labels */}
                <span className="absolute top-1 right-2 text-[10px] text-neutral-500">High Legibility</span>
                <span className="absolute bottom-1 right-2 text-[10px] text-neutral-500">Low Legibility</span>
                <span className="absolute top-1/2 right-2 -translate-y-[150%] text-[10px] text-neutral-500">High Embedding</span>
                <span className="absolute top-1/2 left-2 -translate-y-[150%] text-[10px] text-neutral-500">Low Embedding</span>

                {/* Plotted Point & Label */}
                <div
                    className={`absolute w-3 h-3 rounded-sm -ml-1.5 -mt-1.5 bg-${theme}-500 flex items-center shadow-lg w-max ${isJournal ? "" : `shadow-${theme}-500/50`}`}
                    style={{ left: `${xPos}%`, top: `${yPos}%` }}
                >
                    <span className={`absolute whitespace-nowrap text-[11px] font-semibold tracking-wide shadow-sm z-10 px-1.5 py-0.5 rounded
                        ${xPos > 70 ? 'right-4' : 'left-4'} 
                        ${isJournal ? 'text-neutral-700 bg-white/90' : 'text-neutral-200 bg-neutral-900/90'}`}
                    >
                        {term}
                    </span>
                </div>

                {/* Pulsing ring if interactive */}
                {!isJournal && (
                    <div
                        className={`absolute w-3 h-3 rounded-sm -ml-1.5 -mt-1.5 bg-${theme}-400 animate-ping opacity-75`}
                        style={{ left: `${xPos}%`, top: `${yPos}%` }}
                    />
                )}
            </div>

            {/* Explanatory Text Support */}
            <div className={`mt-4 text-xs italic ${isJournal ? "text-neutral-600" : "text-neutral-400"}`}>
                <p>{getExplanation()}</p>
            </div>
        </div>
    );
}
