// ===================================================================
// GNDP v1.0 — Deterministic Test Harness
// Tests schema parsing, evidence grade gating, and candidate merging
// Uses golden mock responses — no LLM calls
// ===================================================================

/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';
import {
    GhostNodesPass1ASchema,
    GhostNodesPass1BSchema,
    GhostNodesPass2Schema,
    GhostNodesPass3Schema,
} from '../schemas';

// ===================================================================
// FIXTURES — Golden LLM Responses
// ===================================================================

const GOLDEN_PASS_1A = {
    schemaVersion: "GNDP-1.0" as const,
    formalActors: [
        { name: "European Commission", role: "Regulatory authority", hierarchyLevel: "Institutional" as const },
        { name: "Providers", role: "AI system developers and deployers", hierarchyLevel: "Organizational" as const },
        { name: "Notified Bodies", role: "Conformity assessment bodies", hierarchyLevel: "Organizational" as const },
        { name: "National Supervisory Authorities", role: "Enforcement at member-state level", hierarchyLevel: "Institutional" as const },
    ],
    affectedClaims: [
        { claim: "Systems used for hiring affect job applicants", supportQuote: "AI systems used in employment, workers management...", impliedActors: ["Job Applicants", "Workers", "Gig Workers"] },
        { claim: "Biometric identification affects citizens in public spaces", supportQuote: "real-time remote biometric identification systems...", impliedActors: ["Citizens", "Migrants", "Protesters"] },
        { claim: "Credit scoring systems affect consumers and borrowers", supportQuote: "AI systems to evaluate creditworthiness...", impliedActors: ["Consumers", "Low-Income Borrowers"] },
    ],
    obligatoryPassagePoints: [
        { name: "Risk Classification", type: "risk_classification" as const, controllingActor: "European Commission" },
        { name: "Conformity Assessment", type: "conformity_assessment" as const, controllingActor: "Notified Bodies" },
        { name: "Market Surveillance", type: "enforcement" as const, controllingActor: "National Supervisory Authorities" },
    ],
};

const GOLDEN_PASS_1B = {
    schemaVersion: "GNDP-1.0" as const,
    candidates: [
        {
            name: "Gig Workers",
            reason: "Affected by algorithmic management systems but excluded from formal worker protections",
            materialImpact: "High" as const,
            oppAccess: "None" as const,
            sanctionPower: "None" as const,
            dataVisibility: "Invisible" as const,
            representationType: "None" as const,
            preliminaryAbsenceStrength: "High" as const,
            keywords: ["gig", "platform", "algorithmic management", "worker"],
        },
        {
            name: "Environmental Groups",
            reason: "AI compute energy impacts not addressed in governance framework",
            materialImpact: "Medium" as const,
            oppAccess: "Advisory" as const,
            sanctionPower: "Indirect" as const,
            dataVisibility: "Partial" as const,
            representationType: "Proxy" as const,
            preliminaryAbsenceStrength: "Low" as const,
            keywords: ["energy", "environment", "compute", "sustainability"],
        },
    ],
};

const GOLDEN_PASS_2 = {
    schemaVersion: "GNDP-1.0" as const,
    ghostNodes: [
        {
            isValid: true,
            tier: "Tier1" as const,
            id: "Gig-Workers",
            label: "Gig Workers",
            category: "Actor",
            ghostReason: "Excluded from worker protections by definitional scope limiting 'workers' to employment relationships",
            absenceStrength: 78,
            evidenceQuotes: [
                { quote: "AI systems used in employment, workers management", context: "Defines scope of worker protection to formal employment only" },
                { quote: "natural persons acting in their professional capacity", context: "Excludes non-traditional work arrangements" },
            ],
            claim: "Gig workers are structurally excluded from AI governance protections",
            discourseThreats: ["Would require expanding worker definitions"],
            missingSignals: [{ signal: "Platform worker protections", searchTerms: ["platform", "gig", "independent contractor"] }],
            absenceType: "Methodological",
            exclusionType: "Structural",
            institutionalLogics: { market: 0.8, state: 0.3, professional: 0.1, community: 0.0 },
            ghostType: "Structural" as const,
            evidenceGrade: "E4" as const,
            absenceScore: 78,
            scoreBreakdown: { materialImpact: 25, oppExclusion: 22, sanctionAbsence: 18, dataInvisibility: 8, representationGap: 5 },
        },
        {
            isValid: false,
            tier: "Tier3" as const,
            id: "Environmental-Groups",
            label: "Environmental Groups",
            category: "Actor",
            ghostReason: "Weak evidence of exclusion — energy impacts mentioned but not central",
            absenceStrength: 22,
            evidenceQuotes: [{ quote: "energy efficiency requirements", context: "Mentions energy but not environmental stakeholder participation" }],
            claim: "Environmental groups have partial advisory access",
            absenceType: "Practical",
            exclusionType: "Passive",
            ghostType: null,
            evidenceGrade: "E2" as const,
            absenceScore: null,
        },
    ],
};

