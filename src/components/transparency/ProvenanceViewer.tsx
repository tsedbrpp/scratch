"use client";

import { ProvenanceChain } from "@/types/provenance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Copy, FileText, Sparkles, Code, CheckCircle } from "lucide-react";
import { useState } from "react";

interface ProvenanceViewerProps {
    provenance?: ProvenanceChain;
}

/**
 * Visual flowchart showing the complete reasoning chain from source to insight
 * Each step is expandable to show full details including raw JSON
 */
export function ProvenanceViewer({ provenance }: ProvenanceViewerProps) {
    const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

    if (!provenance) {
        return (
            <div className="text-sm text-slate-400 italic">
                Provenance chain not available for this analysis
            </div>
        );
    }

    const toggleStep = (index: number) => {
        const newExpanded = new Set(expandedSteps);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedSteps(newExpanded);
    };

    const getStepIcon = (type?: string) => {
        if (!type) return <Sparkles className="h-4 w-4" />;
        switch (type) {
            case 'source_extraction': return <FileText className="h-4 w-4" />;
            case 'prompt_generation': return <Code className="h-4 w-4" />;
            case 'ai_response': return <Sparkles className="h-4 w-4" />;
            case 'formatting': return <CheckCircle className="h-4 w-4" />;
            default: return <Sparkles className="h-4 w-4" />;
        }
    };

    const getStepLabel = (type: string) => {
        switch (type) {
            case 'source_extraction': return 'Source Text Extraction';
            case 'prompt_generation': return 'Prompt Generation';
            case 'ai_response': return 'AI Response';
            case 'formatting': return 'Formatting & Structuring';
            default: return type;
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader>
                <CardTitle className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Provenance Chain
                </CardTitle>
                <p className="text-xs text-slate-600">
                    Created: {new Date(provenance.created_at).toLocaleString()}
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {provenance.steps.map((step, index) => {
                        const isExpanded = expandedSteps.has(index);
                        const isLast = index === provenance.steps.length - 1;

                        return (
                            <div key={index} className="relative">
                                {/* Step Card */}
                                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                    {/* Step Header */}
                                    <button
                                        onClick={() => toggleStep(index)}
                                        className="w-full p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                Step {index + 1}
                                            </Badge>
                                            {getStepIcon(step.type)}
                                            <span className="text-sm font-medium text-slate-700">
                                                {step.description}
                                            </span>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-slate-400" />
                                        )}
                                    </button>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div className="p-3 pt-0 space-y-3 border-t border-slate-100">
                                            {/* Agent and Info */}
                                            <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-wider">
                                                <span>Agent: {step.agent}</span>
                                                <span>ID: {step.step_id}</span>
                                            </div>

                                            {/* Inputs */}
                                            {Object.keys(step.inputs).length > 0 && (
                                                <div>
                                                    <p className="text-xs font-medium text-slate-600 mb-1">Inputs:</p>
                                                    <div className="space-y-2">
                                                        {Object.entries(step.inputs).map(([key, val]) => (
                                                            <div key={key}>
                                                                <div className="flex items-center justify-between mb-0.5">
                                                                    <span className="text-[10px] text-slate-400">{key}:</span>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => copyToClipboard(typeof val === 'string' ? val : JSON.stringify(val, null, 2))}
                                                                        className="h-5 text-[10px]"
                                                                    >
                                                                        Copy
                                                                    </Button>
                                                                </div>
                                                                <pre className="text-[10px] bg-slate-50 p-2 rounded border border-slate-200 overflow-x-auto max-h-32">
                                                                    <code>{typeof val === 'string' ? val : JSON.stringify(val, null, 2)}</code>
                                                                </pre>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Outputs */}
                                            {Object.keys(step.outputs).length > 0 && (
                                                <div>
                                                    <p className="text-xs font-medium text-slate-600 mb-1">Outputs:</p>
                                                    <div className="space-y-2">
                                                        {Object.entries(step.outputs).map(([key, val]) => (
                                                            <div key={key}>
                                                                <div className="flex items-center justify-between mb-0.5">
                                                                    <span className="text-[10px] text-slate-400">{key}:</span>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => copyToClipboard(typeof val === 'string' ? val : JSON.stringify(val, null, 2))}
                                                                        className="h-5 text-[10px]"
                                                                    >
                                                                        Copy
                                                                    </Button>
                                                                </div>
                                                                <pre className="text-[10px] bg-green-50/50 p-2 rounded border border-green-100 overflow-x-auto max-h-32">
                                                                    <code>{typeof val === 'string' ? val : JSON.stringify(val, null, 2)}</code>
                                                                </pre>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Timestamp */}
                                            <p className="text-[10px] text-slate-400 text-right">
                                                Executed: {new Date(step.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Arrow to next step */}
                                {!isLast && (
                                    <div className="flex justify-center my-2">
                                        <div className="w-0.5 h-4 bg-slate-300"></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
