'use client';

import React, { useEffect, useState } from 'react';
import { GovernanceService } from '@/services/governance/governance-service';
import { GovernanceProfile, GovernanceSystemState } from '@/types/governance';
import { SystemHealthHeader } from '@/components/governance/SystemHealthHeader';
import { GovernanceProfileCard } from '@/components/governance/GovernanceProfileCard';

export default function GovernanceDashboard() {
    const [profile, setProfile] = useState<GovernanceProfile | null>(null);
    const [systemState, setSystemState] = useState<GovernanceSystemState | null>(null);

    useEffect(() => {
        // Initialize Service
        const service = new GovernanceService();

        // Mock State Loading
        const init = async () => {
            // 1. Get/Register User (Mock for Demo)
            const user = await service.registerUser('demo-citizen-01');

            // Artificial Tenure for Demonstration
            user.tenureDays = 400;
            user.votingWeight = service.calculateVotingPower(user);
            user.verificationStatus = 'VERIFIED';
            user.votesCast = 12;
            user.proposalsCreated = 1;

            setProfile(user);

            // 2. Get System State
            setSystemState({
                phase: service.getCurrentPhase(),
                totalVerifiedUsers: 142,
                activeProposals: 3,
                genesisTimestamp: new Date('2025-01-01').getTime(),
                developerVetoCount: 1
            });
        };

        init();
    }, []);

    if (!profile || !systemState) {
        return <div className="p-8 text-slate-400">Loading Governance Systems...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-light text-slate-800 mb-2">Meta-Governance Console</h1>
                <p className="text-slate-500 mb-8">Constitutional monitoring and participation interface.</p>

                {/* 1. System Health */}
                <SystemHealthHeader state={systemState} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* 2. Left Column: Personal Profile */}
                    <div className="md:col-span-1">
                        <GovernanceProfileCard profile={profile} />

                        {/* Placeholder for future specific actions */}
                        <div className="mt-4 p-4 border border-dashed border-slate-300 rounded-lg text-center text-sm text-slate-400">
                            Upcoming: Delegation & Reputation
                        </div>
                    </div>

                    {/* 3. Right Column: Active Proposals (Placeholder for now) */}
                    <div className="md:col-span-2">
                        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm min-h-[400px]">
                            <h3 className="text-lg font-semibold text-slate-700 mb-4">Active Deliberations</h3>

                            {/* Mock Proposal Card */}
                            <div className="border border-slate-200 rounded p-4 mb-4 hover:border-indigo-300 transition cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-bold">VOTING OPEN</span>
                                    <span className="text-xs text-slate-400">Ends in 2d 14h</span>
                                </div>
                                <h4 className="font-medium text-slate-800">Proposal #42: Adjust Tenure Decay Cap</h4>
                                <p className="text-sm text-slate-600 mt-2">
                                    Proposes increasing the max tenure bonus from 1.5x to 1.75x to reward long-term stability...
                                </p>
                            </div>

                            <div className="flex items-center justify-center h-48 text-slate-400 italic">
                                More proposals loading...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