const GOLDEN_PASS_3 = {
    schemaVersion: "GNDP-1.0" as const,
    counterfactuals: [
        {
            actorId: "Gig-Workers",
            chokepoint: {
                oppName: "Initiation of enforcement review for unsafe workplace AI",
                oppType: "enforcement" as const,
                standingActor: "unions/workers",
                obligatedActor: "competent authority",
                obligatedActorType: "Authority" as const,
                obligationType: "Investigate" as const,
                bindingDuty: "Certify algorithmic management systems", // v2 compat
            },
            scenario: "If unions/workers had standing to submit collective complaints and the competent authority were required to investigate, then enforcement of workplace AI safeguards would become more responsive.",
            estimatedImpact: {
                level: "Moderate" as const,
                qualifier: "if authority has mandatory review obligations",
                guidanceBindingness: "Unknown" as const,
                enforcementLadder: [
                    { step: "CorrectiveAction" as const, note: "mandatory mitigation plan" },
                    { step: "Fine" as const, note: "only for noncompliance with binding obligations" },
                    { step: "Suspension" as const },
                    { step: "WithdrawalRecall" as const, note: "last resort for noncompliance" },
                ],
            },
            mechanismChain: [
                { kind: "EvidenceCollection" as const, step: "Workers document harms + generate evidence artifacts" },
                { kind: "Aggregation" as const, step: "Union aggregates individual claims into standardized complaint format" },
                { kind: "Admissibility" as const, step: "Complaint meets defined evidentiary threshold; authority accepts for review" },
                { kind: "ReviewInitiation" as const, step: "Authority opens formal review and notifies deployer/provider" },
                { kind: "ResponseDueProcess" as const, step: "Deployer/provider must respond and propose mitigations" },
                { kind: "RemedyEnforcement" as const, step: "Authority orders corrective actions; noncompliance escalates" },
                { kind: "Deterrence" as const, step: "Employers/providers pre-emptively improve safeguards" },
            ],
            beneficiaryMechanisms: [
                { actor: "Platform Companies", mechanism: "Absence of aggregated trigger at Admissibility step lets deployer avoid system-level review" },
                { actor: "Providers", mechanism: "No shared liability at RemedyEnforcement step for downstream worker impacts" },
            ],
            shieldedActors: [
                { actor: "Platform Companies", mechanism: "Reduced likelihood of system-level investigations tied to worker harm evidence" },
            ],
            confidence: {
                evidenceBase: "Medium" as const,
                speculativeConfidence: "Medium" as const,
                caveat: "Based on excerpted text; scope of worker definition is contested.",
                grounded: "policy contains enforcement gate framed around inadequate safeguards",
                inferred: "gate includes review authority but trigger rules not specified",
                unknown: "whether workplace AI is within scope of enforcement provisions",
                assumptions: [
                    "recall powers exist but are not currently worker-triggered",
                    "competent authority has mandatory review obligations",
                ],
            },
            analyticalChallenges: [
                { kind: "StrategicGaming" as const, description: "Actors could flood grievance channels to overwhelm review capacity" },
                { kind: "CaptureRisk" as const, description: "Dominant employers may shape complaint standards in their favor" },
                { kind: "CapacityBacklog" as const, description: "Authority capacity constraints could reduce review timeliness" },
            ],
        },
    ],
};

// v2 fixture (plain string chain, no role semantics, no enforcement ladder)
const GOLDEN_PASS_3_V2 = {
    schemaVersion: "GNDP-1.0" as const,
    counterfactuals: [
        {
            actorId: "Gig-Workers",
            chokepoint: { oppName: "Conformity Assessment", oppType: "conformity_assessment" as const, bindingDuty: "Certify systems" },
            scenario: "If gig workers had binding rights at conformity assessment...",
            estimatedImpact: { level: "Transformative" as const, qualifier: "if enforceable" },
            mechanismChain: ["Workers gain standing", "Audits required", "Algorithms disclosed"],
            beneficiaryMechanisms: [{ actor: "Platform Companies", mechanism: "Avoid compliance" }],
            confidence: { evidenceBase: "Low" as const, speculativeConfidence: "Low" as const, caveat: "Limited excerpts." },
        },
    ],
};

