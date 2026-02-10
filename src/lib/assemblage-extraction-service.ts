import OpenAI from 'openai';
import { executeGoogleSearch } from '@/lib/search-service';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { EcosystemActor, EcosystemEdge } from '@/types/ecosystem';
import { v4 as uuidv4 } from 'uuid';

export class AssemblageExtractionService {
    /**
     * Discovers actors by searching the web for a topic, aggregating results, 
     * and then performing extraction on the aggregated text.
     */
    static async discoverActorsFromTopic(
        query: string,
        openai: OpenAI
    ): Promise<{ actors: EcosystemActor[]; edges: EcosystemEdge[]; summary: string }> {
        console.log(`[DISCOVERY] Searching for: ${query}`);

        // 1. Execute Search
        const apiKey = process.env.GOOGLE_SEARCH_API_KEY || '';
        const cx = process.env.GOOGLE_SEARCH_CX || '';

        if (!apiKey || !cx) {
            throw new Error("Missing Google Search Configuration (API Key or CX)");
        }

        const searchResults = await executeGoogleSearch(query, apiKey, cx, 10);

        if (searchResults.length === 0) {
            console.warn("[DISCOVERY] No search results found.");
            return { actors: [], edges: [], summary: "No search results found for this topic." };
        }

        // 2. Aggregate Text from Snippets (and potentially fetch content if we had a scraper)
        // For now, we rely on rich snippets.
        const aggregatedText = searchResults
            .map(r => `Source: ${r.title}\nSnippet: ${r.snippet}`)
            .join("\n\n");

        console.log(`[DISCOVERY] Aggregated ${aggregatedText.length} chars of context.`);

        // 3. Extract Assembly
        return this.extractAssemblageFromText(aggregatedText, openai, `Search Results for "${query}"`);
    }

    /**
     * Extracts actors and relationships from raw text using ANT principles.
     */
    static async extractAssemblageFromText(
        text: string,
        openai: OpenAI,
        sourceLabel: string = "User Input"
    ): Promise<{ actors: EcosystemActor[]; edges: EcosystemEdge[]; summary: string }> {
        const prompt = `
        Analyze the following text from an Actor-Network Theory (ANT) perspective.
        
        Goal: Identify the "Assemblage" of actors (human, non-human, institutional, technological) and their relationships.
        
        Rules:
        1. Actors: Identify specific entities.
           - Type: PrivateTech, Policymaker, Civil Society, Academic, Infrastructure, Algorithm, Dataset, LegalObject, or Controversy.
           - Controversy: Mark "Hot Spots" or "Matters of Concern" where consensus is breaking down as type="Controversy".
           - Ontology: Is this actor an "individual", "collective" (group), or "punctualized" (complex network acting as one)?

        2. Relationships (Edges):
           - Nature:
             * "Intermediary": Transports force/meaning without changing it (predictable, passive).
             * "Mediator": Transforms, distorts, modifies, or creates what it carries (unpredictable, active work).
           - Transformation Type: "amplify", "translate", "block", "modify", "create", "dissolve".
           - Confidence: 0.0 - 1.0 (How certain is this link?).
           - Evidence: Short quote supporting this classification.

        3. Metrics (1-10):
           - Territorialization: Stability, authority.
           - Deterritorialization: Fluidity, resistance.
           - Coding: Rigidity of identity.

        Output structured JSON:
        {
            "summary": "Brief executive summary (max 2 sentences)",
            "actors": [
                {
                    "name": "Entity Name",
                    "type": "See list above",
                    "ontologicalStatus": "individual" | "collective" | "punctualized",
                    "description": "Role",
                    "evidence_quotes": ["Quote"],
                    "metrics": { "territorialization": 5, "deterritorialization": 5, "coding": 5 }
                }
            ],
            "relationships": [
                {
                    "source": "Actor A",
                    "target": "Actor B",
                    "type": "verb (e.g. regulates, distorts)",
                    "nature": "intermediary" | "mediator",
                    "transformationType": "amplify" | "translate" | "block" | "modify" | "create" | "dissolve",
                    "confidence": 0.9,
                    "evidence": ["Quote relating to the work of mediation"],
                    "description": "Context"
                }
            ]
        }

        Text Context: ${sourceLabel}
        Text Content:
        ${text.substring(0, 15000)}
        `;

        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_API_MODEL || "gpt-4o",
            messages: [
                { role: "system", content: "You are an expert socio-technical analyst using Actor-Network Theory." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2 // Low temperature for factual extraction
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No extracted content from AI");


        const result = JSON.parse(content) as any;

        // Map to internal types
        const actors: EcosystemActor[] = (result.actors || []).map((a: any) => ({
            id: uuidv4(),
            name: a.name,
            type: this.validateType(a.type),
            description: a.description || "Extracted entity",
            influence: "Medium", // Inference placeholder
            source: "absence_fill", // Mark as AI generated/filled
            metrics: {
                territorialization: a.metrics?.territorialization || 5,
                deterritorialization: a.metrics?.deterritorialization || 5,
                coding: a.metrics?.coding || 5,
                territoriality: a.metrics?.territorialization || 5, // Backward compat
                counter_conduct: a.metrics?.deterritorialization || 5 // Backward compat
            },
            quotes: a.evidence_quotes || [],
            trace_metadata: {
                source: "ai_inference",
                evidence: (a.evidence_quotes && a.evidence_quotes[0]) || sourceLabel,
                provisional: true,
                confidence: 0.8
            },
            reflexive_log: [
                {
                    id: uuidv4(),
                    timestamp: Date.now(),
                    action_type: "Manual_Inscription",
                    rationale: `Actor extracted from source text (${sourceLabel})`,
                    user_id: "system"
                }
            ]
        }));

        const edges: EcosystemEdge[] = (result.relationships || []).map((r: any) => {
            // Find IDs for names with Fuzzy Matching
            const normalize = (s: string) => s.toLowerCase().trim();
            const findActor = (name: string) => {
                const n = normalize(name);
                return actors.find(a => normalize(a.name) === n) ||
                    actors.find(a => normalize(a.name).includes(n) || n.includes(normalize(a.name)));
            };


            const sourceActor = findActor(r.source);

            const targetActor = findActor(r.target);

            if (sourceActor && targetActor) {
                return {
                    source: sourceActor.id,
                    target: targetActor.id,
                    type: r.type || "relates_to",
                    description: r.description || "AI inferred connection",

                    // [NEW] ANT Properties
                    nature: r.nature || "intermediary",
                    transformationType: r.transformationType,
                    confidence: r.confidence || 0.8,
                    evidence: r.evidence ? (Array.isArray(r.evidence) ? r.evidence : [r.evidence]) : [],
                };
            }
            return null;
        }).filter((e: EcosystemEdge | null): e is EcosystemEdge => e !== null);

        return {
            actors,
            edges,
            summary: result.summary || "Extraction complete."
        };
    }


    private static validateType(type: string): any {
        const validTypes = ["PrivateTech", "Policymaker", "Civil Society", "Academic", "Infrastructure", "Algorithm", "Dataset", "AlgorithmicAgent", "LegalObject", "Controversy", "NonHuman"];
        const match = validTypes.find(t => t.toLowerCase() === type.toLowerCase());
        return match || "Infrastructure"; // Default fallback
    }
}
