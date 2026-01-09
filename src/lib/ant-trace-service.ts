import { TracedActor, Association, TraceSequence, ANTTraceResult, TraceSource } from '@/types/ant';
import { EcosystemActor } from '@/types/ecosystem';

/**
 * ANT Trace Service
 * Implements Actor-Network Theory as a METHODOLOGICAL layer
 * 
 * Key Principle: ANT is for empirical tracing, not ontological claims
 */
export class ANTTraceService {
    /**
     * Convert existing actors to traced actors with provenance metadata
     */
    static hydrateWithProvenance(
        actors: EcosystemActor[],
        source: TraceSource
    ): TracedActor[] {
        return actors.map(actor => ({
            id: actor.id,
            name: actor.name,
            type: actor.type,
            trace_source: source,
            trace_evidence: actor.quotes?.[0] || "No direct evidence available",
            provisional: source === "ai_inference",
            confidence: this.calculateConfidence(source, actor),
            metrics: actor.metrics // Preserve backward compatibility
        }));
    }

    /**
     * Calculate confidence based on trace source and actor data
     */
    private static calculateConfidence(source: TraceSource, actor: EcosystemActor): number {
        if (source === "document_extraction") {
            return actor.quotes && actor.quotes.length > 0 ? 0.9 : 0.7;
        } else if (source === "user_input") {
            return 0.85;
        } else if (source === "ai_inference") {
            return 0.6;
        } else {
            return 0.5; // simulation
        }
    }

    /**
     * Trace associations from actor network
     */
    static traceAssociations(
        actors: TracedActor[],
        links: { source: string; target: string; type: string }[]
    ): Association[] {
        return links.map(link => ({
            source: link.source,
            target: link.target,
            relation_type: link.type as Association['relation_type'],
            trace_evidence: "Inferred from network structure",
            strength: 0.7,
            provisional: true
        }));
    }

    /**
     * Generate complete ANT trace result
     */
    static generateTraceResult(
        actors: TracedActor[],
        associations: Association[],
        translationSequence?: TraceSequence
    ): ANTTraceResult {
        const metadata = {
            total_actors: actors.length,
            document_extracted: actors.filter(a => a.trace_source === "document_extraction").length,
            ai_inferred: actors.filter(a => a.trace_source === "ai_inference").length,
            user_provided: actors.filter(a => a.trace_source === "user_input").length
        };

        const provenance_summary = `Traced ${metadata.total_actors} actors: ${metadata.document_extracted} extracted from documents, ${metadata.ai_inferred} AI-inferred, ${metadata.user_provided} user-provided`;

        return {
            mode: "ant_trace",
            traced_actors: actors,
            associations,
            translation_sequence: translationSequence,
            provenance_summary,
            metadata
        };
    }

    /**
     * Add trace metadata to existing actor (for gradual migration)
     */
    static addTraceMetadata(
        actor: EcosystemActor,
        source: TraceSource,
        evidence: string
    ): EcosystemActor {
        return {
            ...actor,
            trace_metadata: {
                source,
                evidence,
                provisional: source === "ai_inference",
                confidence: this.calculateConfidence(source, actor)
            }
        };
    }
}
