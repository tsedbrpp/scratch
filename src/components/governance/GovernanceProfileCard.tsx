import React, { useState } from 'react';
import { GovernanceProfile } from '@/types/governance';
import { TenureMath } from '@/lib/governance/tenure-math';

export interface GovernanceProfileCardProps {
    profile: GovernanceProfile;
}

export const GovernanceProfileCard: React.FC<GovernanceProfileCardProps> = ({ profile }) => {
    const { bonusPercent, explanation } = TenureMath.getWeightExplanation(profile.tenureDays);
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 w-full max-w-sm">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">My Governance</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${profile.verificationStatus === 'VERIFIED' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                        <span className="text-xs text-slate-500">
                            {profile.verificationStatus === 'VERIFIED' ? 'Verified Citizen' : 'Unverified Visitor'}
                        </span>
                    </div>
                </div>
                {profile.verificationStatus === 'UNVERIFIED' && (
                    <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition">
                        Verify ID
                    </button>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-3 rounded border border-slate-100">
                    <div className="text-xs text-slate-400 uppercase">Tenure</div>
                    <div className="text-lg font-mono font-semibold text-slate-800">
                        {Math.floor(profile.tenureDays)} <span className="text-xs font-sans font-normal text-slate-500">days</span>
                    </div>
                </div>

                <div
                    className="bg-white p-3 rounded border border-slate-100 relative cursor-help"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <div className="text-xs text-slate-400 uppercase">Voting Weight</div>
                    <div className="text-lg font-mono font-semibold text-indigo-600">
                        {profile.votingWeight.toFixed(2)}x
                    </div>

                    {/* Tooltip */}
                    {showTooltip && (
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-800 text-white text-xs p-2 rounded shadow-lg z-10">
                            {explanation}
                            <div className="mt-1 text-slate-400 border-t border-slate-700 pt-1">
                                Formula: 1 + (0.2 * (1 - e^(-t/730)))
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Activity Stats */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Votes Cast</span>
                    <span className="font-medium text-slate-700">{profile.votesCast}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Proposals Created</span>
                    <span className="font-medium text-slate-700">{profile.proposalsCreated}</span>
                </div>
            </div>
        </div>
    );
};
