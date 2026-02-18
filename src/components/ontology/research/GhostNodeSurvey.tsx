import React, { useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Info } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    GhostNodeSurveyResponse,
    StudyCaseConfig
} from '@/lib/study-config';

interface GhostNodeSurveyProps {
    config: StudyCaseConfig;
    initialData?: Partial<GhostNodeSurveyResponse>;
    onChange: (data: Partial<GhostNodeSurveyResponse>) => void;
}

const MISSING_ROLES = [
    { id: 'representation', label: 'Representation (Voice/Seat at table)' },
    { id: 'standard_setting', label: 'Standard Setting (Defining rules)' },
    { id: 'audit_participation', label: 'Audit Participation (Monitoring)' },
    { id: 'enforcement_trigger', label: 'Enforcement Trigger (Complaint mechanism)' },
    { id: 'remedy_access', label: 'Access to Remedy (Compensation/Redress)' },
];


export function GhostNodeSurvey({ config, initialData, onChange }: GhostNodeSurveyProps) {
    // State for form fields
    const [strength, setStrength] = useState<number | null>(initialData?.strength ?? null);
    const [confidence, setConfidence] = useState<GhostNodeSurveyResponse['confidence']>(initialData?.confidence ?? null);
    const [missingRoles, setMissingRoles] = useState<string[]>(initialData?.missingRoles ?? []);
    const [missingRolesOther, setMissingRolesOther] = useState<string>(initialData?.missingRolesOther ?? '');
    const [isUncertainRole, setIsUncertainRole] = useState<boolean>(initialData?.isUncertain ?? false);


    const [reflexivity, setReflexivity] = useState<string>(initialData?.reflexivity ?? '');

    // [Fix] Removed useEffect that caused infinite loop.
    // Instead, we bundle current state and call onChange explicitly when interactions happen.
    const notifyChange = useCallback((updates: Partial<GhostNodeSurveyResponse>) => {
        onChange({
            strength,
            confidence,
            missingRoles,
            missingRolesOther,
            isUncertain: isUncertainRole,
            reflexivity,
            ...updates
        });
    }, [strength, confidence, missingRoles, missingRolesOther, isUncertainRole, reflexivity, onChange]);

    const handleStrengthChange = (val: number) => {
        setStrength(val);
        notifyChange({ strength: val });
    };

    const handleConfidenceChange = (val: GhostNodeSurveyResponse['confidence']) => {
        setConfidence(val);
        notifyChange({ confidence: val });
    };

    const toggleRole = (roleId: string) => {
        const newRoles = missingRoles.includes(roleId)
            ? missingRoles.filter(r => r !== roleId)
            : [...missingRoles, roleId];
        setMissingRoles(newRoles);
        notifyChange({ missingRoles: newRoles });
    };

    const handleUncertainChange = (checked: boolean) => {
        setIsUncertainRole(checked);
        notifyChange({ isUncertain: checked });
    };

    const handleOtherRoleChange = (val: string) => {
        setMissingRolesOther(val);
        notifyChange({ missingRolesOther: val });
    };


    const handleReflexivityChange = (val: string) => {
        setReflexivity(val);
        notifyChange({ reflexivity: val });
    };

    return (
        <div className="space-y-8 py-2">

            {/* 1. Ghost Node Strength */}
            <div className={`space-y-4 p-4 rounded-xl transition-all ${strength === null ? 'bg-amber-50 border-2 border-amber-200' : 'bg-transparent'}`}>
                <div className="flex items-center gap-2">
                    <Label className="text-base font-semibold">1. Critical Absence Strength <span className="text-red-500">*</span></Label>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="p-1 hover:bg-slate-100 rounded-full transition-colors cursor-help">
                                    <Info className="h-4 w-4 text-purple-600" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[250px] p-3 bg-slate-900 text-white border-slate-800 shadow-xl z-50">
                                <p className="text-sm font-normal leading-relaxed">
                                    Rate how significant this actor&apos;s absence is. High values indicate a critical omission or &quot;ghosting&quot; from the policy.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <div className="flex-1" />
                    <span className={`text-2xl font-bold ${strength === null ? 'text-amber-600' : 'text-purple-600'}`}>
                        {strength === null ? "Required" : strength}
                    </span>
                </div>

                <div className="px-4 py-6 bg-slate-50 rounded-xl border border-slate-100 transition-all hover:bg-white hover:shadow-md group relative">
                    {strength === null && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-xl pointer-events-none">
                            <span className="text-sm font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full shadow-sm">
                                Please Adjust Slider
                            </span>
                        </div>
                    )}
                    <Slider
                        value={[strength ?? 50]} // Show 50 visual default if null
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(val) => handleStrengthChange(val[0])}
                        className={`py-4 ${strength === null ? 'opacity-50 grayscale' : 'opacity-100'}`}
                    />
                    <div className="flex justify-between items-start text-[10px] sm:text-xs font-semibold text-slate-500 mt-3 uppercase tracking-wider">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 cursor-help hover:text-purple-600 transition-colors group/label">
                                        <span className="w-20 sm:w-24 leading-tight border-b border-dotted border-slate-300">Legitimate Absence</span>
                                        <Info className="h-3 w-3 text-slate-400 group-hover/label:text-purple-500" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[250px] p-3 bg-slate-900 text-white border-slate-800 shadow-xl">
                                    <p className="text-sm font-normal normal-case leading-relaxed">
                                        <strong>Legitimate Absence:</strong> Actor is missing because they are outside the defined scope, jurisdiction, or theoretical focus of this specific policy document.
                                    </p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 justify-center cursor-help hover:text-purple-600 transition-colors group/label ml-4">
                                        <span className="w-20 sm:w-24 leading-tight text-center border-b border-dotted border-slate-300">Ambiguous</span>
                                        <Info className="h-3 w-3 text-slate-400 group-hover/label:text-purple-500" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[250px] p-3 bg-slate-900 text-white border-slate-800 shadow-xl">
                                    <p className="text-sm font-normal normal-case leading-relaxed">
                                        <strong>Ambiguous:</strong> It is unclear, contested, or contradictory whether the actor should be present; available evidence is mixed.
                                    </p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 justify-end cursor-help hover:text-purple-600 transition-colors group/label">
                                        <span className="w-20 sm:w-24 leading-tight text-right border-b border-dotted border-slate-300">Critical Absence</span>
                                        <Info className="h-3 w-3 text-slate-400 group-hover/label:text-purple-500" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[250px] p-3 bg-slate-900 text-white border-slate-800 shadow-xl">
                                    <p className="text-sm font-normal normal-case leading-relaxed">
                                        <strong>Critical Absence:</strong> The actor is missing from a position they fundamentally should occupy; represents a significant omission or erasure.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>

            {/* 2. Confidence */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Label className="text-base font-semibold">2. Confidence in Rating</Label>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="p-1 hover:bg-slate-100 rounded-full transition-colors cursor-help">
                                    <Info className="h-4 w-4 text-purple-600" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[250px] p-3 bg-slate-900 text-white border-slate-800 shadow-xl z-50">
                                <p className="text-sm font-normal leading-relaxed">
                                    How certain are you about the absence strength you assigned? Consider data quality and clarity of the policy text.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="flex gap-4">
                    {(['low', 'medium', 'high'] as const).map((lvl) => (
                        <div
                            key={lvl}
                            onClick={() => handleConfidenceChange(lvl)}
                            className={`
                        flex-1 p-3 border rounded-md text-center cursor-pointer capitalize transition-all
                        ${confidence === lvl ? 'bg-purple-100 border-purple-500 text-purple-900 font-medium ring-1 ring-purple-500' : 'hover:bg-slate-50'}
                    `}
                        >
                            {lvl}
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Missing Roles */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Label className="text-base font-semibold">3. Specifically Missing Roles</Label>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="p-1 hover:bg-slate-100 rounded-full transition-colors cursor-help">
                                    <Info className="h-4 w-4 text-purple-600" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[250px] p-3 bg-slate-900 text-white border-slate-800 shadow-xl z-50">
                                <p className="text-sm font-normal leading-relaxed">
                                    Select the specific governance functions this actor is excluded from performing in the current policy context.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <div className="grid gap-2">
                    {MISSING_ROLES.map(role => (
                        <div key={role.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={role.id}
                                checked={missingRoles.includes(role.id)}
                                onCheckedChange={() => toggleRole(role.id)}
                            />
                            <Label htmlFor={role.id} className="font-normal cursor-pointer">{role.label}</Label>
                        </div>
                    ))}

                    <div className="flex items-center space-x-2 mt-2">
                        <Checkbox
                            id="uncertain"
                            checked={isUncertainRole}
                            onCheckedChange={(c) => handleUncertainChange(c === true)}
                        />
                        <Label htmlFor="uncertain" className="font-normal cursor-pointer">Uncertain / Cannot Determine</Label>
                    </div>

                    <div className="mt-2">
                        <Label htmlFor="other-role" className="text-sm text-muted-foreground mb-1 block">Other (Specify):</Label>
                        <Input
                            id="other-role"
                            value={missingRolesOther}
                            onChange={(e) => handleOtherRoleChange(e.target.value)}
                            placeholder="E.g., Cultural influence..."
                        />
                    </div>
                </div>
            </div>




            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Label className="text-base font-semibold">4. Reflexivity Statement</Label>
                    {config.requireReflexivity && <span className="text-red-500 text-xs">(Required)</span>}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="p-1 hover:bg-slate-100 rounded-full transition-colors cursor-help">
                                    <Info className="h-4 w-4 text-purple-600" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[250px] p-3 bg-slate-900 text-white border-slate-800 shadow-xl z-50">
                                <p className="text-sm font-normal leading-relaxed">
                                    Reflection on your own positioning, background knowledge, and assumptions that influenced your evaluation.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">
                    How did your professional expertise or specific background influence this assessment?
                </p>
                <Textarea
                    value={reflexivity}
                    onChange={(e) => handleReflexivityChange(e.target.value)}
                    placeholder="E.g., My experience in digital rights advocacy makes me focus on public transparency..."
                    className="min-h-[100px]"
                />
                {config.requireReflexivity && reflexivity.length < 15 && reflexivity.length > 0 && (
                    <p className="text-xs text-amber-600">Please elaborate slightly more (min 15 characters).</p>
                )}
            </div>

        </div>
    );
}
