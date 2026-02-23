import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckSquare, Square, Search, ExternalLink } from 'lucide-react';

interface MissingSignalsPanelProps {
    signals?: { id: string; label: string }[];
    onSearchRequest?: (term: string) => void;
}

export function MissingSignalsPanel({ signals, onSearchRequest }: MissingSignalsPanelProps) {
    if (!signals || signals.length === 0) return null;

    return (
        <Card className="shadow-sm border-amber-100 bg-amber-50">
            <CardHeader className="pb-3 border-b border-amber-100">
                <CardTitle className="text-sm font-semibold text-amber-900">What&apos;s missing (in this cited section)</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <ul className="space-y-3">
                    {signals.map(signal => (
                        <li key={signal.id} className="flex items-start gap-2">
                            <Square className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <span className="text-sm text-slate-700 block leading-tight">{signal.label}</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Not found in cited section</span>
                                    {onSearchRequest && (
                                        <button
                                            onClick={() => onSearchRequest(signal.label)}
                                            className="text-[10px] flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                                        >
                                            <Search className="h-3 w-3" />
                                            Search Doc
                                        </button>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
