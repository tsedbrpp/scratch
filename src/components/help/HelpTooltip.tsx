"use client";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import Link from "next/link";

interface HelpTooltipProps {
    title?: string;
    description?: string;
    videoUrl?: string;
    glossaryTerm?: string;
    learnMoreUrl?: string;
    children?: React.ReactNode;
    showIcon?: boolean;
}

/**
 * Enhanced tooltip component for contextual help
 * Supports text explanations, video embeds, and glossary links
 */
export function HelpTooltip({
    title,
    description,
    videoUrl,
    glossaryTerm,
    learnMoreUrl,
    children,
    showIcon = true
}: HelpTooltipProps) {
    const trigger = children || (
        <button className="inline-flex items-center text-slate-400 hover:text-slate-600 transition-colors">
            <HelpCircle className="h-4 w-4" />
        </button>
    );

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    {trigger}
                </TooltipTrigger>
                <TooltipContent
                    className="max-w-sm p-4 bg-white border-slate-200 shadow-lg"
                    side="top"
                    sideOffset={5}
                >
                    <div className="space-y-3">
                        {/* Title */}
                        <h4 className="font-semibold text-sm text-slate-900">
                            {title}
                        </h4>

                        {/* Description */}
                        <p className="text-xs text-slate-600 leading-relaxed">
                            {description}
                        </p>

                        {/* Video Embed */}
                        {videoUrl && (
                            <div className="rounded overflow-hidden border border-slate-200">
                                <video
                                    src={videoUrl}
                                    controls
                                    className="w-full"
                                    style={{ maxHeight: '200px' }}
                                >
                                    Your browser does not support video playback.
                                </video>
                            </div>
                        )}

                        {/* Links */}
                        {(glossaryTerm || learnMoreUrl) && (
                            <div className="flex gap-3 pt-2 border-t border-slate-100">
                                {glossaryTerm && (
                                    <Link
                                        href={`/glossary#${glossaryTerm}`}
                                        className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                                    >
                                        View in Glossary →
                                    </Link>
                                )}
                                {learnMoreUrl && (
                                    <Link
                                        href={learnMoreUrl}
                                        className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                                    >
                                        Learn More →
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
