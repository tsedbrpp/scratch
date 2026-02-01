import { useState } from 'react';
import { EcosystemActor, EcosystemConfiguration } from '@/types/ecosystem';
import { inferActorType } from '@/lib/ecosystem-utils';

interface UseAssemblageExtractionProps {
    isReadOnly: boolean;
    hasCredits: boolean;
    creditsLoading: boolean;
    setIsTopUpOpen: (open: boolean) => void;
}

export function useAssemblageExtraction({
    isReadOnly,
    hasCredits,
    creditsLoading,
    setIsTopUpOpen
}: UseAssemblageExtractionProps) {
    const [isExtracting, setIsExtracting] = useState(false);

    const extractAssemblage = async (
        mode: 'text' | 'discovery',
        input: string
    ): Promise<{
        success: boolean;
        newActors?: EcosystemActor[];
        newConfig?: EcosystemConfiguration;
        memberIds?: string[];
        analysisData?: any;
    }> => {
        if (isReadOnly) {
            alert("This feature is disabled in Demo Mode.");
            return { success: false };
        }

        if (!creditsLoading && !hasCredits) {
            setIsTopUpOpen(true);
            return { success: false };
        }

        if (!input.trim()) return { success: false };

        setIsExtracting(true);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (process.env.NEXT_PUBLIC_DEMO_USER_ID) {
                headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID;
            }

            // Determine Payload based on Mode
            let payload = {};
            if (mode === 'text') {
                payload = {
                    text: input,
                    analysisMode: 'text_extraction',
                    sourceType: 'User Input'
                };
            } else {
                payload = {
                    query: input,
                    analysisMode: 'topic_discovery'
                };
            }

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            const analysis = data.analysis;

            if (!analysis) {
                console.error("Extraction returned no analysis data:", data);
                return { success: false };
            }

            const assemblage = analysis.assemblage || { name: "New Assemblage", description: "Extracted from text", properties: {} };
            const memberIds: string[] = [];
            const newActors: EcosystemActor[] = [];

            // [NEW] Check if actors are already hydrated (Internal Service)

            const firstActor = (analysis.actors && analysis.actors.length > 0) ? analysis.actors[0] : null;

            if (firstActor && firstActor.id && firstActor.metrics && typeof firstActor.metrics.territorialization !== 'undefined') {
                console.log("Using Pre-Hydrated Actors from Service");
                newActors.push(...analysis.actors);
                memberIds.push(...analysis.actors.map((a: any) => a.id));
            }
            // [LEGACY] Raw AI Response mapping
            else if (!Array.isArray(analysis) && analysis.actors && Array.isArray(analysis.actors)) {
                console.log("Using Explicit Actors from Analysis (Raw Mode):", analysis.actors);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                analysis.actors.forEach((a: any) => {
                    const m = a.metrics || {};
                    const id = crypto.randomUUID();
                    newActors.push({
                        id,
                        name: a.name,
                        type: a.type || 'Civil Society',
                        description: a.description || `Identified as ${a.type}`,
                        influence: "Medium", // Legacy field
                        metrics: {
                            territorialization: "Moderate",
                            coding: "Moderate",
                            deterritorialization: "Moderate",
                            rationale: m.rationale || "No rationale provided.",
                            // Store dimensions for tooltip
                            territoriality: m.territoriality,
                            centrality: m.centrality,
                            counter_conduct: m.counter_conduct,
                            discursive_opposition: m.discursive_opposition
                        },
                        quotes: a.evidence_quotes || [],
                        region: a.region || "Unknown",
                        role_type: a.role_type,
                        trace_metadata: a.trace_metadata || {
                            source: "ai_inference",
                            evidence: (a.evidence_quotes && a.evidence_quotes[0]) || "Inferred from analysis",
                            provisional: true,
                            confidence: 0.85
                        },
                        reflexive_log: a.reflexive_log || []
                    });
                    memberIds.push(id);
                });

            } else {
                // Fallback: Infer from Impacts (Legacy)
                const impacts = (analysis && !Array.isArray(analysis)) ? (analysis.impacts || []) : (Array.isArray(analysis) ? analysis : []);
                const uniqueActors = new Set<string>();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                impacts.forEach((imp: any) => {
                    if (imp.actor) uniqueActors.add(imp.actor);
                });

                Array.from(uniqueActors).forEach(name => {
                    const id = crypto.randomUUID();
                    newActors.push({
                        id,
                        name,
                        type: inferActorType(name),
                        description: `Actor identified via impact analysis.`,
                        influence: "Medium",
                        metrics: { territorialization: "Moderate", deterritorialization: "Moderate", coding: "Moderate" },
                        quotes: [],
                        region: "Unknown"
                    });
                    memberIds.push(id);
                });
            }

            if (memberIds.length > 0) {
                const newConfig: EcosystemConfiguration = {
                    id: crypto.randomUUID(),
                    name: assemblage.name || "New Assemblage",
                    description: assemblage.description || "Extracted from text",
                    memberIds,
                    properties: {
                        stability: assemblage.properties.stability || "Medium",
                        generativity: assemblage.properties.generativity || "Medium",
                        territorialization_score: assemblage.properties.territorialization_score,
                        coding_intensity_score: assemblage.properties.coding_intensity_score
                    },
                    analysisData: data.analysis,
                    color: `hsl(${Math.random() * 360}, 70%, 80%)`
                };

                return {
                    success: true,
                    newActors,
                    newConfig,
                    memberIds,
                    analysisData: data.analysis
                };
            }

            return { success: true, newActors: [], memberIds: [] };

        } catch (error) {
            console.error("Extraction failed:", error);
            return { success: false };
        } finally {
            setIsExtracting(false);
        }
    };

    return {
        isExtracting,
        extractAssemblage
    };
}
