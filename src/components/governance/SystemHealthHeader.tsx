import React from 'react';
import { GovernanceSystemState, GenesisPhase } from '@/types/governance';

export interface SystemHealthHeaderProps {
    state: GovernanceSystemState;
}

export const SystemHealthHeader: React.FC<SystemHealthHeaderProps> = ({ state }) => {

    // Derived UI colors based on Phase
    const getPhaseColor = (p: GenesisPhase) => {
        switch (p) {
            case GenesisPhase.FOUNDING: return 'bg-amber-100 text-amber-800 border-amber-300';
            case GenesisPhase.TRANSITION: return 'bg-blue-100 text-blue-800 border-blue-300';
            case GenesisPhase.SOVEREIGNTY: return 'bg-green-100 text-green-800 border-green-300';
        }
    };

    return (
        <div className="w-full bg-white border border-slate-200 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">

                {/* Left: Phase Indicator */}
                <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getPhaseColor(state.phase)} uppercase tracking-wider`}>
                        {state.phase} PHASE
                    </div>
                    <span className="text-slate-500 text-sm">
                        Since {new Date(state.genesisTimestamp).toLocaleDateString()}
                    </span>
                </div>

                {/* Center: System Vitals */}
                <div className="flex gap-6 text-sm">
                    <div className="flex flex-col items-center">
                        <span className="text-slate-400 text-xs uppercase">Verified Citizens</span>
                        <span className="font-semibold text-slate-700">{state.totalVerifiedUsers}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-slate-400 text-xs uppercase">Active Proposals</span>
                        <span className="font-semibold text-slate-700">{state.activeProposals}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-slate-400 text-xs uppercase">Vetoes Used</span>
                        <span className={`font-semibold ${state.developerVetoCount > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                            {state.developerVetoCount} / 3
                        </span>
                    </div>
                </div>

                {/* Right: Status */}
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-600">Governance Active</span>
                </div>
            </div>

            {/* Phase Description Helper */}
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400 italic">
                {state.phase === GenesisPhase.FOUNDING &&
                    "System operates under Developer Stewardship. Veto power is absolute."}
                {state.phase === GenesisPhase.TRANSITION &&
                    "Power is shared. Developer Veto limited to 3 uses. Community ratifies changes."}
                {state.phase === GenesisPhase.SOVEREIGNTY &&
                    "Full community control. No Developer Veto."}
            </div>
        </div>
    );
};
