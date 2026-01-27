import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2, Circle, TrendingUp, ShieldCheck, Activity, Users, Layers, MessageSquare } from 'lucide-react';

export type PipelineStepStatus = 'pending' | 'analyzing' | 'done' | 'error';

export interface AssemblageMethodologyGraphProps {
    status: {
        actants: PipelineStepStatus;
        relations: PipelineStepStatus;
        mechanisms: PipelineStepStatus;
        trajectory: PipelineStepStatus;
        critique: PipelineStepStatus;
        stress_test: PipelineStepStatus;
    };
    currentStepMessage?: string;
}

const NODES = [
    { id: 'actants', label: 'Actants & Agency', x: 200, y: 50, color: '#3b82f6', icon: Users }, // Blue
    { id: 'relations', label: 'Network Relations', x: 400, y: 50, color: '#8b5cf6', icon: Layers }, // Violet
    { id: 'mechanisms', label: 'Mechanisms (T/C)', x: 150, y: 150, color: '#10b981', icon: ShieldCheck }, // Emerald
    { id: 'trajectory', label: 'Trajectory Forecast', x: 450, y: 150, color: '#f59e0b', icon: TrendingUp }, // Amber
    { id: 'critique', label: 'Adversarial Critique', x: 300, y: 250, color: '#ef4444', icon: MessageSquare }, // Red
    { id: 'stress_test', label: 'Stress Test Capable', x: 300, y: 350, color: '#ec4899', icon: Activity }, // Pink
];

const LINKS = [
    { from: 'actants', to: 'relations' },
    { from: 'actants', to: 'mechanisms' },
    { from: 'relations', to: 'mechanisms' },
    { from: 'mechanisms', to: 'trajectory' },
    { from: 'mechanisms', to: 'critique' },
    { from: 'trajectory', to: 'critique' },
    { from: 'critique', to: 'stress_test' }
];

export function AssemblageMethodologyGraph({ status, currentStepMessage }: AssemblageMethodologyGraphProps) {

    const getNodeStatus = (id: string) => {
        return status[id as keyof typeof status] || 'pending';
    };

    return (
        <Card className="w-full bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 mb-6">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                    <span>Methodological Entanglement</span>
                    {Object.values(status).some(s => s === 'analyzing') && (
                        <Badge variant="outline" className="animate-pulse bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px]">
                            Processing...
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative w-full h-[400px] flex items-center justify-center select-none">
                    <svg width="100%" height="100%" viewBox="0 0 600 400" className="overflow-visible">
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
                                    stroke={isActive ? "#94a3b8" : "#e2e8f0"}
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
                            const Icon = node.icon;

                            return (
                                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                                    {/* Pulsing effect */}
                                    {isActive && (
                                        <circle r={35} fill={node.color} opacity={0.3} className="animate-ping" />
                                    )}

                                    {/* Main Circle */}
                                    <circle
                                        r={24}
                                        fill={isDone ? node.color : "white"}
                                        stroke={node.color}
                                        strokeWidth={isActive ? 2 : 1.5}
                                        className="transition-all duration-300 shadow-sm"
                                    />

                                    {/* Icon */}
                                    <foreignObject x={-12} y={-12} width={24} height={24} className="pointer-events-none">
                                        <div className="flex items-center justify-center w-full h-full text-white">
                                            {isActive ? (
                                                <Loader2 className={cn("w-5 h-5 animate-spin", isDone ? "text-white" : "text-slate-400")} style={{ color: isDone ? 'white' : node.color }} />
                                            ) : isDone ? (
                                                <Icon className="w-4 h-4 text-white" />
                                            ) : (
                                                <Circle className="w-4 h-4 text-slate-200" />
                                            )}
                                        </div>
                                    </foreignObject>

                                    {/* Label */}
                                    <foreignObject x={-75} y={32} width={150} height={40}>
                                        <div className={cn(
                                            "text-center text-[10px] font-bold uppercase tracking-tight transition-colors duration-300",
                                            isActive || isDone ? "text-slate-700 dark:text-slate-200" : "text-slate-300"
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
                    <div className="mt-2 text-center">
                        <p className="text-xs text-slate-500 animate-pulse font-mono">
                            {currentStepMessage}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