// v1 legacy fixture (pre-v2, has territorialization/riskRedistribution)
const GOLDEN_PASS_3_LEGACY = {
    schemaVersion: "GNDP-1.0" as const,
    counterfactuals: [
        {
            actorId: "Gig-Workers",
            chokepoint: { oppName: "Conformity Assessment", oppType: "conformity_assessment" as const, bindingDuty: "Certify systems" },
            scenario: "If gig workers had binding rights...",
            estimatedImpact: { level: "Transformative" as const, qualifier: "if enforceable" },
            mechanismChain: ["Step 1", "Step 2"],
            beneficiaryMechanisms: [{ actor: "Platform Companies", mechanism: "Avoid compliance" }],
            confidence: { evidenceBase: "Low" as const, speculativeConfidence: "Low" as const, caveat: "Limited excerpts." },
            // v1 legacy fields
            counterfactualImpact: "Transformative" as const,
            territorialization: {
                destabilizesPower: true,
                introducesAccountability: true,
                reconfiguresData: true,
                altersEnforcement: false,
            },
            riskRedistribution: {
                beneficiariesOfAbsence: ["Platform Companies"],
                shieldedActors: ["Platform Companies"],
                reducesCoalitionFriction: true,
            },
            reasoning: "Binding gig worker rights would force audits",
        },
    ],
};


// ===================================================================
// TESTS
// ===================================================================

