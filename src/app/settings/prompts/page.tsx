"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, RotateCcw, Save, AlertCircle, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { PromptDefinition } from "@/lib/prompts/registry";

interface PromptWithState extends PromptDefinition {
    currentValue: string;
    isModified: boolean;
    testInput: string;
    testOutput: string;
    isTesting: boolean;
}

const PromptEditor = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const backdropRef = React.useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (backdropRef.current && textareaRef.current) {
            backdropRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    // Simple parser to highlight "Output Format" section
    const renderHighlights = () => {
        // Regex to match "Output Format" section with various header styles (##, ###, ===, or just text)
        // Captures until next section (##, ===, ---) or end of string
        const regex = /((?:^|\n)(?:##+|={3,})?\s*Output\s*Format[\s\S]*?)(?=$|\n(?:##+|={3,}|---))/i;
        const match = value.match(regex);

        if (!match || match.index === undefined) {
            return <span>{value}</span>;
        }

        const start = match.index;
        const end = start + match[0].length;
        const before = value.substring(0, start);
        const danger = value.substring(start, end);
        const after = value.substring(end);

        return (
            <>
                <span>{before}</span>
                <span className="bg-red-50 text-red-600 font-bold decoration-red-200">{danger}</span>
                <span>{after}</span>
            </>
        );
    };

    return (
        <div className="relative text-sm font-mono leading-relaxed h-[400px] border rounded-md border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            {/* Backdrop Layer */}
            <div
                ref={backdropRef}
                className="absolute inset-0 p-3 whitespace-pre-wrap break-words overflow-hidden pointer-events-none bg-white text-slate-900"
                aria-hidden="true"
            >
                {renderHighlights()}
                {/* Extra character to prevent jumpiness on trailing newlines */}
                {value.endsWith('\n') && <br />}
            </div>

            {/* Editable Layer */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onScroll={handleScroll}
                className="relative z-10 w-full h-full p-3 bg-transparent text-transparent caret-zinc-950 resize-none focus:outline-none rounded-md overflow-y-auto selection:bg-indigo-100 selection:text-transparent"
                spellCheck={false}
            />
        </div>
    )
};

export default function PromptSettingsPage() {
    const [prompts, setPrompts] = useState<PromptWithState[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchPrompts();
    }, []);

    const fetchPrompts = async () => {
        setIsLoading(true);
        try {
            const headers: HeadersInit = {};
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const res = await fetch('/api/prompts', { headers });
            const data = await res.json();
            if (data.prompts) {
                setPrompts(data.prompts.map((p: any) => ({
                    ...p,
                    testInput: "",
                    testOutput: "",
                    isTesting: false
                })));
            }
        } catch (error) {
            console.error("Failed to load prompts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (prompt: PromptWithState) => {
        setEditingId(prompt.id);
        setEditValue(prompt.currentValue);
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValue("");
    };

    const handleSave = async (id: string) => {
        setIsSaving(true);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            await fetch('/api/prompts', {
                method: 'POST',
                headers,
                body: JSON.stringify({ id, value: editValue })
            });
            await fetchPrompts();
            setEditingId(null);
        } catch (error) {
            console.error("Failed to save prompt:", error);
            alert("Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = async (id: string) => {
        if (!confirm("Reset this prompt to its system default?")) return;

        setIsSaving(true);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            await fetch('/api/prompts', {
                method: 'POST',
                headers,
                body: JSON.stringify({ id, action: 'reset' })
            });
            await fetchPrompts();
            if (editingId === id) {
                setEditingId(null);
            }
        } catch (error) {
            console.error("Failed to reset prompt:", error);
            alert("Failed to reset prompt.");
        } finally {
            setIsSaving(false);
        }
    };

    const updatePromptState = (id: string, updates: Partial<PromptWithState>) => {
        setPrompts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const handleTest = async (prompt: PromptWithState) => {
        updatePromptState(prompt.id, { isTesting: true, testOutput: "" });

        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            // use editValue if we are currently editing this specific prompt, otherwise use the stored value
            const systemPromptToTest = (editingId === prompt.id) ? editValue : prompt.currentValue;

            const res = await fetch('/api/prompts/test', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    systemPrompt: systemPromptToTest,
                    userContent: prompt.testInput
                })
            });
            const data = await res.json();

            if (data.success) {
                let finalOutput = data.result;

                // VALIDATION LOGIC
                if (prompt.outputSchema?.format === 'json') {
                    try {
                        // 1. Check for valid JSON
                        // Sometimes models wrap JSON in markdown code blocks, strip them if present
                        const cleanJson = finalOutput.replace(/```json\n?|```/g, '').trim();
                        const parsed = JSON.parse(cleanJson);

                        // 2. Check for required keys
                        if (prompt.outputSchema.requiredKeys) {
                            const missingKeys = prompt.outputSchema.requiredKeys.filter(k => !(k in parsed));
                            if (missingKeys.length > 0) {
                                finalOutput = `⚠️ VALIDATION ERROR: Missing required JSON keys: ${missingKeys.join(', ')}\n\n` + finalOutput;
                            } else {
                                // Formatting for prettier display if valid
                                finalOutput = JSON.stringify(parsed, null, 2);
                            }
                        } else {
                            finalOutput = JSON.stringify(parsed, null, 2);
                        }
                    } catch (e) {
                        finalOutput = `❌ CRITICAL ERROR: Output is NOT valid JSON.\n\n${finalOutput}`;
                    }
                }

                updatePromptState(prompt.id, { testOutput: finalOutput });
            } else {
                updatePromptState(prompt.id, { testOutput: `Error: ${data.error}` });
            }
        } catch (error: any) {
            updatePromptState(prompt.id, { testOutput: `Error: ${error.message}` });
        } finally {
            updatePromptState(prompt.id, { isTesting: false });
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Prompt Customization</h1>
                    <p className="text-slate-500">Fine-tune the AI's instructions to better fit your research context.</p>
                </div>

            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
            ) : (
                <div className="grid gap-6">
                    {prompts.map(prompt => (
                        <Card key={prompt.id} className={`transition-all ${editingId === prompt.id ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-md' : ''}`}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-lg font-semibold">{prompt.name}</CardTitle>
                                        {prompt.isModified && (
                                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                                                Customized
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {editingId === prompt.id ? (
                                            <>
                                                <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isSaving}>Cancel</Button>
                                                <Button size="sm" onClick={() => handleSave(prompt.id)} disabled={isSaving}>
                                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                                    Save Changes
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                {prompt.isModified && (
                                                    <Button variant="outline" size="sm" onClick={() => handleReset(prompt.id)} title="Restore Default">
                                                        <RotateCcw className="h-4 w-4 mr-2" />
                                                        Reset
                                                    </Button>
                                                )}
                                                <Button variant="outline" size="sm" onClick={() => handleEdit(prompt)}>
                                                    Edit Prompt
                                                </Button>
                                            </>
                                        )}
                                    </div>

                                    {/* Test Playground */}
                                    <div className="mt-6 pt-6 border-t border-slate-200">
                                        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-indigo-500" />
                                            Test Playground
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-medium text-slate-500 mb-1 block">Sample Input</label>
                                                <Textarea
                                                    placeholder="Paste a snippet of text to test..."
                                                    value={prompt.testInput}
                                                    onChange={(e) => updatePromptState(prompt.id, { testInput: e.target.value })}
                                                    className="h-40 font-mono text-xs"
                                                />
                                                <Button
                                                    onClick={() => handleTest(prompt)}
                                                    disabled={prompt.isTesting || !prompt.testInput?.trim()}
                                                    className="mt-2 w-full"
                                                    size="sm"
                                                    variant="secondary"
                                                >
                                                    {prompt.isTesting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Play className="h-3 w-3 mr-2" />}
                                                    Run Test
                                                </Button>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-slate-500 mb-1 block">AI Output</label>
                                                <div className="h-40 bg-slate-50 rounded-md border p-3 overflow-y-auto text-xs font-mono whitespace-pre-wrap">
                                                    {prompt.testOutput || <span className="text-slate-400 italic">Output will appear here...</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <CardDescription>{prompt.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {editingId === prompt.id ? (
                                    <div>
                                        <PromptEditor
                                            value={editValue}
                                            onChange={(val) => setEditValue(val)}
                                        />
                                        <div className="mt-2 text-xs text-slate-500 flex flex-col gap-1">
                                            <div className="flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Variables like <code>`{"${text}"}`</code> or <code>`{"${actors}"}`</code> must be preserved for the prompt to work.
                                            </div>
                                            {prompt.outputSchema && (
                                                <div className="flex items-center gap-1 text-amber-600 font-medium">
                                                    <AlertCircle className="h-3 w-3" />
                                                    Warning: Do NOT change the JSON output keys or structure, or the visualization will break.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 p-4 rounded-md border text-sm font-mono text-slate-600 whitespace-pre-wrap max-h-[200px] overflow-y-auto hover:max-h-[500px] transition-all duration-300">
                                        {prompt.currentValue}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
