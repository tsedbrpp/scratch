import React from 'react';
import { HelpTooltip } from "@/components/help/HelpTooltip";
import { getGlossaryDefinition } from "@/lib/glossary-definitions";
import { HelpCircle } from "lucide-react";

export function DimensionCard({ title, icon, content, color, glossaryTerm, videoUrl }: { title: string, icon: React.ReactNode, content: string, color: string, glossaryTerm?: string, videoUrl?: string }) {
    return (
        <div className={`group p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-${color}-200 transition-all duration-200`}>
            <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-md bg-${color}-50 group-hover:bg-${color}-100 transition-colors`}>
                    {icon}
                </div>
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide">{title}</h5>
                {glossaryTerm && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <HelpTooltip
                            title={title}
                            description={getGlossaryDefinition(glossaryTerm)}
                            glossaryTerm={glossaryTerm}
                            videoUrl={videoUrl}
                            showIcon={false}
                        >
                            <HelpCircle className="h-3 w-3 text-slate-400 hover:text-slate-600 cursor-help" />
                        </HelpTooltip>
                    </div>
                )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors">
                {content}
            </p>
        </div>
    );
}
