import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// Simple valid codes check (can be expanded/hashed on client)
const VALID_CODES = ['test-evaluator', 'pilot-01', 'pilot-02', 'g-node-expert'];

import { StudyCase } from '@/lib/study-config';
import { validateEvaluatorCode } from '@/lib/validation';

interface EvaluatorLoginDialogProps {
    isOpen: boolean;
    onLogin: (code: string, customCases?: StudyCase[]) => void;
    generatedCases?: StudyCase[];
    onResume?: (file: File) => void;
    isLoading?: boolean;
    onClose?: () => void;
}

export function EvaluatorLoginDialog({ isOpen, onLogin, generatedCases, onResume, isLoading, onClose }: EvaluatorLoginDialogProps) {
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Dev/Demo Helper: Log a valid code for testing
    React.useEffect(() => {
        if (isOpen) {
            // Dev helper removed for prod
        }
    }, [isOpen]);

    const handleLogin = () => {
        if (!code.trim()) {
            setError('Please enter an Evaluator Code.');
            return;
        }

        const trimmedCode = code.trim();

        // 1. Allow legacy/dev codes
        const isLegacyCode = VALID_CODES.includes(trimmedCode) || (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE && trimmedCode.startsWith('test'));

        // 2. Validate using Luhn Mod 36 (Credit-card style check)
        const isValidFormat = validateEvaluatorCode(trimmedCode);

        if (!isLegacyCode && !isValidFormat) {
            setError('Invalid Evaluator Code. Please check for typos.');
            return;
        }

        onLogin(trimmedCode, generatedCases);
    };



    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open && onClose) onClose(); }}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Research Evaluator Access</DialogTitle>
                    <DialogDescription>
                        Enter your assigned Evaluator Code to begin the validation study.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="evaluator-code">Evaluator Code</Label>
                        <Input
                            id="evaluator-code"
                            placeholder="e.g., G-NODE-01"
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value);
                                setError(null);
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        />
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                            Enter your code to start a new session or <strong>resume a previous one automatically</strong>.
                        </p>
                    </div>
                </div>

                <DialogFooter className="sm:justify-between">
                    <div className="text-xs text-muted-foreground self-center">
                        Study ID: v5.0-Hybrid
                    </div>
                    <div className="flex gap-2">
                        {/* Hidden input for legacy obscure cases if needed, but removing main button */}
                        <Button onClick={handleLogin} disabled={isLoading || !code.trim()}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Accessing...
                                </>
                            ) : (
                                'Enter Study'
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
