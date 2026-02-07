import React, { useState } from 'react';
import { PromptDefinition } from '@/lib/prompts/registry';

interface PromptForkDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentPromptId: string;
    currentPromptVersion: string;
    defaultValue: string;
    onSaveFork: (newContent: string) => Promise<void>;
}

export function PromptForkDialog({
    isOpen,
    onClose,
    currentPromptId,
    currentPromptVersion,
    defaultValue,
    onSaveFork
}: PromptForkDialogProps) {
    const [forkContent, setForkContent] = useState(defaultValue);
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSaveFork(forkContent);
            onClose();
        } catch (error) {
            console.error("Failed to save fork:", error);
            // TODO: Add toast error
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 rounded-t-lg">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                            <span className="text-amber-400">⚡</span>
                            Fork Prompt: {currentPromptId}
                        </h2>
                        <p className="text-xs text-slate-400">
                            Create a personalized branch from version <span className="font-mono text-slate-300">{currentPromptVersion}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-hidden p-6 gap-6 flex flex-col">
                    <div className="bg-amber-900/20 border-l-4 border-amber-600 p-4 text-sm text-amber-200">
                        <strong>Existential Notice:</strong> You are about to negate the given configuration of this system.
                        By forking this prompt, you assume authorship and responsibility for the resulting analysis.
                    </div>

                    <div className="flex-1 flex flex-col gap-2 min-h-0">
                        <label className="text-sm font-medium text-slate-300">Prompt Definition</label>
                        <textarea
                            value={forkContent}
                            onChange={(e) => setForkContent(e.target.value)}
                            className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-md p-4 text-sm font-mono text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none leading-relaxed"
                            spellCheck={false}
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-slate-700 bg-slate-800/50 rounded-b-lg flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-md shadow-lg shadow-amber-900/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Forging...' : 'Save as Personal Override'}
                    </button>
                </div>
            </div>
        </div>
    );
}
