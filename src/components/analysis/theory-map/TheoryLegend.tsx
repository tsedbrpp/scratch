import { TheoryMapMode } from "./types";

interface Props {
    mode: TheoryMapMode;
}

export function TheoryLegend({ mode }: Props) {
    const isJournal = mode === "journal";

    return (
        <div className={`mt-8 p-4 border-t flex flex-wrap gap-6 text-sm ${isJournal ? "border-neutral-300 text-neutral-600" : "border-neutral-800 text-neutral-400"}`}>
            <div className="flex items-center gap-2">
                <span className="block w-2 h-2 rounded-full bg-emerald-500/50" />
                <span>Actor-Network Reading</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="block w-2 h-2 rounded-full bg-sky-500/50" />
                <span>Assemblage Reading</span>
            </div>
        </div>
    );
}
