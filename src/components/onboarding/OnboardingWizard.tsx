
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, BookOpen, Users, Globe, Network, GraduationCap, Briefcase, Eye } from 'lucide-react';
import { useServerStorage } from '@/hooks/useServerStorage';

interface OnboardingWizardProps {
    onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
    const [step, setStep] = useState(1);
    const [userRole, setUserRole] = useServerStorage<string | null>("user_role", null);

    const totalSteps = 4;

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
        else onComplete();
    };

    const roles = [
        { id: "researcher", label: "Researcher", icon: GraduationCap },
        { id: "policymaker", label: "Policymaker", icon: Briefcase },
        { id: "student", label: "Student", icon: BookOpen },
        { id: "analyst", label: "Analyst", icon: Eye },
    ];

    const concepts = [
        {
            title: "Assemblage Theory",
            description: "Socio-technical arrangements of humans, artifacts, and concepts.",
            icon: Users
        },
        {
            title: "Legitimacy Dynamics",
            description: "How power is justified, challenged, and maintained in the ecosystem.",
            icon: Globe
        },
        {
            title: "Resistance Strategies",
            description: "Micro-political acts that contest dominant power structures.",
            icon: Network
        },
        {
            title: "Rhizomatic Navigation",
            description: "Exploring data through connections rather than a linear path (like browsing Wikipedia).",
            context: "Contrast to 'arborescent' (tree-like) hierarchies.",
            icon: Network
        }
    ];

    const [conceptIndex, setConceptIndex] = useState(0);

    return (
        <Dialog open={true}>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white border-none shadow-2xl">
                <DialogTitle className="sr-only">Onboarding Wizard</DialogTitle>
                <div className="flex h-[400px]">
                    {/* Left Panel: Progress / Art */}
                    <div className="w-1/3 bg-slate-900 p-6 flex flex-col justify-between text-white">
                        <div>
                            <div className="flex items-center gap-2 font-bold tracking-tight mb-8">
                                <Network className="h-5 w-5 text-emerald-400" />
                                Instant TEA
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map(s => (
                                    <div key={s} className={`flex items-center gap-3 text-sm ${step === s ? "text-white font-medium" : "text-slate-500"}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${step === s ? "border-emerald-500 bg-emerald-500/20 text-emerald-400" : "border-slate-700 bg-slate-800"}`}>
                                            {s}
                                        </div>
                                        <span>
                                            {s === 1 && "Welcome"}
                                            {s === 2 && "Role"}
                                            {s === 3 && "Concepts"}
                                            {s === 4 && "Ready"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="text-xs text-slate-500">
                            v0.1.0 Beta
                        </div>
                    </div>

                    {/* Right Panel: Content */}
                    <div className="w-2/3 p-8 flex flex-col">
                        <div className="flex-1">
                            {step === 1 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-2xl font-bold text-slate-900">Welcome to the Field</h2>
                                    <p className="text-slate-600 leading-relaxed">
                                        This tool maps the complex **assemblages** of AI governance—connecting policy, technology, and social dynamics.
                                    </p>
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-600 italic">
                                        "To understand AI, we must trace the network of relations that sustain it."
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-xl font-bold text-slate-900">Identify Your Position</h2>
                                    <p className="text-slate-500 text-sm">How do you primarily engage with this field?</p>
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        {roles.map(role => {
                                            const Icon = role.icon;
                                            return (
                                                <button
                                                    key={role.id}
                                                    onClick={() => setUserRole(role.id)}
                                                    className={`p-3 rounded-lg border text-left transition-all ${userRole === role.id
                                                        ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500"
                                                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                                        }`}
                                                >
                                                    <Icon className={`h-5 w-5 mb-2 ${userRole === role.id ? "text-emerald-600" : "text-slate-400"}`} />
                                                    <div className={`font-medium text-sm ${userRole === role.id ? "text-emerald-900" : "text-slate-700"}`}>{role.label}</div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-xl font-bold text-slate-900">Core Concepts</h2>
                                    <Card className="border-slate-200 shadow-sm">
                                        <CardContent className="p-5 h-[180px] flex flex-col justify-center text-center">
                                            {React.createElement(concepts[conceptIndex].icon, { className: "h-8 w-8 mx-auto mb-3 text-indigo-500" })}
                                            <h3 className="font-bold text-slate-900 mb-2">{concepts[conceptIndex].title}</h3>
                                            <p className="text-sm text-slate-600">{concepts[conceptIndex].description}</p>
                                            {concepts[conceptIndex].context && (
                                                <p className="text-xs text-slate-400 mt-2 italic">{concepts[conceptIndex].context}</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                    <div className="flex justify-center gap-2 mt-2">
                                        {concepts.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setConceptIndex(i)}
                                                className={`w-2 h-2 rounded-full transition-all ${i === conceptIndex ? "bg-indigo-600 w-4" : "bg-slate-300"}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400 px-2">
                                        <button onClick={() => setConceptIndex((i) => Math.max(0, i - 1))} disabled={conceptIndex === 0}>Prev</button>
                                        <button onClick={() => setConceptIndex((i) => Math.min(concepts.length - 1, i + 1))} disabled={conceptIndex === concepts.length - 1}>Next</button>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 text-center py-8">
                                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Sparkles className="h-8 w-8 text-emerald-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">Ready to Explore</h2>
                                    <p className="text-slate-600">
                                        You are now ready to navigate the ecosystem rhizomatically.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-6 border-t border-slate-100 mt-auto">
                            {step < totalSteps ? (
                                <Button onClick={nextStep} className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
                                    Next <ArrowRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button onClick={onComplete} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-200">
                                    Start Tutorial <ArrowRight className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Icon helper
function Sparkles(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    )
}
