import { Source, AnalysisResult } from "@/types";
import { ProvisionalWrapper } from "@/lib/provisional-wrapper";

const EU_GOVERNANCE_ANALYSIS: AnalysisResult = {
    governance_power_accountability: "Establishes a centralized, technocratic product safety regime. Power is concentrated in the European Commission's AI Office and national market surveillance authorities. Compliance is managed through ex-ante conformity assessments and industry standards (CEN/CENELEC), largely sidelining civil society from enforcement. Accountability operates upwards to regulators rather than downwards to affected communities.",
    plurality_inclusion_embodiment: "Prioritizes technical standardization and legal certainty over epistemic diversity. 'Inclusion' is framed as non-discrimination within datasets rather than the representation of diverse worldviews. The 'human in the loop' is an abstract controller, not an embodied subject, reinforcing a universalist, Western-centric view of rationality and risk.",
    agency_codesign_self_determination: "Offers limited procedural rights (complaints, explanation) but no mechanisms for co-design or community governance. 'Affected persons' are passive subjects of protection rather than active agents in shaping the systems that govern them. The right to refuse is absent, except for limited bans on 'unacceptable' risks.",
    reflexivity_situated_praxis: "Low reflexivity. The Act assumes the universal applicability of its risk categories and definitions. It treats AI as an objective tool to be made 'safe', ignoring how algorithmic systems inherently reify specific social orders and power relations (e.g., in migration or policing).",

    // Cultural Framing Fields
    state_market_society: "• The State is framed as a **technocratic market regulator** (Art. 1) whose primary goal is ensuring the smooth functioning of the internal market while mitigating safety risks.\n• Market actors are presumed to be rational entities to be constrained by compliance obligations.\n• Civil society is largely absent from the core governance loop, appearing mainly as consumers ('affected persons').",
    technology_role: "• Technology is positioned as a **product** to be certified (Conformity Assessment). \n• It is viewed as an external tool ('AI system') distinct from the social world.\n• Innovation is implicitly good but requires 'guardrails' (Recital 1).",
    rights_conception: "• Rights are framed as **negative liberties** (protection from harm/discrimination) rather than positive powers of co-creation.\n• Emphasis on 'fundamental rights' as a legal shield, not a tool for community self-determination.\n• Procedural mechanisms (complaints) replace substantive democratic oversight.",
    historical_context: "• **Ahistorical**: The Act contains no reference to colonial histories of data extraction or global inequality.\n• It universalizes European values ('human-centric AI') as global standards (Brussels Effect), erasing the situated nature of 'risk'.",
    epistemic_authority: "• Authority lies with **technical standardization bodies** (CEN/CENELEC) and the European Commission.\n• 'Risk' is defined by experts, not by communities experiencing harm.\n• Technical compliance is equated with safety.",
    cultural_distinctiveness_score: 0.2, // Universalizing
    dominant_cultural_logic: "Technocratic Market Universalism",

    governance_scores: {
        centralization: 85,
        rights_focus: 60,
        flexibility: 40,
        market_power: 95,
        procedurality: 85
    },
    structural_pillars: {
        risk: {
            title: "Pyramid of Risk",
            description: "Adopts a rigid logic of 'unacceptable' (banned) vs. 'high risk' (heavily regulated) systems. It operationalizes safety through product conformity: high-risk systems must undergo ex-ante assessment. This technocratic approach treats risk as an inherent property of the tool, minimizing the complex sociotechnical context of deployment.",
            badge: "Prescriptive",
            quote: "The AI Act sets compliance obligations based on the inherent risks that arise from the application for which AI systems are used."
        },
        enforcement: {
            title: "AI Office & National Authorities",
            description: "Centralizes significant power in the European Commission's AI Office for general-purpose AI, creating a supranational regulator. Enforcement relies on a 'market surveillance' model where national authorities police compliance documentation rather than engaging with substantive harms to communities.",
            badge: "Centralized/Hybrid",
            quote: "A European Artificial Intelligence Office is established... to monitor and supervise general-purpose AI models."
        },
        rights: {
            title: "Fundamental Rights Impact",
            description: "Grants procedural rights (explanation, complaints) but fundamentally frames the citizen as a 'data subject' or consumer. The 'Fundamental Rights Impact Assessment' is a compliance obligation for deployers, often essentially a paperwork exercise, rather than a mechanism for community empowerment or veto power.",
            badge: "Procedural",
            quote: "Affected persons have the right to lodge a complaint with a market surveillance authority... and to receive a clear and meaningful explanation."
        },
        scope: {
            title: "Brussels Effect",
            description: "Asserts extraterritorial jurisdiction over any system where the *output* is used in the EU. This aggressively exports EU values as global standards, effectively forcing non-EU developers to conform to European definitions of safety and fundamental rights to access the market.",
            badge: "Extraterritorial",
            quote: "This Regulation applies to providers... irrespective of whether they are established within the Union or in a third country."
        }
    },
    // DR3: Decision Ownership
    accountability_map: {
        signatory: "European Commission / AI Office",
        liability_holder: "Provider (Developer)",
        appeals_mechanism: "National Competent Authorities",
        human_in_the_loop: false // Automated compliance checks
    },
    // DR4: Contestability
    rebuttals: {
        "agency_collapse": {
            text: "The Act actually includes Article 14 on human oversight to prevent total agency loss, though its effectiveness is debated.",
            timestamp: "2024-05-20T10:00:00Z",
            user: "Researcher"
        }
    },
    provisional_status: ProvisionalWrapper.wrap(
        "Establishes a centralized, technocratic product safety regime...",
        "ai_generated",
        0.8 // High completeness (it's the full text)
    )
};

