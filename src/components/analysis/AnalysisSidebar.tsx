import React from "react";
import {
    LayoutDashboard, GitBranch, Layers, ShieldAlert, BadgeCheck,
    Activity, Scale, Zap, LucideIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HealthIndicator } from "@/components/governance/HealthIndicator";
import { EscalationStatus } from "@/types/escalation";

// ... (AnalysisSection type remains same)
export type AnalysisSection =
    | 'overview'
    | 'tensions'
    | 'dimensions'
    | 'assemblage_dynamics'
    | 'legitimacy'
    | 'reflexivity'
    | 'stress'
    | 'audit';

interface NavButtonProps {
    active: boolean;
    icon: LucideIcon;
    label: string;
    sub?: string;
    onClick: () => void;
    locked?: boolean; // [NEW] Gating support
}

function NavButton({ active, icon: Icon, label, sub, onClick, locked }: NavButtonProps) {
    const content = (
        <Button
            variant="ghost"
            onClick={locked ? undefined : onClick}
            className={cn(
                "w-full justify-start h-auto text-left px-3 py-2.5 mb-1 transition-all duration-200",
                active
                    ? "bg-slate-100/80 text-indigo-900 border-l-2 border-indigo-600 rounded-l-none rounded-r-md"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-transparent",
                locked && "opacity-50 cursor-not-allowed grayscale"
            )}
        >
            <div className="flex items-start gap-3">
                <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", active ? "text-indigo-600" : "text-slate-400")} />
                <div className="flex-1 overflow-hidden">
                    <div className={cn("font-semibold leading-tight", active ? "text-slate-900" : "text-slate-600")}>
                        {label}
                        {locked && <span className="ml-2 text-rose-500 text-[10px] uppercase font-bold">(Locked)</span>}
                    </div>
                    {sub && (
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5 truncate leading-tight">
                            {sub}
                        </div>
                    )}
                </div>
            </div>
        </Button>
    );

    return content;
}

interface AnalysisSidebarProps {
    activeSection: AnalysisSection;
    onSectionChange: (section: AnalysisSection) => void;
    className?: string;
    // [NEW] Escalation Props
    escalationStatus?: EscalationStatus | null;
    isAnalyzing?: boolean;
    onEscalationClick?: () => void;
}

export function AnalysisSidebar({
    activeSection,
    onSectionChange,
    className,
    escalationStatus,
    isAnalyzing,
    onEscalationClick
}: AnalysisSidebarProps) {
    // const { toggleMode, isAdvanced } = useViewMode(); // DEPRECATED

    return (
        <nav className={cn("w-64 flex flex-col h-full bg-white border-r border-slate-200 py-6 pr-3", className)}>

            {/* Core Assemblage */}
            <div className="mb-2 px-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Assemblage</h3>
                </div>
                {/* [NEW] Health Indicator */}
                <div className="mb-3">
                    <HealthIndicator
                        status={escalationStatus || null}
                        isAnalyzing={!!isAnalyzing}
                        onClick={onEscalationClick}
                    />
                </div>
            </div>

            <div className="space-y-1">
                <NavButton
                    icon={LayoutDashboard}
                    label="Assemblage Overview"
                    sub="Key Actors, Relations & Stabilizations"
                    active={activeSection === 'overview'}
                    onClick={() => onSectionChange('overview')}
                />

                <NavButton
                    icon={GitBranch}
                    label="Mediations & Translations"
                    sub="How Elements Enroll, Code & Connect"
                    active={activeSection === 'tensions'}
                    onClick={() => onSectionChange('tensions')}
                />
                <NavButton
                    icon={Layers}
                    label="Governance & Agency"
                    sub="Power, Inclusion & Rights"
                    active={activeSection === 'dimensions'}
                    onClick={() => onSectionChange('dimensions')}
                />
                <NavButton
                    icon={Activity}
                    label="Assemblage Dynamics"
                    sub="Territorialization & Deterritorialization"
                    active={activeSection === 'assemblage_dynamics'}
                    onClick={() => onSectionChange('assemblage_dynamics')}
                />
            </div>

            <div className="my-6 px-4">
                <div className="h-px bg-slate-100" />
            </div>

            {/* Critical Mediation */}
            <div className="mb-2 px-4 flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Critical Mediation</h3>
                <Badge variant="outline" className="text-[9px] h-4 px-1 bg-slate-50 text-slate-500 border-slate-200">Critical</Badge>
            </div>

            <div className="space-y-1">
                <NavButton
                    icon={Scale}
                    label="Legitimacy Claims"
                    sub="Justifications & Moral Orders"
                    active={activeSection === 'legitimacy'}
                    onClick={() => onSectionChange('legitimacy')}
                />
                <NavButton
                    icon={ShieldAlert}
                    label="Reflexive Critique"
                    sub="AI Positionality, Bias & Epistemic Limits"
                    active={activeSection === 'reflexivity'}
                    onClick={() => onSectionChange('reflexivity')}
                />
                <NavButton
                    icon={Zap}
                    label="Consistency Stress-Test"
                    sub="Adversarial Framing"
                    active={activeSection === 'stress'}
                    onClick={() => onSectionChange('stress')}
                />
                <NavButton
                    icon={BadgeCheck}
                    label="Traceability Audit"
                    sub="Actor Pathways & Empirical Grounding"
                    active={activeSection === 'audit'}
                    onClick={() => onSectionChange('audit')}
                />
            </div>
        </nav>
    );
}
