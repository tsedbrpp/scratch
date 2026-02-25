import { z } from 'zod';

// ===================================================================
// GNDP v1.0 — Zod Schemas (all new fields optional, versioned)
// ===================================================================

// --- Shared Enums ---

export const DiscourseTaxonomySchema = z.enum([
    'market efficiency',
    'economic competitiveness',
    'national security',
    'environmental sustainability',
    'social equity',
    'technical expertise',
    'bureaucratic standardization',
    'innovation / flexibility',
    'fiscal responsibility',
    'democratic participation',
    'data protection / privacy',
    'human rights',
    'geopolitical sovereignty',
    'precautionary principle / risk aversion'
]).or(z.string());

const GhostTypologySchema = z.enum(['Structural', 'Data', 'Representational', 'Scale', 'Temporal', 'SupplyChain']);
const EvidenceGradeSchema = z.enum(['E1', 'E2', 'E3', 'E4']);
const MaterialImpactSchema = z.enum(['Low', 'Medium', 'High']);
const OppAccessSchema = z.enum(['None', 'Advisory', 'Partial', 'Binding']);
const SanctionPowerSchema = z.enum(['None', 'Indirect', 'Direct']);
const DataVisibilitySchema = z.enum(['Invisible', 'Partial', 'Audited']);
const RepresentationTypeSchema = z.enum(['None', 'Proxy', 'Collective', 'Direct']);
const CounterfactualImpactSchema = z.enum(['None', 'Moderate', 'Transformative']);

const ScoreBreakdownSchema = z.object({
    materialImpact: z.number().min(0).max(30).nullable(),
    oppExclusion: z.number().min(0).max(25).nullable(),
    sanctionAbsence: z.number().min(0).max(20).nullable(),
    dataInvisibility: z.number().min(0).max(15).nullable(),
    representationGap: z.number().min(0).max(10).nullable(),
});

// --- Pass 1A: Extraction-Only Schema ---

export const GhostNodesPass1ASchema = z.object({
    schemaVersion: z.literal('GNDP-1.0').optional(),
    formalActors: z.array(z.object({
        name: z.string(),
        role: z.string(),
        hierarchyLevel: z.enum(['Individual', 'Organizational', 'Institutional']).optional(),
        sourceRef: z.string().optional(),
    })).max(30),
    affectedClaims: z.array(z.object({
        claim: z.string(),
        supportQuote: z.string(),
        impliedActors: z.array(z.string()).max(5),
    })).max(30),
    obligatoryPassagePoints: z.array(z.object({
        name: z.string(),
        type: z.enum(['risk_classification', 'conformity_assessment', 'deployment_approval', 'procurement', 'enforcement', 'audit', 'other']),
        controllingActor: z.string().optional(),
    })).max(10),
});

// --- Pass 1B: Candidate Synthesis Schema ---

export const GhostNodesPass1BSchema = z.object({
    schemaVersion: z.literal('GNDP-1.0').optional(),
    candidates: z.array(z.object({
        name: z.string(),
        reason: z.string(), // max 160 chars in prompt
        materialImpact: MaterialImpactSchema,
        oppAccess: OppAccessSchema,
        sanctionPower: SanctionPowerSchema,
        dataVisibility: DataVisibilitySchema,
        representationType: RepresentationTypeSchema,
        preliminaryAbsenceStrength: z.enum(['Low', 'Medium', 'High']),
        keywords: z.array(z.string()).max(5),
        evidencePackets: z.array(z.object({
            quote: z.string(),
            locationMarker: z.string(),
        })).optional(),
    })).max(10),
});

// ===================================================================
// Legacy Schemas (backward compatibility for cached results)
// ===================================================================

export const GhostNodesPass1Schema = z.object({
    dominantDiscourses: z.array(z.object({
        label: DiscourseTaxonomySchema,
        strength: z.number().min(0).max(1),
        evidenceQuote: z.string(),
        isOther: z.boolean().optional(),
        otherLabel: z.string().optional(),
        whyNotInTaxonomy: z.string().optional(),
        closestTaxonomyCandidate: z.string().optional()
    })),
    ghostNodeCandidates: z.array(z.object({
        name: z.string(),
        reason: z.string(),
        absenceStrengthPrelim: z.enum(["High", "Medium", "Low"]),
        evidencePackets: z.array(z.object({
            quote: z.string(),
            locationMarker: z.string()
        })).optional(),
        keywords: z.array(z.string())
    })).optional().default([])
});

// --- Enhanced Pass 2 Schema (GNDP v1.0) ---

export const GhostNodesPass2Schema = z.object({
    schemaVersion: z.literal('GNDP-1.0').optional(),
    ghostNodes: z.array(z.object({
        isValid: z.boolean(),
        tier: z.enum(["Tier1", "Tier2", "Tier3"]).optional(),
        id: z.string(),
        label: z.string(),
        category: z.string().optional(),
        ghostReason: z.string(),
        absenceStrength: z.number().optional(),
        evidenceQuotes: z.array(z.object({
            quote: z.string(),
            context: z.string().optional()
        })).optional().default([]),
        claim: z.string().optional(),
        discourseThreats: z.array(z.string()).optional(),
        missingSignals: z.array(z.object({
            signal: z.string(),
            searchTerms: z.array(z.string())
        })).optional(),
        roster: z.object({
            actors: z.array(z.string()),
            mechanisms: z.array(z.string())
        }).optional(),
        absenceType: z.string().optional(),
        exclusionType: z.string().optional(),
        institutionalLogics: z.object({
            market: z.number(),
            state: z.number(),
            professional: z.number(),
            community: z.number()
        }).optional(),
        // GNDP v1.0 extensions (all optional)
        ghostType: GhostTypologySchema.nullable().optional(),
        evidenceGrade: EvidenceGradeSchema.optional(),
        absenceScore: z.number().min(0).max(100).nullable().optional(),
        scoreBreakdown: ScoreBreakdownSchema.optional(),
    }))
});