const BRAZIL_GOVERNANCE_ANALYSIS: AnalysisResult = {
    governance_power_accountability: "Proposes a 'networked' governance model where a central coordinating authority articulates with existing sectoral regulators. Unlike the EU's product safety focus, it emphasizes civil liability and reversal of the burden of proof, empowering the judiciary as a key accountability node. Power is thus more distributed, though implementation capacity remains a challenge.",
    plurality_inclusion_embodiment: "Explicitly acknowledges 'social stratification' and structural discrimination. The framework is more sensitive to the collective dimensions of harm, reflecting Brazil's context of deep inequality. It attempts to include 'affected groups' in the definitions, though the mechanisms for their substantive participation in oversight are still being contested.",
    agency_codesign_self_determination: "Centers the 'centrality of the human person'. Provides robust rights to contestation, human review, and explanation that go beyond the EU's proceduralism. It creates a stronger basis for 'due process' in algorithmic decision-making, giving individuals tools to challenge automated authority directly.",
    reflexivity_situated_praxis: "Moderate reflexivity. While it imports many European concepts (risk tiers), it adapts them to the Latin American legal tradition of strong consumer protection and collective rights. It shows awareness of the asymmetry between developers and subjects, attempting to level the playing field through strict liability.",

    // Cultural Framing Fields
    state_market_society: "• The State is framed as a **protective guardian** and 'orchestrator' of sectoral regulators.\n• Acknowledges 'social stratification' and structural vulnerability (Art. 3).\n• Society is viewed as a collective body needing defense against 'excessive risk'.",
    technology_role: "• Technology is positioned as a **source of potential asymmetry** and discrimination.\n• 'Centrality of the human person' (Art. 2) positions AI as subordinate to human dignity, not just a market product.\n• Focus on 'social impact' over pure technical safety.",
    rights_conception: "• **Rights-based & Collective**: Explicit focus on non-discrimination and the 'right to explanation' as tools for contestation.\n• Includes 'affected groups' (collectives) not just individuals.\n• Reverses burden of proof, empowering the vulnerable over the powerful.",
    historical_context: "• **Implicitly Situated**: Reflects Brazil's history of consumer defense and resistance to corporate overreach.\n• 'National sovereignty' over data is a key theme, resisting digital colonialism implicitly.\n• Adapts global norms to local inequality contexts.",
    epistemic_authority: "• Authority is distributed between the **Judiciary** (redress) and the **Special Authority**.\n• Lived experience of discrimination is given legal weight via the reversal of burden of proof.\n• Epistemic focus on 'impact' rather than just 'compliance'.",
    cultural_distinctiveness_score: 0.7, // Distinctive Hybrid
    dominant_cultural_logic: "Rights-Centric Developmental Sovereignty",

    governance_scores: {
        centralization: 45,
        rights_focus: 90,
        flexibility: 80,
        market_power: 50,
        procedurality: 55
    },
    structural_pillars: {
        risk: {
            title: "Risk Categories",
            description: "Follows a similar tiered structure but with significantly broader definitions of 'high risk', including practically all systems affecting legal rights. It emphasizes 'excessive risk' based on discriminative impact rather than just technical flaws, allowing for a more dynamic, rights-centric interpretation of danger.",
            badge: "Principled",
            quote: "The assessment of risk level shall consider... the potential for discriminatory results and the impact on the exercise of fundamental rights."
        },
        enforcement: {
            title: "Competent Authority",
            description: "Establishes a 'networked' governance model. A central authority coordinates with existing sectoral regulators (e.g., finance, health), aiming to embed AI oversight into specific domains. This 'orchestrator' model seeks to avoid a monolithic regulator but faces challenges in state capacity and coordination.",
            badge: "Networked",
            quote: "The competent authority shall coordinate with sectoral regulatory agencies... to ensure the uniform application of this Law."
        },
        rights: {
            title: "Rights of Affected Persons",
            description: "Codifies a robust catalogue of rights, including the right to contestation, human intervention, and non-discrimination. It explicitly shifts the burden of proof to the deployer, empowering individuals to challenge algorithmic decisions in court. This represents a stronger 'due process' model for AI.",
            badge: "Rights-Based",
            quote: "Persons affected by AI systems have the right to contest decisions... and to request human intervention."
        },
        scope: {
            title: "National Sovereignty",
            description: "Focuses on the protection of people located in the national territory. While it mirrors GDPR-style extraterritoriality for data processing, the AI bill emphasizes the defense of the 'national technology market' and the rights of Brazilian citizens against foreign tech hegemony.",
            badge: "Territorial",
            quote: "This Law applies to... systems developed, used or whose outcomes are produced in the national territory."
        }
    },
    // DR3: Decision Ownership
    accountability_map: {
        signatory: "Federal Government (Exec)",
        liability_holder: "Strict Liability for High Risk",
        appeals_mechanism: "Judiciary & Consumer Defense Code",
        human_in_the_loop: true // "Centrality of the Human Person"
    }
};

