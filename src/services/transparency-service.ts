/**
 * Transparency Service
 * 
 * Provides algorithmic transparency metadata for analysis outputs.
 * Documents scoring formulas, theoretical foundations, and design decisions.
 */

export interface TransparencyMetadata {
    metric_name: string;
    formula: {
        description: string;
        mathematical_notation: string;
        variables: Record<string, string>;
    };
    theoretical_basis: {
        framework: string;
        key_concepts: string[];
        citations: string[];
    };
    calculation_provenance: {
        evidence_excerpts: Array<{
            text: string;
            contribution: string;
            weight: number;
        }>;
        confidence_level: 'high' | 'medium' | 'low';
        caveats: string[];
    };
    design_rationale: {
        why_this_approach: string;
        alternatives_considered: string[];
        known_limitations: string[];
        designer_positionality: string;
    };
    version: string;
    last_updated: string;
}

export class TransparencyService {
    /**
     * Get transparency metadata for Epistemic Asymmetry Score
     */
    static getEpistemicAsymmetryTransparency(): TransparencyMetadata {
        return {
            metric_name: "Epistemic Asymmetry Score",
            formula: {
                description: "Measures the imbalance in whose knowledge is recognized as legitimate versus whose is marginalized or excluded",
                mathematical_notation: "EA = (Σ marginalized_knowledge_claims / Σ total_knowledge_claims) × asymmetry_weight",
                variables: {
                    "marginalized_knowledge_claims": "Number of knowledge claims from non-dominant epistemic positions",
                    "total_knowledge_claims": "Total number of knowledge claims in the document",
                    "asymmetry_weight": "Severity multiplier based on structural exclusion patterns (0-1)"
                }
            },
            theoretical_basis: {
                framework: "Decolonial Theory & Standpoint Epistemology",
                key_concepts: [
                    "Epistemic violence (Spivak)",
                    "Coloniality of knowledge (Mignolo)",
                    "Standpoint theory (Harding)",
                    "Situated knowledges (Haraway)"
                ],
                citations: [
                    "Spivak, G. C. (1988). Can the Subaltern Speak?",
                    "Mignolo, W. (2009). Epistemic Disobedience",
                    "Harding, S. (1991). Whose Science? Whose Knowledge?"
                ]
            },
            calculation_provenance: {
                evidence_excerpts: [],
                confidence_level: 'medium',
                caveats: [
                    "LLM may not recognize all forms of marginalized knowledge",
                    "Score depends on LLM's training data biases",
                    "Cannot capture tacit or embodied knowledge",
                    "Western academic framing may limit recognition of non-Western epistemologies"
                ]
            },
            design_rationale: {
                why_this_approach: "Quantifying epistemic asymmetry makes invisible power dynamics visible and comparable across documents. The metric foregrounds whose knowledge is systematically excluded.",
                alternatives_considered: [
                    "Binary classification (asymmetric vs. symmetric) - rejected as too reductive",
                    "Qualitative description only - rejected as harder to compare across documents",
                    "Citation network analysis - rejected as requiring external data"
                ],
                known_limitations: [
                    "Reduces complex epistemic dynamics to a single number",
                    "May reify categories of 'dominant' vs. 'marginalized' knowledge",
                    "Depends on LLM's ability to recognize epistemic positions",
                    "Does not capture intersectional dimensions of epistemic marginalization"
                ],
                designer_positionality: "Created by researchers positioned in Western academia, attempting to operationalize decolonial critique while acknowledging the contradiction of using AI tools trained on colonial knowledge archives"
            },
            version: "1.0",
            last_updated: "2026-02-05"
        };
    }

    /**
     * Get transparency metadata for Power Concentration Index
     */
    static getPowerConcentrationTransparency(): TransparencyMetadata {
        return {
            metric_name: "Power Concentration Index",
            formula: {
                description: "Measures how power is distributed across actors in the assemblage",
                mathematical_notation: "PCI = 1 - (Σ(pi²) where pi = power share of actor i)",
                variables: {
                    "pi": "Proportion of total power held by actor i",
                    "n": "Number of actors in the assemblage"
                }
            },
            theoretical_basis: {
                framework: "Assemblage Theory & Network Power Analysis",
                key_concepts: [
                    "Assemblage (Deleuze & Guattari)",
                    "Network centrality (Freeman)",
                    "Structural power (Strange)",
                    "Distributed agency (Latour)"
                ],
                citations: [
                    "Deleuze, G., & Guattari, F. (1987). A Thousand Plateaus",
                    "Freeman, L. C. (1978). Centrality in social networks",
                    "Latour, B. (2005). Reassembling the Social"
                ]
            },
            calculation_provenance: {
                evidence_excerpts: [],
                confidence_level: 'medium',
                caveats: [
                    "Assumes power can be quantified and aggregated",
                    "May miss informal or invisible power relations",
                    "Depends on LLM's interpretation of 'power'",
                    "Static snapshot - doesn't capture power dynamics over time"
                ]
            },
            design_rationale: {
                why_this_approach: "Adapted from economic concentration indices (Herfindahl-Hirschman) to make power distribution patterns visible and comparable",
                alternatives_considered: [
                    "Gini coefficient - rejected as less interpretable for power",
                    "Simple actor count - rejected as ignoring power differentials",
                    "Qualitative categorization - rejected as harder to compare"
                ],
                known_limitations: [
                    "Treats power as a quantifiable resource rather than a relation",
                    "May obscure qualitative differences in types of power",
                    "Assumes actors are discrete entities (problematic for assemblage theory)",
                    "Cannot capture potential or latent power"
                ],
                designer_positionality: "Designed by researchers trained in critical theory but working within quantitative social science traditions, attempting to bridge interpretive and computational approaches"
            },
            version: "1.0",
            last_updated: "2026-02-05"
        };
    }

    /**
     * Get transparency metadata for all metrics
     */
    static getAllTransparencyMetadata(): Record<string, TransparencyMetadata> {
        return {
            epistemic_asymmetry: this.getEpistemicAsymmetryTransparency(),
            power_concentration: this.getPowerConcentrationTransparency()
            // Add more metrics as they are documented
        };
    }

    /**
     * Generate transparency documentation for a specific analysis result
     */
    static generateTransparencyReport(analysisResult: any): {
        metrics: Record<string, TransparencyMetadata>;
        overall_caveats: string[];
        design_decisions: string[];
    } {
        const metrics = this.getAllTransparencyMetadata();

        return {
            metrics,
            overall_caveats: [
                "All scores are generated by an LLM and should be treated as interpretive provocations, not objective measurements",
                "The tool's design choices (lenses, prompts, metrics) reflect the designers' theoretical commitments and positionality",
                "Affected communities appear as objects of analysis, not as governors of the analytic infrastructure",
                "No external oversight mechanism exists to audit the tool's own biases and harms",
                "Responsibility is framed primarily as researcher reflexivity rather than enforceable obligations on tool creators"
            ],
            design_decisions: [
                "Theoretical lenses (decolonial, labor, accountability) were chosen by platform designers based on critical theory traditions",
                "Prompt templates structure how the LLM can problematize governance, pre-determining the interpretive frame",
                "Scoring algorithms translate complex social dynamics into quantifiable metrics, enabling comparison but risking reductionism",
                "Visualization choices (network graphs, heat maps) privilege certain ways of seeing power over others",
                "The tool centralizes interpretive agenda-setting in the hands of those who control its design"
            ]
        };
    }
}
