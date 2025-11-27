"use client";

import { useState, useEffect } from "react";
import { useServerStorage } from "@/hooks/useServerStorage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Save, UserCircle, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const GUIDING_QUESTIONS = [
    "How does my location in the Global North/South affect my reading of these texts?",
    "What assumptions am I making about 'universal' AI ethics?",
    "Whose voices are missing from the documents I am analyzing?",
    "How does my own disciplinary background shape my interpretation of 'risk' and 'harm'?",
];

interface MethodLog {
    id: string;
    action: string;
    details: any;
    timestamp: string;
}

export default function ReflexivityPage() {
    const [journalEntry, setJournalEntry] = useServerStorage("research-journal", "");
    const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | null>(null);
    const [logs, setLogs] = useState<MethodLog[]>([]);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/logs');
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
        }
    };

    const handleSave = () => {
        setSaveStatus("saving");
        // The data is already saved via useLocalStorage, just show feedback
        setTimeout(() => {
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus(null), 2000);
        }, 300);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Critical Reflection</h2>
                <p className="text-slate-500">Documenting epistemic location and engaging with positionality.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <UserCircle className="h-5 w-5 text-slate-600" />
                                <CardTitle className="text-lg">Guiding Questions</CardTitle>
                            </div>
                            <CardDescription>
                                Prompts to consider during your analysis.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                {GUIDING_QUESTIONS.map((question, index) => (
                                    <li key={index} className="flex items-start space-x-3 text-sm text-slate-700">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                                            {index + 1}
                                        </span>
                                        <span className="pt-0.5">{question}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <History className="h-5 w-5 text-slate-600" />
                                <CardTitle className="text-lg">Methodological Log</CardTitle>
                            </div>
                            <CardDescription>
                                Automated log of analysis actions and lenses applied.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {logs.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic">No actions logged yet.</p>
                                ) : (
                                    logs.map((log) => (
                                        <div key={log.id} className="border-l-2 border-slate-200 pl-4 py-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-semibold text-slate-500">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </span>
                                                <Badge variant="outline" className="text-xs">
                                                    {log.action}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-800 font-medium">
                                                {log.details.lens ? `Lens: ${log.details.lens}` : ''}
                                            </p>
                                            {log.details.sourceCount && (
                                                <p className="text-xs text-slate-600">
                                                    Analyzed {log.details.sourceCount} sources
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-600 italic">
                        "To think from the border is to think from the exteriority of modernity... it is a way of thinking that is not just 'critical' but 'decolonial'." — Walter Mignolo
                    </div>
                </div>

                <Card className="flex flex-col h-full">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <BookOpen className="h-5 w-5 text-slate-600" />
                            <CardTitle className="text-lg">Research Journal</CardTitle>
                        </div>
                        <CardDescription>
                            Record your thoughts, biases, and shifts in perspective.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col space-y-4">
                        <Textarea
                            placeholder="Start writing your reflections here..."
                            className="flex-1 min-h-[300px] resize-none p-4 leading-relaxed text-slate-900"
                            value={journalEntry}
                            onChange={(e) => setJournalEntry(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <Button
                                onClick={handleSave}
                                className="bg-slate-900 text-white hover:bg-slate-800"
                                disabled={saveStatus === "saving"}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save Entry"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
