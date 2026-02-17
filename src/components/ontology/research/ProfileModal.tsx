import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ParticipantProfile } from '@/lib/study-config';

interface ProfileModalProps {
    onComplete: (profile: ParticipantProfile) => void;
}

const EXPERTISE_AREAS = [
    'AI Governance',
    'Labor Studies',
    'STS / Postcolonial Theory',
    'Legal Studies (Critical)',
    'Legal Studies (Regulatory)',
    'Industry Compliance',
    'Technical Standards (IEEE/ISO)',
    'AI Safety',
    'Other'
];

const JURISDICTIONS = [
    { id: 'eu', label: 'European Union (EU AI Act)' },
    { id: 'us', label: 'United States (Colorado/California)' },
    { id: 'brazil', label: 'Brazil (LGPD/AI Bill)' },
    { id: 'india', label: 'India (DPDP/AI)' }
];

export function ProfileModal({ onComplete }: ProfileModalProps) {
    const [expertise, setExpertise] = useState<string[]>([]);
    const [familiarity, setFamiliarity] = useState<Record<string, number>>({
        eu: 0,
        us: 0,
        brazil: 0,
        india: 0
    });

    const toggleExpertise = (area: string) => {
        setExpertise(prev =>
            prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
        );
    };

    const handleFamiliarityChange = (id: string, val: number) => {
        setFamiliarity(prev => ({ ...prev, [id]: val }));
    };

    const handleSubmit = () => {
        if (expertise.length === 0) return; // Basic validation
        onComplete({
            expertiseAreas: expertise,
            jurisdictionalFamiliarity: familiarity
        });
    };

    return (
        <Dialog open={true}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Participant Profile</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {/* Expertise Areas */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Primary Areas of Expertise (Select all that apply)</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {EXPERTISE_AREAS.map(area => (
                                <div key={area} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`exp-${area}`}
                                        checked={expertise.includes(area)}
                                        onCheckedChange={() => toggleExpertise(area)}
                                    />
                                    <Label htmlFor={`exp-${area}`} className="font-normal">{area}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Jurisdictional Familiarity */}
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">Jurisdictional Familiarity</Label>
                        <p className="text-sm text-slate-500 -mt-2">Rate your knowledge level from 0 (None) to 4 (Expert)</p>
                        <div className="space-y-4 bg-slate-50 p-6 rounded-lg border border-slate-100">
                            {JURISDICTIONS.map(jur => (
                                <div key={jur.id} className="grid grid-cols-[1fr_240px] items-center gap-4">
                                    <Label className="font-normal">{jur.label}</Label>
                                    <div className="flex bg-white rounded-md shadow-sm border p-1">
                                        {[0, 1, 2, 3, 4].map((score) => (
                                            <button
                                                key={score}
                                                onClick={() => handleFamiliarityChange(jur.id, score)}
                                                className={`
                                                    w-10 h-9 rounded text-sm font-medium transition-all
                                                    ${familiarity[jur.id] === score
                                                        ? 'bg-purple-600 text-white shadow-md'
                                                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                                    }
                                                `}
                                                title={score === 0 ? "None" : score === 4 ? "Expert" : undefined}
                                                type="button"
                                            >
                                                {score}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={expertise.length === 0}>
                        Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
