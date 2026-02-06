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
                framework: "Assemblage Theory & Mixed-Methods Power Analysis",
                key_concepts: [
                    "Assemblage (Deleuze & Guattari)",
                    "Network centrality (Freeman)",
                    "Structural power (Susan Strange)",
                    "Knowledge structure control",
                    "Relational/Productive power (Foucault)",
                    "Distributed agency (Latour)"
                ],
                citations: [
                    "Deleuze, G., & Guattari, F. (1987). A Thousand Plateaus",
                    "Freeman, L. C. (1978). Centrality in social networks",
                    "Strange, S. (1988). States and Markets. Pinter Publishers.",
                    "Latour, B. (2005). Reassembling the Social"
                ]
            },
            calculation_provenance: {
                evidence_excerpts: [],
                confidence_level: 'medium',
                caveats: [
                    "Quantification risks reifying fluid relational processes into static metrics; treated here as a heuristic proxy.",
                    "Informal or 'invisible' power relations (norms, hegemons) may be under-represented in explicit network ties.",
                    "Metric provides a 'static snapshot' and may miss longitudinal shifts in assemblage dynamics.",
                    "LLM's interpretation of 'power' varies; ensemble prompting used to mitigate individual model bias."
                ]
            },
            design_rationale: {
                why_this_approach: "Hybridizes Critical Theory with Computational Social Science. We use a modified Herfindahl-Hirschman Index (HHI) adapted for network intensity rather than market share, following Strange's 'ability to shape frameworks'.",
                alternatives_considered: [
                    "Full ANT Tracing - rejected as computationally prohibitive for real-time analysis",
                    "Gini coefficient - rejected as less sensitive to top-heavy network concentration",
                    "Simple actor count - rejected as ignoring the 'mundane structural power' of dominant nodes"
                ],
                known_limitations: [
                    "Assumes power can be meaningfully aggregated through digital surrogates",
                    "Sensitivity to LLM's ontology of what constitutes a 'Decision' or 'Resource'",
                    "Cannot natively capture 'latent' or 'potential' power without temporal sequence data"
                ],
                designer_positionality: "Bridging Critical Theory's skepticism of quantification with the need for operational tools. We acknowledge the 'reductive violence' of the metric and center reflexive bridging in the v2.0 kernel."
            },
            version: "2.0",
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
                "Metric Kernel v2.0 treats quantification as a strategic heuristic; scores are interpretive provocations, not objective measurements.",
                "The tool's design choices attempt to bridge Critical Theory with Computational Science, reflecting the designers' specific 'bridging' positionality.",
                "Affected communities currently appear as objects of analysis; v2.0 acknowledges this gap but does not yet resolve it through direct participatory governance.",
                "Informal power dynamics and tacit knowledge systems are under-represented relative to explicit digital corpora.",
                "Responsibility is framed through researcher reflexivity rather than enforceable legal or social obligations on the tool's architect."
            ],
            design_decisions: [
                "Theoretical frameworks (Strange, Deleuze, Spivak) were prioritized to foreground power dynamics over neutral technical efficiency.",
                "HHI and Centrality measures are normalized for relational intensity, aiming for a processual rather than purely static view of power.",
                "Prompt templates explicitly instruct the LLM to 'problematize' governance rather than simply summarizing it.",
                "Visualization choices (Sankey, Compass, Network) are designed to make structural asymmetries visible, potentially biasing toward conflict-aware interpretations.",
                "Positionality disclosures are integrated into the core kernel to prevent the projection of a 'view from nowhere' in the analysis."
            ]
        };
    }
}
