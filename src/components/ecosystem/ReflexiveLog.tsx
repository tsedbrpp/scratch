import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, BookOpen, Trash2 } from 'lucide-react';
import { ReflexiveLogEntry } from '@/types/ecosystem';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReflexiveLogProps {
    logs: ReflexiveLogEntry[];
    onAddLog: (log: ReflexiveLogEntry) => void;
    onDeleteLog?: (id: string) => void;
}

export function ReflexiveLog({ logs, onAddLog, onDeleteLog }: ReflexiveLogProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newRationale, setNewRationale] = useState("");
    const [actionType, setActionType] = useState<ReflexiveLogEntry['action_type']>("Other");

    const handleAdd = () => {
        if (!newRationale.trim()) return;

        const entry: ReflexiveLogEntry = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            action_type: actionType,
            rationale: newRationale,
        };

        onAddLog(entry);
        setNewRationale("");
        setIsAdding(false);
    };

    return (
        <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-slate-500" />
                            Methodological Journal
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Log interpretive moves and strategic subtractions.
                        </CardDescription>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => setIsAdding(!isAdding)}>
                        <Plus className="h-3 w-3" />
                        Log Move
                    </Button>
                </div>
            </CardHeader>

            {isAdding && (
                <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3 animation-in slide-in-from-top-2">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-500">Action Type</label>
                        <Select value={actionType} onValueChange={(v: any) => setActionType(v)}>
                            <SelectTrigger className="h-8 text-xs bg-white">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Trace_Rejection">Trace Rejection</SelectItem>
                                <SelectItem value="Actor_Merge">Actor Merge</SelectItem>
                                <SelectItem value="Strategic_Subtraction">Strategic Subtraction</SelectItem>
                                <SelectItem value="Manual_Inscription">Manual Inscription</SelectItem>
                                <SelectItem value="Other">Other Interpretation</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-500">Rationale</label>
                        <Textarea
                            value={newRationale}
                            onChange={(e) => setNewRationale(e.target.value)}
                            placeholder="Why did you make this decision? What theory guided it?"
                            className="text-xs min-h-[80px] bg-white"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="text-xs h-7 text-slate-500">Cancel</Button>
                        <Button size="sm" onClick={handleAdd} className="text-xs h-7 bg-indigo-600 hover:bg-indigo-700 text-white">Save Entry</Button>
                    </div>
                </div>
            )}

            <ScrollArea className="flex-1 -mx-2 px-2">
                <div className="space-y-3 pb-4">
                    {logs.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs italic">
                            No entries logged. Document your process to ensure rigor.
                        </div>
                    ) : (
                        logs.sort((a, b) => b.timestamp - a.timestamp).map((log) => (
                            <div key={log.id} className="group relative pl-3 border-l-2 border-slate-200 hover:border-indigo-300 transition-colors pb-1">
                                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-slate-200 border-2 border-white group-hover:bg-indigo-400 transition-colors" />

                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal bg-slate-50 text-slate-600 border-slate-200">
                                        {log.action_type.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-[10px] text-slate-400">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {onDeleteLog && (
                                        <button
                                            onClick={() => onDeleteLog(log.id)}
                                            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>

                                <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {log.rationale}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </Card>
    );
}
