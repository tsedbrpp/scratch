import { TheoryMapMode } from "./types";

interface Props {
    tea: {
        term: string;
        referent: string;
        effect: string;
    };
    mode: TheoryMapMode;
    theme: string;
}

export function TeaStrip({ tea, mode, theme }: Props) {
    const isJournal = mode === "journal";
    const bgClass = isJournal ? "bg-neutral-100 border border-neutral-300" : `bg-${theme}-900/20 border border-${theme}-900/50`;
    const textClass = isJournal ? "text-neutral-900" : `text-${theme}-100`;
    const labelClass = isJournal ? "text-neutral-500" : `text-${theme}-400/80`;

    return (
        <div className={`flex flex-col md:flex-row w-full rounded-lg overflow-hidden ${bgClass}`}>
            {/* 1. Portable Term */}
            <div className={`flex-1 p-4 ${isJournal ? "border-b md:border-b-0 md:border-r border-neutral-300" : "border-b md:border-b-0 md:border-r border-neutral-800"}`}>
                <div className={`text-xs uppercase tracking-widest font-semibold mb-1 ${labelClass}`}>
                    Portable Governance Term
                </div>
                <div className={`font-medium ${textClass}`}>
                    {tea.term}
                </div>
            </div>

            {/* 2. Target/Referent Drift */}
            <div className={`flex-1 p-4 ${isJournal ? "border-b md:border-b-0 md:border-r border-neutral-300" : "border-b md:border-b-0 md:border-r border-neutral-800"}`}>
                <div className={`text-xs uppercase tracking-widest font-semibold mb-1 ${labelClass}`}>
                    Local Referential Drift
                </div>
                <div className={`font-medium ${textClass}`}>
                    {tea.referent}
                </div>
            </div>

            {/* 3. Embedded Effect */}
            <div className="flex-1 p-4">
                <div className={`text-xs uppercase tracking-widest font-semibold mb-1 ${labelClass}`}>
                    Embedded Effect
                </div>
                <div className={`font-medium ${textClass}`}>
                    {tea.effect}
                </div>
            </div>
        </div>
    );
}
