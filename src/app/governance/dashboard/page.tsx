"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useSources } from '@/hooks/useSources';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Layers, BarChart3, AlertOctagon, Activity, Trash } from 'lucide-react';
import { GovernanceService } from '@/services/governance/governance-service';

import { GovernanceProposal } from '@/types/governance';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

function VoteDialog({ proposal, voteType, onVote }: { proposal: GovernanceProposal, voteType: 'for' | 'against', onVote: (type: 'for' | 'against', rationale: string) => void }) {
    const [rationale, setRationale] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);

    const handleVote = () => {
        onVote(voteType, rationale);
        setIsOpen(false);
        setRationale('');
    };

    const isNegation = proposal.type === 'epistemic_negation';
    const isFor = voteType === 'for';

    // Dynamic Text based on Vote Type & Proposal intent
    const actionText = isFor ? "Vote FOR" : "Vote AGAINST";

    let meaningTitle = "";
    let meaningDescription = "";
    let consequenceText = "";

    if (isNegation) {
        if (isFor) {
            meaningTitle = "Support Veto";
            meaningDescription = "You agree that this analysis is flawed, biased, or harmful.";
            consequenceText = "If this vote passes, the analysis will be formally REJECTED and removed from the consensus.";
        } else {
            meaningTitle = "Oppose Veto";
            meaningDescription = "You believe the analysis is valid and should remain.";
            consequenceText = "If this vote passes, the analysis will be RETAINED as valid.";
        }
    } else {
        if (isFor) {
            meaningTitle = "Support Proposal";
            meaningDescription = "You want this feature or change to be implemented.";
            consequenceText = "If passed, this will be queued for implementation.";
        } else {
            meaningTitle = "Oppose Proposal";
            meaningDescription = "You do not think this should be implemented right now.";
            consequenceText = "If passed, this proposal will be discarded.";
        }
    }

    const buttonColor = isFor
        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
        : "bg-rose-600 hover:bg-rose-700 text-white";

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button
                    className={`flex items-center gap-1 cursor-pointer transition-colors p-1 rounded ${isFor
                        ? 'hover:text-emerald-600 hover:bg-emerald-50 text-slate-400'
                        : 'hover:text-rose-600 hover:bg-rose-50 text-slate-400'
                        }`}
                >
                    <span>{isFor ? '👍' : '👎'}</span>
                    {isFor ? proposal.votesFor : proposal.votesAgainst}
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{actionText}: {proposal.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className={`p-4 rounded-md border ${isFor ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                        <h4 className={`font-bold mb-1 ${isFor ? 'text-emerald-800' : 'text-rose-800'}`}>{meaningTitle}</h4>
                        <p className={`text-sm mb-2 ${isFor ? 'text-emerald-700' : 'text-rose-700'}`}>{meaningDescription}</p>
                        <div className={`text-xs uppercase font-bold tracking-wide mt-3 ${isFor ? 'text-emerald-600' : 'text-rose-600'}`}>Consequence:</div>
                        <p className={`text-xs ${isFor ? 'text-emerald-700' : 'text-rose-700'}`}>{consequenceText}</p>
                    </div>
                    <p className="text-sm text-slate-500">
                        Please provide a rationale for your vote.
                    </p>
                    <Textarea
                        placeholder={isFor ? "Why do you support this?" : "Why do you oppose this?"}
                        value={rationale}
                        onChange={(e) => setRationale(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
                <DialogFooter className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleVote} className={buttonColor}>
                        Confirm {actionText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function GovernanceOrchestrationPage() {
    const { sources, isLoading, refresh: refreshSources } = useSources();
    const [proposals, setProposals] = React.useState<GovernanceProposal[]>([]);

    // Load Proposals
    React.useEffect(() => {
        const loadProposals = async () => {
            const service = new GovernanceService();
            const data = await service.getProposals();
            setProposals(data);
        };
        loadProposals();
    }, []);

    // 1. Calculate Risk Classifications
    const riskStats = useMemo(() => {
        const stats = {
            total: sources.length,
            high: 0,
            medium: 0,
            low: 0,
            requiresAction: 0
        };

        sources.forEach(source => {
            const status = source.analysis?.escalation_status;
            if (status?.level === 'HARD') stats.high++;
            if (status?.level === 'MEDIUM') stats.medium++;
            if (status?.level === 'SOFT' || !status) stats.low++;

            if (status?.status === 'DETECTED' || status?.status === 'DEFERRED') {
                stats.requiresAction++;
            }
        });

        return stats;
    }, [sources]);

    // 2. Calculate Recurrence Patterns (Dominant Logics)
    const recurrencePatterns = useMemo(() => {
        const patterns: Record<string, { count: number, sources: string[] }> = {};

        sources.forEach(source => {
            const logic = source.analysis?.dominant_logic;
            if (logic) {
                if (!patterns[logic]) {
                    patterns[logic] = { count: 0, sources: [] };
                }
                patterns[logic].count++;
                patterns[logic].sources.push(source.title);
            }
        });

        // Filter for > 1 occurrence and sort
        return Object.entries(patterns)
            .filter(([_, data]) => data.count > 1)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5); // Top 5
    }, [sources]);

    if (isLoading) {
        return <div className="p-12 text-center text-slate-400">Loading Orchestration Data...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8 space-y-8">
            {/* Header Section */}
            <div className="flex justify-between items-center max-w-6xl mx-auto">
                <div>
                    <h1 className="text-3xl font-light text-slate-900">Governance Orchestration</h1>
                    <p className="text-slate-500 mt-1">Resource-grounded insights and risk landscape analysis.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex gap-3">
                        {/* Meta-Governance Console Link Removed */}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. Risk Landscape Card */}
                <Card className="md:col-span-2 border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-indigo-600" />
                            Risk Landscape
                        </CardTitle>
                        <CardDescription>Escalation status across the ecosystem.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex flex-col items-center">
                                <span className="text-red-800 font-bold text-2xl">{riskStats.high}</span>
                                <span className="text-red-600 text-sm font-medium uppercase tracking-wide">High Risk</span>
                                <span className="text-red-400 text-xs mt-1">Blocking</span>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex flex-col items-center">
                                <span className="text-amber-800 font-bold text-2xl">{riskStats.medium}</span>
                                <span className="text-amber-600 text-sm font-medium uppercase tracking-wide">Uncertainty</span>
                                <span className="text-amber-400 text-xs mt-1">Review Needed</span>
                            </div>
                            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex flex-col items-center">
                                <span className="text-emerald-800 font-bold text-2xl">{riskStats.low}</span>
                                <span className="text-emerald-600 text-sm font-medium uppercase tracking-wide">Stable</span>
                                <span className="text-emerald-400 text-xs mt-1">Clear</span>
                            </div>
                        </div>

                        {riskStats.requiresAction > 0 && (
                            <div className="bg-slate-50 border border-slate-200 rounded-md p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <AlertOctagon className="w-5 h-5 text-amber-500" />
                                    <div className="text-sm">
                                        <span className="font-semibold text-slate-700">{riskStats.requiresAction} Sources</span> require mitigation or review.
                                    </div>
                                </div>
                                <Button size="sm" variant="secondary" asChild>
                                    <Link href="/synthesis">View in Synthesis</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 1.5 Active Governance Proposals */}
                <Card className="md:col-span-1 border-slate-200 shadow-sm flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-600" />
                            Active Proposals
                        </CardTitle>
                        <CardDescription>Ongoing community votes.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto max-h-[300px] space-y-4 custom-scrollbar pr-2">
                        {proposals.map(proposal => (
                            <div
                                key={proposal.id}
                                className={`p-3 rounded-lg border text-sm relative group transition-all ${proposal.type === 'epistemic_negation'
                                    ? 'bg-amber-50 border-amber-200 hover:border-amber-300'
                                    : 'bg-white border-slate-100 hover:border-slate-300'
                                    }`}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Are you sure you want to delete this proposal?')) {
                                            const service = new GovernanceService();
                                            service.deleteProposal(proposal.id).then(success => {
                                                if (success) {
                                                    setProposals(prev => prev.filter(p => p.id !== proposal.id));
                                                    refreshSources(); // Sync stats
                                                } else {
                                                    alert('Failed to delete proposal. Check console for details.');
                                                }
                                            });
                                        }
                                    }}
                                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all z-10"
                                    title="Delete Proposal (Owner)"
                                >
                                    <Trash className="w-4 h-4" />
                                </button>
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${proposal.type === 'epistemic_negation' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {proposal.type === 'epistemic_negation' ? 'Veto Request' : 'Feature Proposal'}
                                    </span>
                                    <span className="text-xs text-slate-400 font-mono">
                                        {new Date(proposal.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h4 className="font-medium text-slate-800 mb-1 leading-snug">
                                    {proposal.title.replace('Negation of:', 'Veto:')}
                                </h4>
                                {proposal.targetSourceTitle && (
                                    <div className="text-xs text-slate-500 mb-1">
                                        <span className="font-semibold text-slate-700">Target:</span> {proposal.targetSourceTitle}
                                    </div>
                                )}
                                <p className="text-slate-500 text-xs line-clamp-2 italic bg-slate-50 p-1 rounded border border-slate-100">
                                    "{proposal.description}"
                                </p>

                                <div className="mt-3 flex items-center gap-3 text-xs font-medium text-slate-400">
                                    <VoteDialog
                                        proposal={proposal}
                                        voteType="for"
                                        onVote={(type, rationale) => {
                                            const service = new GovernanceService();
                                            service.castVote(proposal.id, type, rationale).then(updated => {
                                                if (updated) {
                                                    setProposals(prev => prev.map(p => p.id === updated.id ? updated : p));
                                                }
                                            });
                                        }}
                                    />
                                    <VoteDialog
                                        proposal={proposal}
                                        voteType="against"
                                        onVote={(type, rationale) => {
                                            const service = new GovernanceService();
                                            service.castVote(proposal.id, type, rationale).then(updated => {
                                                if (updated) {
                                                    setProposals(prev => prev.map(p => p.id === updated.id ? updated : p));
                                                }
                                            });
                                        }}
                                    />

                                    {proposal.type === 'epistemic_negation' && (
                                        <div className="flex flex-col items-end gap-2 ml-auto">
                                            <div className="text-amber-600 font-bold text-[10px] uppercase">
                                                Veto Requested
                                            </div>
                                            {proposal.targetSourceId && (
                                                <Link href={`/analysis/${proposal.targetSourceId}`}>
                                                    <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-slate-500 hover:text-indigo-600">
                                                        View Analysis →
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {proposal.voteHistory && proposal.voteHistory.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-slate-50 space-y-2">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Latest Comments</div>
                                        {proposal.voteHistory.slice(-3).reverse().map((v, i) => (
                                            <div key={i} className="text-xs text-slate-600 bg-slate-50 p-2 rounded relative">
                                                <span className="absolute top-2 right-2 text-[10px] text-slate-400">{v.vote.toUpperCase()}</span>
                                                <p className="italic">"{v.rationale || 'No comment'}"</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* 2. System Stats */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-blue-600" />
                            Orchestration Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                            <span className="text-slate-500 text-sm">Active Sources</span>
                            <span className="font-mono font-bold text-lg">{riskStats.total}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                            <span className="text-slate-500 text-sm">Recurring Patterns</span>
                            <span className="font-mono font-bold text-lg">{recurrencePatterns.length}</span>
                        </div>
                        <div className="pt-2">
                            <p className="text-xs text-slate-400 leading-relaxed">
                                &quot;Governance is not just policy, but the orchestration of material assemblages.&quot;
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Recurrence / Dominant Logics */}
                <Card className="md:col-span-3 border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-purple-600" />
                            Recurring Assemblage Patterns
                        </CardTitle>
                        <CardDescription>Dominant logics detected frequently across the corpus, indicating structural tendencies.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recurrencePatterns.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                No significant recurring patterns detected yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recurrencePatterns.map(([logic, data]) => (
                                    <div key={logic} className="flex items-start gap-4 p-4 rounded-lg bg-white border border-slate-100 hover:border-purple-200 transition-colors">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-50 text-purple-700 font-bold flex items-center justify-center">
                                            {data.count}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-slate-800 text-lg">{logic}</h4>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Present in: {data.sources.slice(0, 3).join(", ")}
                                                {data.sources.length > 3 && ` and ${data.sources.length - 3} others`}
                                            </p>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-purple-500"
                                                    style={{ width: `${Math.min((data.count / sources.length) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
