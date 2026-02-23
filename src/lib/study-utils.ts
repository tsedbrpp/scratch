import { Source } from '@/types';
import { OntologyData } from '@/types/ontology';
import { StudyCase, StudyCaseConfig, STUDY_CASES } from './study-config';

/**
 * Generates a list of StudyCases based on the Ghost Nodes present in the provided ontology maps.
 * 
 * @param sources List of available sources (policies)
 * @param ontologyMaps Record of ontology data keyed by source ID
 * @returns Array of StudyCase objects for the research playlist
 */
export function generateCasesFromOntology(
    sources: Source[],
    ontologyMaps: Record<string, OntologyData>
): StudyCase[] {
    const casesBySource: Record<string, StudyCase[]> = {};
    const allCases: StudyCase[] = [];

    // Include the static cases defined in study-config.ts first
    const selectedCases: StudyCase[] = [...STUDY_CASES];

    // 1. Generate all potential cases grouped by source
    sources.forEach(source => {
        const data = ontologyMaps[source.id];
        if (!data || !data.nodes) return;

        const sourceCases: StudyCase[] = [];
        const ghostNodes = data.nodes.filter(n => n.isGhost);

        // Sort ghost nodes deterministically by ID to ensure consistency across evaluators
        ghostNodes.sort((a, b) => a.id.localeCompare(b.id));

        ghostNodes.forEach(node => {
            const caseId = `case_${source.id}_${node.id}`;
            const evidencePoints: string[] = [];

            if (node.potentialConnections && node.potentialConnections.length > 0) {
                node.potentialConnections.forEach(conn => {
                    evidencePoints.push(`Potential connection to ${conn.targetActor}: "${conn.evidence}"`);
                });
            } else if (node.quote) {
                evidencePoints.push(node.quote);
            } else {
                evidencePoints.push("No specific textual evidence provided, but structural analysis indicates absence.");
            }

            const hypothesis = node.exclusionType
                ? formatExclusionType(node.exclusionType)
                : "Constitutive Ghost Node";

            // Map the V2 AI output properties. 
            // Note: Our LLM outputs 'quote' and 'actors', but the UI expects 'text' and 'actorTags'.
            const mappedEvidenceQuotes = node.evidenceQuotes?.map((eq, index) => ({
                id: `q-${index}`,
                text: eq.quote, // Mapped
                sourceRef: { docId: source.id, section: eq.sourceRef }, // Mapped
                actorTags: eq.actors || [], // Mapped
                mechanismTags: []
            })) || [];

            const mappedRoster = node.roster ? {
                actorsInSection: node.roster.actors || [],
                mechanismsInSection: node.roster.mechanisms || []
            } : undefined;

            const mappedMissingSignals = node.missingSignals?.map((ms, index) => ({
                id: `ms-${index}`,
                label: ms.signal
            })) || [];

            sourceCases.push({
                id: caseId,
                sourceId: source.id,
                nodeId: node.id,
                title: `${source.title}: ${node.label}`,
                pane1: { evidencePoints },
                pane2: {
                    hypothesis,
                    reasoning: node.whyAbsent || "No reasoning provided for this ghost node."
                },
                config: { requireReflexivity: true },
                // V2 Overrides for mapping
                evidenceQuotes: mappedEvidenceQuotes.length > 0 ? mappedEvidenceQuotes : undefined,
                claim: node.claim,
                roster: mappedRoster,
                missingSignals: mappedMissingSignals.length > 0 ? mappedMissingSignals : undefined
            });
        });

        if (sourceCases.length > 0) {
            casesBySource[source.id] = sourceCases;
        }
    });

    // 2. Select cases to meet requirements (At least 2 per source, Max 10 total)
    const sourceIds = Object.keys(casesBySource);
    const MIN_PER_SOURCE = 2;
    const MAX_TOTAL = 10;

    // Phase A: Take minimum from each source
    sourceIds.forEach(sourceId => {
        const cases = casesBySource[sourceId];
        const countToTake = Math.min(cases.length, MIN_PER_SOURCE);
        selectedCases.push(...cases.slice(0, countToTake));
        // Remove taken cases from the pool
        casesBySource[sourceId] = cases.slice(countToTake);
    });

    // Phase B: Fill remaining slots round-robin
    let slotsRemaining = MAX_TOTAL - selectedCases.length;
    let index = 0;

    while (slotsRemaining > 0 && sourceIds.some(id => casesBySource[id].length > 0)) {
        const sourceId = sourceIds[index % sourceIds.length];
        if (casesBySource[sourceId].length > 0) {
            selectedCases.push(casesBySource[sourceId].shift()!);
            slotsRemaining--;
        }
        index++;
    }

    return selectedCases;
}

function formatExclusionType(type: string): string {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
