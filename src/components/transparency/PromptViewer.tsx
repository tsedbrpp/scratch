"use client";

import { PromptMetadata } from "@/types/provenance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface PromptViewerProps {
    metadata?: PromptMetadata;
}

/**
 * Displays the prompt metadata used to generate an analysis
 * Shows the exact prompt, model version, and settings for full transparency
 */
export function PromptViewer({ metadata }: PromptViewerProps) {
    const [copied, setCopied] = useState(false);

    if (!metadata) {
        return (
            <div className="text-sm text-slate-400 italic">
                Prompt metadata not available for this analysis
            </div>
        );
    }

    const { prompt_used, model_version, temperature, max_tokens, timestamp } = metadata;

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt_used);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="border-indigo-200 bg-indigo-50/30">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-indigo-900">
                        Prompt Metadata
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="h-7 text-xs"
                    >
                        {copied ? (
                            <>
                                <Check className="h-3 w-3 mr-1" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="h-3 w-3 mr-1" />
                                Copy Prompt
                            </>
                        )}
                    </Button>
                </div>
                <CardDescription className="text-xs">
                    Generated on {new Date(timestamp).toLocaleString()}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Model Settings */}
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                        Model: {model_version}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                        Temperature: {temperature}
                    </Badge>
                    {max_tokens && (
                        <Badge variant="secondary" className="text-xs">
                            Max Tokens: {max_tokens}
                        </Badge>
                    )}
                </div>

                {/* Prompt Text */}
                <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-700">Prompt Used:</p>
                    <pre className="text-xs bg-white p-3 rounded border border-slate-200 overflow-x-auto max-h-96 overflow-y-auto">
                        <code className="text-slate-800">{prompt_used}</code>
                    </pre>
                </div>
            </CardContent>
        </Card>
    );
}
