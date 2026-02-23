import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Settings } from 'lucide-react';

interface RosterPanelProps {
    roster?: {
        actorsInSection: string[];
        mechanismsInSection: string[];
    };
}

export function RosterPanel({ roster }: RosterPanelProps) {
    if (!roster) return null;

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold text-slate-800">Named in this section</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div>
                    <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        <Users className="h-3.5 w-3.5" />
                        Actors
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {roster.actorsInSection.length > 0 ? roster.actorsInSection.map(actor => (
                            <Badge key={actor} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-normal">
                                {actor}
                            </Badge>
                        )) : <span className="text-sm text-slate-400">None detected</span>}
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        <Settings className="h-3.5 w-3.5" />
                        Governance Mechanisms
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {roster.mechanismsInSection.length > 0 ? roster.mechanismsInSection.map(mech => (
                            <Badge key={mech} variant="outline" className="border-slate-200 text-slate-600 font-normal">
                                {mech}
                            </Badge>
                        )) : <span className="text-sm text-slate-400">None detected</span>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
