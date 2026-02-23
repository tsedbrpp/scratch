import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GhostNodeClaim } from '@/lib/study-config';
import { FileText, ChevronDown, ChevronUp, AlertCircle, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ClaimCardProps {
    claim?: GhostNodeClaim;
}

export function ClaimCard({ claim }: ClaimCardProps) {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        reasoning: false
    });

    if (!claim) return null;

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    return (
        <Card className="border-l-4 border-l-purple-500 shadow-sm mt-6 w-full">
            <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <h4 className="text-sm font-bold text-slate-900">
                        {claim.summaryBullets.length > 0 ? "Analytical Impact & Challenges" : "InstantTea Claim"}
                    </h4>
                </div>

                <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm leading-relaxed mb-6">
                    {claim.summaryBullets.map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                    ))}
                </ul>

                <div className="space-y-4 border-t border-slate-100 pt-4">
                    {/* Why Absent Reasoning */}
                    {claim.fullReasoning && (
                        <div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSection('reasoning')}
                                className="text-slate-600 hover:text-slate-900 p-0 h-auto font-semibold text-xs flex items-center gap-2"
                            >
                                {expandedSections['reasoning'] ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                Why absent?
                            </Button>

                            {expandedSections['reasoning'] && (
                                <div className="mt-2 p-4 bg-slate-50 rounded-md text-sm text-slate-600 border border-slate-200">
                                    <p className="italic leading-relaxed">
                                        {claim.fullReasoning}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Discourse Threats / Challenges */}
                    {claim.discourseThreats?.map((threat, index) => {
                        const sectionId = `threat-${index}`;
                        const isExpanded = expandedSections[sectionId];

                        // Icon selection based on discourse
                        let Icon = AlertCircle;
                        let iconColor = "text-slate-500";

                        if (threat.dominantDiscourse.toLowerCase().includes('market')) {
                            Icon = TrendingUp;
                            iconColor = "text-green-600";
                        } else if (threat.dominantDiscourse.toLowerCase().includes('social') || threat.dominantDiscourse.toLowerCase().includes('equity')) {
                            Icon = Users;
                            iconColor = "text-blue-600";
                        }

                        return (
                            <div key={index} className="border-t border-slate-50 pt-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleSection(sectionId)}
                                    className="text-slate-600 hover:text-slate-900 p-0 h-auto font-semibold text-xs flex items-center gap-2"
                                >
                                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                    <Icon className={cn("h-3.5 w-3.5", iconColor)} />
                                    Challenges: {threat.dominantDiscourse}
                                </Button>

                                {isExpanded && (
                                    <div className="mt-2 p-4 bg-slate-50 rounded-md text-sm text-slate-600 border border-slate-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-white">
                                                {threat.conflictType}
                                            </Badge>
                                        </div>
                                        <p className="leading-relaxed">
                                            {threat.explanation}
                                        </p>
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
