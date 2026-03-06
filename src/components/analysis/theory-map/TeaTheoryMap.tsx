import { TheoryPanelData, TheoryMapMode } from "./types";
import { TheoryPanel } from "./TheoryPanel";

interface Props {
    panels: TheoryPanelData[];
    mode: TheoryMapMode;
}

export function TeaTheoryMap({ panels, mode }: Props) {
    return (
        <div className={`theory-map-container ${mode === "journal" ? "bg-white text-black p-4" : ""}`}>
            {/* 2x2 Grid or stack depending on screen size and panel count */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {panels.map((panel) => (
                    <TheoryPanel key={panel.id} data={panel} mode={mode} />
                ))}
            </div>
        </div>
    );
}
