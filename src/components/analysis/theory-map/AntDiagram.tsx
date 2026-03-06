import { DiagramConfig, TheoryMapMode } from "./types";

interface Props {
    config: DiagramConfig;
    mode: TheoryMapMode;
}

export function AntDiagram({ config, mode }: Props) {
    const isJournal = mode === "journal";
    // Basic rendering of nodes and edges in SVG.
    // We apply simple layout offsets for the demo.

    return (
        <div className={`mt-4 w-full h-48 rounded-md relative overflow-hidden ${isJournal ? "bg-white border border-neutral-300" : "bg-neutral-900/50 border border-neutral-800"}`}>
            <svg className="absolute inset-0 w-full h-full">
                {/* Draw Edges */}
                {config.edges.map((edge, i) => {
                    const fromNode = config.nodes.find(n => n.id === edge.from);
                    const toNode = config.nodes.find(n => n.id === edge.to);

                    if (!fromNode || !toNode) return null;

                    return (
                        <line
                            key={`edge-${i}`}
                            x1={`${fromNode.x}%`}
                            y1={`${fromNode.y}%`}
                            x2={`${toNode.x}%`}
                            y2={`${toNode.y}%`}
                            stroke={isJournal ? "#a3a3a3" : "#525252"}
                            strokeWidth="2"
                            strokeDasharray={edge.style === "dashed" ? "4 4" : "none"}
                        />
                    );
                })}

                {/* Draw Nodes */}
                {config.nodes.map((node, i) => (
                    <svg key={`node-${i}`} x={`${node.x}%`} y={`${node.y}%`} overflow="visible">
                        <circle
                            r={node.kind === "opp" ? 8 : 6}
                            fill={isJournal ? (node.kind === "opp" ? "#ef4444" : "#10b981") : (node.kind === "opp" ? "#f87171" : "#34d399")}
                            className={node.kind === "opp" ? "animate-pulse" : ""}
                        />
                        <text
                            y={20}
                            textAnchor="middle"
                            className={`text-xs ${isJournal ? "fill-neutral-800 font-medium" : "fill-neutral-400"}`}
                        >
                            {node.label || node.id}
                        </text>
                    </svg>
                ))}
            </svg>
        </div>
    );
}
