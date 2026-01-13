"use client";

import { useState, useEffect } from "react";
import { useServerStorage } from "@/hooks/useServerStorage";
import { useSources } from "@/hooks/useSources"; // Added hook
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Save, UserCircle, History, FileText, Loader2 } from "lucide-react"; // Added icons
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select

import { LogEntry } from "@/components/reflexivity/LogEntry";
import { MethodLog } from "@/types/logs";

const GUIDING_QUESTIONS = [
    "How does my location in the Global North/South affect my reading of these texts?",
    "What assumptions am I making about 'universal' AI ethics?",
    "Whose voices are missing from the documents I am analyzing?",
    "How does my own disciplinary background shape my interpretation of 'risk' and 'harm'?",
];


export default function ReflexivityPage() {
    const { sources, isLoading } = useSources();
    const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

    // Identify Policy Documents
    const policyDocuments = sources.filter(s => s.type !== "Trace");

    // Dynamic Journal Entry Key based on Policy ID
    const journalKey = selectedPolicyId ? `research-journal-${selectedPolicyId}` : "research-journal-global";
    const [journalEntry, setJournalEntry] = useServerStorage(journalKey, "");

    // Reset journal entry when key changes (useServerStorage handles persistence, but we need to ensure UI updates)
    // Note: useServerStorage automatic syncing handles this, but explicit reset might be needed if switching fast.
    // Actually, useServerStorage hook usually handles the key change re-fetch internally.

    const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | null>(null);
    const [logs, setLogs] = useState<MethodLog[]>([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const headers: HeadersInit = { 'Content-Type': 'application/json' };
                if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                    headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
                }

                const res = await fetch('/api/logs', { headers });
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data);
                }
            } catch (error) {
                console.error("Failed to fetch logs", error);
            }
        };

        fetchLogs();
    }, []);

    // Filter Logs by Selected Policy
    // We assume logs might have `details.policyId` or `details.sourceId`
    // If a log has NO policyId, we might hide it or show it in a "Global" view.
    // For this strict view, we show only matching logs.
    const filteredLogs = logs.filter(log => {
        if (!selectedPolicyId) return false;
        // Check various possible locations for the ID in the messy log structure
        const pId = log.details?.policyId || log.details?.sourceId || (log.details as any)?.documentId;
        return pId === selectedPolicyId;
    });

    const handleSave = () => {
        setSaveStatus("saving");
        // The data is already saved via useLocalStorage (useServerStorage), just show feedback
        setTimeout(() => {
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus(null), 2000);
        }, 300);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Critical Reflection</h2>
                <p className="text-slate-500">Documenting epistemic location and engaging with positionality.</p>
            </div>

            {/* Policy Selector Section */}
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Active Policy Document</h3>
                            <p className="text-sm text-slate-500">Select a document to view its specific reflexive journal and logs</p>
                        </div>
                    </div>
                    <div className="w-full md:w-[300px]">
                        <Select
                            value={selectedPolicyId || ""}
                            onValueChange={(val) => setSelectedPolicyId(val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a policy document..." />
                            </SelectTrigger>
                            <SelectContent>
                                {policyDocuments.length === 0 ? (
                                    <div className="p-2 text-sm text-slate-500 text-center">No documents found</div>
                                ) : (
                                    policyDocuments.map(doc => (
                                        <SelectItem key={doc.id} value={doc.id}>
                                            {doc.title}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {selectedPolicyId ? (
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <UserCircle className="h-5 w-5 text-slate-600" />
                                    <CardTitle className="text-lg">Guiding Questions</CardTitle>
                                </div>
                                <CardDescription>
                                    Prompts to consider during your analysis of {sources.find(s => s.id === selectedPolicyId)?.title}.
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
                                    Automated log of actions performed on this policy.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                    {filteredLogs.length === 0 ? (
                                        <p className="text-sm text-slate-500 italic">No specific actions logged for this policy yet.</p>
                                    ) : (
                                        filteredLogs.map((log) => (
                                            <LogEntry key={log.id} log={log} />
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-600 italic">
                            &quot;To think from the border is to think from the exteriority of modernity... it is a way of thinking that is not just &apos;critical&apos; but &apos;decolonial&apos;.&quot; — Walter Mignolo
                        </div>
                    </div>

                    <Card className="flex flex-col h-full">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <BookOpen className="h-5 w-5 text-slate-600" />
                                <CardTitle className="text-lg">Research Journal</CardTitle>
                            </div>
                            <CardDescription>
                                Record your thoughts, biases, and shifts in perspective for this specific document.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col space-y-4">
                            <Textarea
                                placeholder="Start writing your specific reflections for this policy here..."
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
            ) : (
                <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 p-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <BookOpen className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">No Policy Selected</h3>
                    <p className="text-slate-500 mt-2">Please select a policy document above to access its Reflexive Journal and Logs.</p>
                </div>
            )}
        </div>
    );
}