export const EU_BASELINE: Source = {
    id: "EU",
    title: "EU AI Act",
    description: "A product safety framework focused on market regulation and risk mitigation.",
    type: "Text",
    extractedText: "FULL TEXT OF EU AI ACT [Placeholder for Re-run Capability]",
    jurisdiction: "EU",
    addedDate: "2024-01-01",
    status: "Active Case",
    colorClass: "blue",
    iconClass: "shield",
    analysis: EU_GOVERNANCE_ANALYSIS,
    cultural_framing: EU_GOVERNANCE_ANALYSIS,
    institutional_logics: EU_GOVERNANCE_ANALYSIS
};

export const BRAZIL_BASELINE: Source = {
    id: "Brazil",
    title: "Brazil PL 2338",
    description: "A rights-based framework emphasizing civil liability and redress for affected individuals.",
    type: "Text",
    extractedText: "FULL TEXT OF BRAZIL PL 2338 [Placeholder for Re-run Capability]",
    jurisdiction: "Brazil",
    addedDate: "2024-01-01",
    status: "Active Case",
    colorClass: "yellow",
    iconClass: "scale",
    analysis: BRAZIL_GOVERNANCE_ANALYSIS
};

export const BASELINE_SOURCES = [EU_BASELINE, BRAZIL_BASELINE];
