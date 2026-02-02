"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams, usePathname } from "next/navigation";
import { useSources } from "@/hooks/useSources";
import { AnalysisSidebar, AnalysisSection } from "@/components/analysis/AnalysisSidebar";
import { OverviewDashboard } from "@/components/analysis/OverviewDashboard";
import { TensionsView } from "@/components/analysis/TensionsView";
import { StructuralDimensionsView } from "@/components/analysis/StructuralDimensionsView";
import { AssemblageDynamicsView } from "@/components/analysis/AssemblageDynamicsView";
import { LegitimacyClaimsView } from "@/components/analysis/LegitimacyClaimsView";
import { SystemCritiqueSection } from "@/components/common/SystemCritiqueSection";
import { VerifiedEvidenceSection } from "@/components/policy/analysis/VerifiedEvidenceSection";
import { StressTestSection } from "@/components/policy/analysis/StressTestSection";
import { Loader2, ArrowLeft, RefreshCw, Zap, ShieldCheck, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyzeDocument, AnalysisMode } from "@/services/analysis";
import { AnalysisResult } from "@/types";

function AnalysisPageContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const sourceId = params.id as string;

    // We reuse the global sources state for now
    const { sources, isLoading: isSourcesLoading, updateSource } = useSources();

    // Initialize from URL or default to 'overview'
    const initialSection = (searchParams.get('section') as AnalysisSection) || 'overview';
    const [activeSection, setActiveSection] = useState<AnalysisSection>(initialSection);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [critiqueResult, setCritiqueResult] = useState<AnalysisResult['system_critique'] | null>(null);
    const [isCritiqueLoading, setIsCritiqueLoading] = useState(false);

    // Sync state with URL if URL changes (external navigation)
    useEffect(() => {
        const section = searchParams.get('section') as AnalysisSection;
        if (section && section !== activeSection) {
            setActiveSection(section);
        }
    }, [searchParams]);

    // Update URL when section changes
    const handleSectionChange = (section: AnalysisSection) => {
        setActiveSection(section);
        const params = new URLSearchParams(searchParams.toString());
        params.set('section', section);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Find the source
    const source = sources.find(s => s.id === sourceId);

    const handleAnalyze = async (mode: AnalysisMode) => {
        if (!source || isAnalyzing) return;

        setIsAnalyzing(true);
        console.log(`Starting analysis: Mode=${mode}, SourceID=${source.id}`);
        try {
            const result = await analyzeDocument(
                source.extractedText || "",
                mode,
                source.type || "Policy Document",
                true,
                source.id,
                source.title,
                undefined,
                source.analysis
            );

            const updatedAnalysis = { ...source.analysis, ...result };
            await updateSource(source.id, { analysis: updatedAnalysis });
        } catch (error) {
            console.error("Analysis failed:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleRunCritique = async () => {
        if (!source || isCritiqueLoading) return;

        setIsCritiqueLoading(true);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    analysisMode: 'critique',
                    text: source.title || "Source Text",
                    existingAnalysis: source.analysis
                })
            });
            const data = await response.json();

            if (data.success && data.analysis?.system_critique) {
                setCritiqueResult(data.analysis.system_critique);
                await handleUpdateAnalysis({ system_critique: data.analysis.system_critique });
            } else {
                console.error("Critique failed:", data.error);
            }
        } catch (err) {
            console.error("Network error:", err);
        } finally {
            setIsCritiqueLoading(false);
        }
    };

    const handleUpdateAnalysis = async (updates: Partial<AnalysisResult>) => {
        if (!source) return;
        const updatedAnalysis = { ...source.analysis, ...updates };
        await updateSource(source.id, { analysis: updatedAnalysis });
    };

    if (isSourcesLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Loading Analysis Environment...</p>
                </div>
            </div>
        );
    }

    if (!source) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <div className="text-center max-w-md p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Document Not Found</h2>
                    <p className="text-slate-500 mb-6">The analysis you requested could not be located using ID: {sourceId}</p>
                    <Button onClick={() => router.push('/data')} variant="secondary">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Returns to Documents
                    </Button>
                </div>
            </div>
        );
    }

    if (!source.analysis) {
        return (
            <div className="container mx-auto p-12 text-center">
                <h2 className="text-2xl font-bold mb-4">No Analysis Found</h2>
                <Button onClick={() => router.push('/data')}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
            <AnalysisSidebar
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                className="shrink-0 z-20 shadow-sm"
            />

            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => router.push('/data')} className="text-slate-500 hover:text-slate-900 -ml-2">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back
                        </Button>
                        <div className="h-6 w-px bg-slate-200" />
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 truncate max-w-md" title={source.title}>
                                {source.title}
                            </h1>
                            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                                {source.type} • {source.addedDate}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {activeSection === 'reflexivity' && (
                            <Button
                                size="sm"
                                variant={source.analysis.system_critique ? "outline" : "default"}
                                onClick={() => handleAnalyze('dsf')}
                                disabled={isAnalyzing}
                                className={!source.analysis.system_critique ? "bg-indigo-600 text-white hover:bg-indigo-700" : ""}
                            >
                                {isAnalyzing ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-2 h-3 w-3" />}
                                {source.analysis.system_critique ? "Refresh Critique" : "Run Reflexivity Analysis"}
                            </Button>
                        )}

                        {(activeSection === 'audit' || activeSection === 'stress') && (
                            <Button
                                size="sm"
                                variant={source.analysis.verified_quotes && source.analysis.verified_quotes.length > 0 ? "outline" : "default"}
                                onClick={() => handleAnalyze('stress_test')}
                                disabled={isAnalyzing}
                                className={!source.analysis.verified_quotes ? "bg-indigo-600 text-white hover:bg-indigo-700" : ""}
                            >
                                {isAnalyzing ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Zap className="mr-2 h-3 w-3" />}
                                {activeSection === 'stress' ? "Run Stress Test" : (source.analysis.verified_quotes ? "Re-Run Audit" : "Run Verification")}
                            </Button>
                        )}

                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {activeSection === 'overview' && (
                            <OverviewDashboard
                                analysis={source.analysis}
                                sourceTitle={source.title}
                                sourceId={source.id}
                                userImpression={source.analysis.user_impression}
                                onUpdate={handleUpdateAnalysis}
                            />
                        )}

                        {activeSection === 'tensions' && (
                            <TensionsView
                                analysis={source.analysis}
                                sourceTitle={source.title}
                                onUpdate={handleUpdateAnalysis}
                            />
                        )}

                        {activeSection === 'dimensions' && (
                            <StructuralDimensionsView analysis={source.analysis} />
                        )}

                        {activeSection === 'assemblage_dynamics' && (
                            <AssemblageDynamicsView analysis={source.analysis} />
                        )}

                        {activeSection === 'legitimacy' && (
                            <LegitimacyClaimsView analysis={source.analysis} />
                        )}

                        {activeSection === 'stress' && (
                            source.analysis.stress_test_report ? (
                                <StressTestSection report={source.analysis.stress_test_report} />
                            ) : (
                                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                                    <Zap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-slate-500 font-medium">No Stress Test Data</h3>
                                    <p className="text-sm text-slate-400 mt-2">Run the stress test protocol based on adversarial framing.</p>
                                </div>
                            )
                        )}

                        {activeSection === 'reflexivity' && (
                            <div className="space-y-6">
                                {(source.analysis.system_critique || critiqueResult) ? (
                                    <SystemCritiqueSection critique={critiqueResult || source.analysis.system_critique!} />
                                ) : (
                                    <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                                        <ShieldCheck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-slate-500 font-medium">No Reflexivity Analysis Found</h3>
                                        <p className="text-sm text-slate-400 mt-2">Run the "Devil's Advocate" protocol to generate one.</p>
                                    </div>
                                )}

                                {/* Run/Re-run Critique Button */}
                                <div className="flex justify-center">
                                    <Button
                                        onClick={handleRunCritique}
                                        disabled={isCritiqueLoading}
                                        variant="outline"
                                        className="gap-2"
                                    >
                                        {isCritiqueLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Running Reflexivity Analysis...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="h-4 w-4" />
                                                {(source.analysis.system_critique || critiqueResult) ? 'Re-Run System Reflexivity' : 'Run System Reflexivity'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'audit' && (
                            source.analysis.verified_quotes && source.analysis.verified_quotes.length > 0 ? (
                                <VerifiedEvidenceSection
                                    quotes={source.analysis.verified_quotes}
                                    fullText={source.extractedText}
                                    sourceTitle={source.title}
                                />
                            ) : (
                                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                                    <BadgeCheck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-slate-500 font-medium">No Verified Evidence</h3>
                                    <p className="text-sm text-slate-400 mt-2">Analysis has not yet extracted verified quotes.</p>
                                </div>
                            )
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function AnalysisPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
            </div>
        }>
            <AnalysisPageContent />
        </Suspense>
    );
}
