import React from 'react';
import { Badge } from '@/components/ui/badge';
import { StudyCase } from '@/lib/study-config';
import { AlertCircle } from 'lucide-react';

interface CaseSummaryBarProps {
    currentCase: StudyCase;
}

export function CaseSummaryBar({ currentCase }: CaseSummaryBarProps) {
    const { title, documentLabel, scope, disambiguationBanner } = currentCase;

    return (
        <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                    {documentLabel && <p className="text-slate-500 text-sm mt-1">Document: {documentLabel}</p>}
                </div>
                {scope && (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200" title={scope.scopeTooltip}>
                        {scope.evidenceScopeLabel}
                    </Badge>
                )}
            </div>

            {disambiguationBanner && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex gap-3 text-sm text-amber-900">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
                    <div>
                        <strong className="block mb-1 font-semibold">{disambiguationBanner.title}</strong>
                        <p className="leading-relaxed">{disambiguationBanner.text}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