// --- Pass 3: Counterfactual Schema (v3 — Role Semantics + Typed Chains) ---

const ConfidenceLevelSchema = z.enum(['Low', 'Medium', 'High']);
const OppTypeSchema = z.enum([
    'conformity_assessment', 'deployment_approval', 'audit',
    'enforcement', 'procurement', 'reporting', 'other'
]);

// v3 enums — constrain role semantics and chain types
const ObligatedActorTypeSchema = z.enum([
    'Authority', 'Provider', 'Deployer', 'Auditor', 'StandardSetter', 'MultiActor'
]);
const ObligationTypeSchema = z.enum([
    'OpenReview', 'Investigate', 'RespondPublicly', 'NotifyAffected',
    'RequireMitigationPlan', 'OrderCorrectiveAction', 'EscalateEnforcement',
    'Suspend', 'WithdrawRecall'
]);
const EnforcementStepSchema = z.enum([
    'CorrectiveAction', 'DisclosureOrder', 'AuditOrder', 'Fine',
    'Suspension', 'WithdrawalRecall'
]);
const MechanismStepKindSchema = z.enum([
    'EvidenceCollection', 'Aggregation', 'Admissibility', 'ReviewInitiation',
    'Notice', 'ResponseDueProcess', 'RemedyEnforcement', 'Deterrence'
]);
const GuidanceBindingnessSchema = z.enum(['Nonbinding', 'QuasiBinding', 'Binding', 'Unknown']);
const AnalyticalChallengeKindSchema = z.enum([
    'StrategicGaming', 'CaptureRisk', 'CapacityBacklog', 'UnintendedConsequence', 'ScopeCreep', 'Other'
]);

export const GhostNodesPass3Schema = z.object({
    schemaVersion: z.literal('GNDP-1.0').optional(),
    counterfactuals: z.array(z.object({
        actorId: z.string(),
        // 1) Chokepoint — role semantics
        chokepoint: z.object({
            oppName: z.string(),
            oppType: OppTypeSchema,
            // v3 role semantics
            standingActor: z.string().optional(),
            obligatedActor: z.string().optional(),
            obligatedActorType: ObligatedActorTypeSchema.optional(),
            obligationType: ObligationTypeSchema.optional(),
            // v2 backward compat
            bindingDuty: z.string().optional(),
        }),
        // 2) Full conditional scenario statement
        scenario: z.string(),
        // 3) Impact with enforcement ladder
        estimatedImpact: z.object({
            level: CounterfactualImpactSchema,
            qualifier: z.string(),
            enforcementLadder: z.array(z.object({
                step: EnforcementStepSchema,
                note: z.string().max(160).optional(),
            })).max(6).optional(),
            guidanceBindingness: GuidanceBindingnessSchema.optional(),
        }),
        // 4) Typed causal mechanism chain (ordered steps)
        mechanismChain: z.union([
            // v3: typed steps
            z.array(z.object({
                kind: MechanismStepKindSchema,
                step: z.string().max(220),
            })).min(3).max(8),
            // v2 backward compat: plain strings
            z.array(z.string()).min(2).max(6),
        ]),
        // 5) Mechanistic beneficiary claims
        beneficiaryMechanisms: z.array(z.object({
            actor: z.string(),
            mechanism: z.string(),
        })).max(5),
        // 6) Shielded actors with mechanisms
        shieldedActors: z.array(z.object({
            actor: z.string(),
            mechanism: z.string(),
        })).max(5).optional(),
        // 7) Confidence assessment (v3: grounded/inferred/unknown)
        confidence: z.object({
            evidenceBase: ConfidenceLevelSchema,
            speculativeConfidence: ConfidenceLevelSchema,
            caveat: z.string(),
            grounded: z.string().max(240).optional(),
            inferred: z.string().max(240).optional(),
            unknown: z.string().max(240).optional(),
            assumptions: z.array(z.string().max(140)).max(4).optional(),
        }),
        // 8) Analytical challenges (downsides)
        analyticalChallenges: z.array(z.object({
            kind: AnalyticalChallengeKindSchema,
            description: z.string().max(200),
        })).max(4).optional(),
        // Backward compat (v1/v2 legacy)
        reasoning: z.string().optional(),
        counterfactualImpact: CounterfactualImpactSchema.optional(),
        territorialization: z.object({
            destabilizesPower: z.boolean(),
            introducesAccountability: z.boolean(),
            reconfiguresData: z.boolean(),
            altersEnforcement: z.boolean(),
        }).optional(),
        riskRedistribution: z.object({
            beneficiariesOfAbsence: z.array(z.string()).max(5),
            shieldedActors: z.array(z.string()).max(5),
            reducesCoalitionFriction: z.boolean(),
        }).optional(),
    })).max(6),
});

