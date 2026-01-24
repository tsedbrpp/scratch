import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2, Circle, ArrowRight } from 'lucide-react';

export type AnalysisStepStatus = 'pending' | 'analyzing' | 'done' | 'error';

export interface DeepAnalysisProgressProps {
    status: {
        decolonial: AnalysisStepStatus;
        cultural: AnalysisStepStatus;
        logics: AnalysisStepStatus;
        legitimacy: AnalysisStepStatus;
    };
    currentStepMessage?: string;
}

const NODES = [
    { id: 'decolonial', label: 'Decolonial Framework', x: 300, y: 50, color: '#f59e0b' }, // Top (Amber)
    { id: 'cultural', label: 'Cultural Framing', x: 150, y: 150, color: '#3b82f6' },   // Left (Blue)
    { id: 'logics', label: 'Institutional Logics', x: 450, y: 150, color: '#8b5cf6' },  // Right (Violet)
    { id: 'legitimacy', label: 'Legitimacy Orders', x: 300, y: 250, color: '#10b981' }, // Bottom (Green)
];

const LINKS = [
    { from: 'decolonial', to: 'cultural' },
    { from: 'decolonial', to: 'logics' },
    { from: 'cultural', to: 'legitimacy' },
    { from: 'logics', to: 'legitimacy' },
    { from: 'cultural', to: 'logics' } // Cross link
];

export function DeepAnalysisProgressGraph({ status, currentStepMessage }: DeepAnalysisProgressProps) {

    const getNodeStatus = (id: string) => {
        return status[id as keyof typeof status] || 'pending';
    };

    return (
        <Card className="w-full bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                    <span>Analysis Entanglement</span>
                    {Object.values(status).some(s => s === 'analyzing') && (
                        <Badge variant="outline" className="animate-pulse bg-indigo-50 text-indigo-700 border-indigo-200">
                            Processing...
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription>
                    Tracing the document through the four-dimensional critical framework.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative w-full h-[300px] flex items-center justify-center select-none">
                    <svg width="100%" height="100%" viewBox="0 0 600 300" className="overflow-visible">
                        {/* Links */}
                        {LINKS.map((link, i) => {
                            const source = NODES.find(n => n.id === link.from)!;
                            const target = NODES.find(n => n.id === link.to)!;
                            const isSourceDone = getNodeStatus(link.from) === 'done';
                            const isTargetActive = getNodeStatus(link.to) !== 'pending';

                            const isActive = isSourceDone && isTargetActive;

                            return (
                                <line
                                    key={i}
                                    x1={source.x} y1={source.y}
                                    x2={target.x} y2={target.y}
                                    stroke={isActive ? "#64748b" : "#e2e8f0"}
                                    strokeWidth={isActive ? 2 : 1}
                                    strokeDasharray={isActive ? "none" : "5,5"}
                                    className="transition-all duration-500"
                                />
                            );
                        })}

                        {/* Nodes */}
                        {NODES.map((node) => {
                            const nodeStatus = getNodeStatus(node.id);
                            const isActive = nodeStatus === 'analyzing';
                            const isDone = nodeStatus === 'done';

                            return (
                                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                                    {/* Pulsing effect */}
                                    {isActive && (
                                        <circle r={35} fill={node.color} opacity={0.3} className="animate-ping" />
                                    )}

                                    {/* Main Circle */}
                                    <circle
                                        r={25}
                                        fill={isDone ? node.color : "white"}
                                        stroke={node.color}
                                        strokeWidth={isActive ? 3 : 2}
                                        className="transition-all duration-300"
                                    />

                                    {/* Icon / Status Indicator */}
                                    <foreignObject x={-12} y={-12} width={24} height={24} className="pointer-events-none">
                                        <div className="flex items-center justify-center w-full h-full text-white">
                                            {isActive ? (
                                                <Loader2 className={cn("w-5 h-5 animate-spin", isDone ? "text-white" : "text-slate-400")} style={{ color: isDone ? 'white' : node.color }} />
                                            ) : isDone ? (
                                                <CheckCircle2 className="w-5 h-5 text-white" />
                                            ) : (
                                                <Circle className="w-4 h-4 text-slate-200" />
                                            )}
                                        </div>
                                    </foreignObject>

                                    {/* Label */}
                                    <foreignObject x={-75} y={35} width={150} height={40}>
                                        <div className={cn(
                                            "text-center text-xs font-semibold transition-colors duration-300",
                                            isActive || isDone ? "text-slate-900 dark:text-slate-100" : "text-slate-400"
                                        )}>
                                            {node.label}
                                        </div>
                                    </foreignObject>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {currentStepMessage && (
                    <div className="mt-4 text-center">
                        <p className="text-sm text-slate-500 animate-pulse font-mono">
                            {currentStepMessage}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