describe('GNDP v1.0 Schema Parsing', () => {

    describe('Pass 1A — Extraction', () => {
        it('parses golden response correctly', () => {
            const result = GhostNodesPass1ASchema.parse(GOLDEN_PASS_1A);
            expect(result.formalActors).toHaveLength(4);
            expect(result.affectedClaims).toHaveLength(3);
            expect(result.obligatoryPassagePoints).toHaveLength(3);
        });

        it('enforces impliedActors max 5', () => {
            const tooMany = {
                ...GOLDEN_PASS_1A,
                affectedClaims: [{
                    claim: "test",
                    supportQuote: "test",
                    impliedActors: ["a", "b", "c", "d", "e", "f"],
                }],
            };
            expect(() => GhostNodesPass1ASchema.parse(tooMany)).toThrow();
        });

        it('handles empty arrays gracefully', () => {
            const result = GhostNodesPass1ASchema.parse({
                formalActors: [],
                affectedClaims: [],
                obligatoryPassagePoints: [],
            });
            expect(result.formalActors).toHaveLength(0);
        });
    });

    describe('Pass 1B — Candidate Synthesis', () => {
        it('parses golden response correctly', () => {
            const result = GhostNodesPass1BSchema.parse(GOLDEN_PASS_1B);
            expect(result.candidates).toHaveLength(2);
            expect(result.candidates[0].materialImpact).toBe('High');
            expect(result.candidates[0].oppAccess).toBe('None');
        });

        it('enforces candidate max 10', () => {
            const tooMany = {
                candidates: Array.from({ length: 11 }, (_, i) => ({
                    name: `Actor-${i}`,
                    reason: "test",
                    materialImpact: "Low",
                    oppAccess: "None",
                    sanctionPower: "None",
                    dataVisibility: "Invisible",
                    representationType: "None",
                    preliminaryAbsenceStrength: "Low",
                    keywords: ["test"],
                })),
            };
            expect(() => GhostNodesPass1BSchema.parse(tooMany)).toThrow();
        });
    });

    describe('Pass 2 — Deep Dive', () => {
        it('parses golden response with GNDP fields', () => {
            const result = GhostNodesPass2Schema.parse(GOLDEN_PASS_2);
            expect(result.ghostNodes).toHaveLength(2);

            const valid = result.ghostNodes[0];
            expect(valid.ghostType).toBe('Structural');
            expect(valid.evidenceGrade).toBe('E4');
            expect(valid.absenceScore).toBe(78);
            expect(valid.scoreBreakdown?.materialImpact).toBe(25);
        });

        it('allows null absenceScore for low evidence grades', () => {
            const result = GhostNodesPass2Schema.parse(GOLDEN_PASS_2);
            const invalid = result.ghostNodes[1];
            expect(invalid.evidenceGrade).toBe('E2');
            expect(invalid.absenceScore).toBeNull();
            expect(invalid.ghostType).toBeNull();
        });

        it('enforces score breakdown ranges', () => {
            const badScore = {
                ghostNodes: [{
                    ...GOLDEN_PASS_2.ghostNodes[0],
                    scoreBreakdown: { materialImpact: 35, oppExclusion: 0, sanctionAbsence: 0, dataInvisibility: 0, representationGap: 0 },
                }],
            };
            expect(() => GhostNodesPass2Schema.parse(badScore)).toThrow();
        });
    });

    describe('Pass 3 — Counterfactual (v3 Role Semantics)', () => {
        it('parses v3 golden response with role semantics + typed chain', () => {
            const result = GhostNodesPass3Schema.parse(GOLDEN_PASS_3);
            expect(result.counterfactuals).toHaveLength(1);
            const cf = result.counterfactuals[0];
            // Role semantics
            expect(cf.chokepoint.standingActor).toBe('unions/workers');
            expect(cf.chokepoint.obligatedActor).toBe('competent authority');
            expect(cf.chokepoint.obligatedActorType).toBe('Authority');
            expect(cf.chokepoint.obligationType).toBe('Investigate');
            // Enforcement ladder
            expect(cf.estimatedImpact.enforcementLadder).toHaveLength(4);
            // Typed mechanism chain
            expect(cf.mechanismChain).toHaveLength(7);
            const firstStep = cf.mechanismChain[0] as any;
            expect(firstStep.kind).toBe('EvidenceCollection');
            // Confidence granularity
            expect(cf.confidence.grounded).toContain('enforcement gate');
            expect(cf.confidence.inferred).toBeDefined();
            expect(cf.confidence.unknown).toBeDefined();
            expect(cf.confidence.assumptions).toHaveLength(2);
            // Guidance bindingness
            expect(cf.estimatedImpact.guidanceBindingness).toBe('Unknown');
            // Analytical challenges
            expect(cf.analyticalChallenges).toHaveLength(3);
            expect((cf.analyticalChallenges as any)[0].kind).toBe('StrategicGaming');
        });

        it('parses v2 format (plain string chain, backward compat)', () => {
            const result = GhostNodesPass3Schema.parse(GOLDEN_PASS_3_V2);
            expect(result.counterfactuals).toHaveLength(1);
            const cf = result.counterfactuals[0];
            expect(cf.chokepoint.bindingDuty).toBe('Certify systems');
            expect(cf.mechanismChain).toHaveLength(3);
            // v2 chain is plain strings
            expect(typeof cf.mechanismChain[0]).toBe('string');
        });

        it('parses legacy v1 format (backward compat)', () => {
            const result = GhostNodesPass3Schema.parse(GOLDEN_PASS_3_LEGACY);
            expect(result.counterfactuals).toHaveLength(1);
            expect(result.counterfactuals[0].counterfactualImpact).toBe('Transformative');
            expect(result.counterfactuals[0].territorialization?.destabilizesPower).toBe(true);
        });

        it('enforces max 6 counterfactuals', () => {
            const tooMany = {
                counterfactuals: Array.from({ length: 7 }, (_, i) => ({
                    actorId: `actor-${i}`,
                    chokepoint: { oppName: "test", oppType: "audit" },
                    scenario: "If actor...",
                    estimatedImpact: { level: "None", qualifier: "n/a" },
                    mechanismChain: [
                        { kind: "EvidenceCollection", step: "step 1" },
                        { kind: "Admissibility", step: "step 2" },
                        { kind: "ResponseDueProcess", step: "step 3" },
                    ],
                    beneficiaryMechanisms: [],
                    confidence: { evidenceBase: "Low", speculativeConfidence: "Low", caveat: "Test." },
                })),
            };
            expect(() => GhostNodesPass3Schema.parse(tooMany)).toThrow();
        });
    });
});

describe('Evidence Grade Gating', () => {
    it('E1/E2 → absenceScore and ghostType must be null', () => {
        const result = GhostNodesPass2Schema.parse(GOLDEN_PASS_2);
        const lowGrade = result.ghostNodes.filter(n => n.evidenceGrade === 'E1' || n.evidenceGrade === 'E2');
        for (const node of lowGrade) {
            expect(node.absenceScore).toBeNull();
            expect(node.ghostType).toBeNull();
        }
    });

    it('E3/E4 → absenceScore must be a valid number', () => {
        const result = GhostNodesPass2Schema.parse(GOLDEN_PASS_2);
        const highGrade = result.ghostNodes.filter(n => n.evidenceGrade === 'E3' || n.evidenceGrade === 'E4');
        for (const node of highGrade) {
            expect(node.absenceScore).toBeTypeOf('number');
            expect(node.absenceScore).toBeGreaterThanOrEqual(0);
            expect(node.absenceScore).toBeLessThanOrEqual(100);
        }
    });
});
