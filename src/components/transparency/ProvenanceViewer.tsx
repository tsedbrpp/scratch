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

    const getStepIcon = (type: string) => {
        switch (type) {
            case 'source_extraction': return <FileText className="h-4 w-4" />;
            case 'prompt_generation': return <Code className="h-4 w-4" />;
            case 'ai_response': return <Sparkles className="h-4 w-4" />;
            case 'formatting': return <CheckCircle className="h-4 w-4" />;
            default: return null;
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
                                                {getStepLabel(step.type)}
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
                                            {/* Input */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-xs font-medium text-slate-600">Input:</p>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(step.data.input)}
                                                        className="h-6 text-xs"
                                                    >
                                                        <Copy className="h-3 w-3 mr-1" />
                                                        Copy
                                                    </Button>
                                                </div>
                                                <pre className="text-xs bg-slate-50 p-2 rounded border border-slate-200 overflow-x-auto max-h-40 overflow-y-auto">
                                                    <code>{step.data.input}</code>
                                                </pre>
                                            </div>

                                            {/* Raw JSON (if available) */}
                                            {step.data.raw_json && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="text-xs font-medium text-slate-600">Raw JSON Response:</p>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => copyToClipboard(JSON.stringify(step.data.raw_json, null, 2))}
                                                            className="h-6 text-xs"
                                                        >
                                                            <Copy className="h-3 w-3 mr-1" />
                                                            Copy
                                                        </Button>
                                                    </div>
                                                    <pre className="text-xs bg-amber-50 p-2 rounded border border-amber-200 overflow-x-auto max-h-40 overflow-y-auto">
                                                        <code>{JSON.stringify(step.data.raw_json, null, 2)}</code>
                                                    </pre>
                                                </div>
                                            )}

                                            {/* Output */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-xs font-medium text-slate-600">Output:</p>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(step.data.output)}
                                                        className="h-6 text-xs"
                                                    >
                                                        <Copy className="h-3 w-3 mr-1" />
                                                        Copy
                                                    </Button>
                                                </div>
                                                <pre className="text-xs bg-green-50 p-2 rounded border border-green-200 overflow-x-auto max-h-40 overflow-y-auto">
                                                    <code>{step.data.output}</code>
                                                </pre>
                                            </div>

                                            {/* Transformation Logic (if available) */}
                                            {step.data.transformation_logic && (
                                                <div>
                                                    <p className="text-xs font-medium text-slate-600 mb-1">Transformation Logic:</p>
                                                    <pre className="text-xs bg-blue-50 p-2 rounded border border-blue-200 overflow-x-auto">
                                                        <code>{step.data.transformation_logic}</code>
                                                    </pre>
                                                </div>
                                            )}

                                            {/* Timestamp */}
                                            <p className="text-xs text-slate-400">
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
