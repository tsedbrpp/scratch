import { useState } from 'react';
import { EcosystemActor, EcosystemConfiguration } from '@/types/ecosystem';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { mapApiResponseToAssemblage, ApiResponse } from '@/lib/assemblage-mapper';

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
    const { currentWorkspaceId } = useWorkspace();
    const [isExtracting, setIsExtracting] = useState(false);

    const extractAssemblage = async (
        mode: 'text' | 'discovery',
        input: string
    ): Promise<{
        success: boolean;
        newActors?: EcosystemActor[];
        newConfig?: EcosystemConfiguration;
        memberIds?: string[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            if (currentWorkspaceId) {
                headers['x-workspace-id'] = currentWorkspaceId;
            }
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
            const analysis: ApiResponse = data.analysis;

            if (!analysis) {
                console.error("Extraction returned no analysis data:", data);
                return { success: false };
            }

            const assemblage = analysis.assemblage || { name: "New Assemblage", description: "Extracted from text", properties: {} };
            const memberIds: string[] = [];
            const newActors: EcosystemActor[] = [];

            // [REFACTORED] Use dedicated mapper utility
            const { newActors: extractedActors, memberIds: extractedIds } = mapApiResponseToAssemblage(analysis);
            newActors.push(...extractedActors);
            memberIds.push(...extractedIds);

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
