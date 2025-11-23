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
                        <div className="text-2xl font-bold">High</div>
                        <p className="text-xs text-muted-foreground">Based on recent activity</p>
                    </CardContent>
                </Card>
            </div>

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
        </div>
    );
}
