"use client";

import { useSources } from "@/hooks/useSources";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText, TrendingUp } from "lucide-react";
import { Source } from "@/types";

export default function TimelinePage() {
    const { sources, isLoading } = useSources();

    // Filter sources with dates and sort them
    const timelineEvents = sources
        .filter(s => s.publicationDate)
        .sort((a, b) => new Date(a.publicationDate!).getTime() - new Date(b.publicationDate!).getTime());

    // Analytics: Publications by year
    const publicationsByYear: Record<number, Source[]> = {};
    timelineEvents.forEach(source => {
        const year = new Date(source.publicationDate!).getFullYear();
        if (!publicationsByYear[year]) publicationsByYear[year] = [];
        publicationsByYear[year].push(source);
    });

    // Analytics: Publications by jurisdiction
    const publicationsByJurisdiction: Record<string, Source[]> = {};
    timelineEvents.forEach(source => {
        const jurisdiction = source.jurisdiction || 'Other';
        if (!publicationsByJurisdiction[jurisdiction]) publicationsByJurisdiction[jurisdiction] = [];
        publicationsByJurisdiction[jurisdiction].push(source);
    });

    // Analytics: Active Discourse Metric
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());

    const recentDocs = timelineEvents.filter(s => new Date(s.publicationDate!) >= oneYearAgo).length;
    const previousDocs = timelineEvents.filter(s => {
        const date = new Date(s.publicationDate!);
        return date >= twoYearsAgo && date < oneYearAgo;
    }).length;

    const activityTrend = previousDocs === 0 ? 'High' :
        recentDocs > previousDocs * 1.5 ? 'Growing' :
            recentDocs < previousDocs * 0.5 ? 'Declining' : 'Stable';

    // Analytics: Peak activity period
    const peakYear = Object.entries(publicationsByYear)
        .sort(([, a], [, b]) => b.length - a.length)[0];

    // Analytics: Jurisdiction leadership
    const jurisdictionLeader = Object.entries(publicationsByJurisdiction)
        .sort(([, a], [, b]) => b.length - a.length)[0];

    if (isLoading) {
        return <div className="p-8 text-center">Loading timeline...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Temporal Dynamics</h1>
                    <p className="text-muted-foreground mt-2">
                        Track the evolution of AI governance discourse and policy adoption over time.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Timeline Events</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{timelineEvents.length}</div>
                        <p className="text-xs text-muted-foreground">Documents with publication dates</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Date Range</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {timelineEvents.length > 0
                                ? `${new Date(timelineEvents[0].publicationDate!).getFullYear()} - ${new Date(timelineEvents[timelineEvents.length - 1].publicationDate!).getFullYear()}`
                                : "N/A"}
                        </div>
                        <p className="text-xs text-muted-foreground">Earliest to latest document</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Discourse</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activityTrend}</div>
                        <p className="text-xs text-muted-foreground">
                            {recentDocs} docs last year vs. {previousDocs} prior year
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* New Analytics Cards */}
            {timelineEvents.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Peak Activity Period</CardTitle>
                            <CardDescription>Year with most publications</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {peakYear && (
                                <div>
                                    <div className="text-3xl font-bold text-indigo-700 mb-2">{peakYear[0]}</div>
                                    <p className="text-sm text-slate-600">
                                        {peakYear[1].length} publication{peakYear[1].length !== 1 ? 's' : ''}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {Object.entries(
                                            peakYear[1].reduce((acc: Record<string, number>, s: Source) => {
                                                const j = s.jurisdiction || 'Other';
                                                acc[j] = (acc[j] || 0) + 1;
                                                return acc;
                                            }, {})
                                        ).map(([jurisdiction, count]) => (
                                            <Badge key={jurisdiction} variant="outline" className="text-xs">
                                                {jurisdiction}: {count}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Most Active Jurisdiction</CardTitle>
                            <CardDescription>Publication leadership</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {jurisdictionLeader && (
                                <div>
                                    <div className="text-3xl font-bold text-indigo-700 mb-2">{jurisdictionLeader[0]}</div>
                                    <p className="text-sm text-slate-600">
                                        {jurisdictionLeader[1].length} publication{jurisdictionLeader[1].length !== 1 ? 's' : ''} total
                                    </p>
                                    <div className="mt-3 space-y-1">
                                        {jurisdictionLeader[1][0] && (
                                            <p className="text-xs text-slate-500">
                                                First: {new Date(jurisdictionLeader[1][0].publicationDate!).getFullYear()}
                                            </p>
                                        )}
                                        {jurisdictionLeader[1][jurisdictionLeader[1].length - 1] && (
                                            <p className="text-xs text-slate-500">
                                                Latest: {new Date(jurisdictionLeader[1][jurisdictionLeader[1].length - 1].publicationDate!).getFullYear()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Publication Frequency Chart */}
            {timelineEvents.length > 0 && Object.keys(publicationsByYear).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Publication Frequency Over Time</CardTitle>
                        <CardDescription>Number of documents published each year</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(publicationsByYear)
                                .sort(([a], [b]) => Number(a) - Number(b))
                                .map(([year, docs]) => {
                                    const maxCount = Math.max(...Object.values(publicationsByYear).map(d => d.length));
                                    const percentage = (docs.length / maxCount) * 100;

                                    return (
                                        <div key={year}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium">{year}</span>
                                                <span className="text-sm text-slate-600">{docs.length} doc{docs.length !== 1 ? 's' : ''}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-6 relative overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-6 rounded-full flex items-center px-2 transition-all"
                                                    style={{ width: `${Math.max(percentage, 5)}%` }}
                                                >
                                                    <div className="flex gap-1">
                                                        {Object.entries(
                                                            docs.reduce((acc: Record<string, number>, s: Source) => {
                                                                const j = s.jurisdiction || 'Other';
                                                                acc[j] = (acc[j] || 0) + 1;
                                                                return acc;
                                                            }, {})
                                                        ).map(([jurisdiction]) => (
                                                            <div
                                                                key={jurisdiction}
                                                                className={`w-2 h-2 rounded-full ${jurisdiction === 'EU' ? 'bg-blue-300' :
                                                                    jurisdiction === 'Brazil' ? 'bg-green-300' :
                                                                        jurisdiction === 'US' ? 'bg-red-300' : 'bg-slate-300'
                                                                    }`}
                                                                title={jurisdiction}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle>Policy Timeline</CardTitle>
                    <CardDescription>Chronological evolution of AI governance documents</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative border-l-2 border-slate-200 ml-4 md:ml-8 space-y-12 py-4">
                        {timelineEvents.length === 0 ? (
                            <div className="pl-8 text-muted-foreground">
                                No documents with publication dates found. Edit your documents to add dates.
                            </div>
                        ) : (
                            timelineEvents.map((source, index) => (
                                <div key={source.id} className="relative pl-8 md:pl-12">
                                    {/* Timeline Dot */}
                                    <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white ${source.jurisdiction === 'EU' ? 'bg-blue-500' :
                                        source.jurisdiction === 'Brazil' ? 'bg-green-500' :
                                            source.jurisdiction === 'US' ? 'bg-red-500' : 'bg-slate-500'
                                        }`} />

                                    {/* Date Label */}
                                    <div className="mb-1 text-sm font-semibold text-slate-500">
                                        {new Date(source.publicationDate!).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>

                                    {/* Content Card */}
                                    <Card className="w-full max-w-3xl hover:shadow-md transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <CardTitle className="text-lg text-indigo-700">
                                                            {source.title}
                                                        </CardTitle>
                                                        {source.version && (
                                                            <Badge variant="outline">v{source.version}</Badge>
                                                        )}
                                                        {source.jurisdiction && (
                                                            <Badge className={
                                                                source.jurisdiction === 'EU' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                                                                    source.jurisdiction === 'Brazil' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                                                        'bg-red-100 text-red-800 hover:bg-red-100'
                                                            }>
                                                                {source.jurisdiction}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <CardDescription>{source.description}</CardDescription>
                                                </div>
                                                <div className="flex gap-2">
                                                    {/* Placeholder for future actions */}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {source.extractedText && (
                                                <p className="text-sm text-slate-600 line-clamp-3">
                                                    {source.extractedText.substring(0, 300)}...
                                                </p>
                                            )}
                                            {source.analysis && (
                                                <div className="mt-4 pt-4 border-t">
                                                    <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Key Insight</h4>
                                                    <p className="text-sm">{source.analysis.key_insight || "No insight available."}</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
