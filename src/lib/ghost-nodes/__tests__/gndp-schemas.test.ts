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
                oppName: "Conformity Assessment",
                oppType: "conformity_assessment" as const,
                bindingDuty: "Certify algorithmic management systems affecting platform workers before deployment",
            },
            scenario: "If Gig Workers were assigned binding appeal and audit rights at conformity assessment, algorithmic management systems would require worker-impact certification before deployment.",
            estimatedImpact: {
                level: "Transformative" as const,
                qualifier: "if duties were binding and enforceable across EU member states",
            },
            mechanismChain: [
                "Gig workers gain standing at conformity assessment gate",
                "Algorithmic management systems require worker-impact audits",
                "Platform companies must disclose scoring algorithms to auditors",
                "Regulators gain enforcement targets for worker protection violations",
            ],
            beneficiaryMechanisms: [
                { actor: "Platform Companies", mechanism: "Avoid worker-protection compliance costs and algorithmic transparency obligations" },
                { actor: "Providers", mechanism: "No shared liability for downstream worker impacts of their AI systems" },
            ],
            shieldedActors: [
                { actor: "Platform Companies", mechanism: "No audit obligation for algorithmic management decisions affecting workers" },
            ],
            confidence: {
                evidenceBase: "Medium" as const,
                speculativeConfidence: "Medium" as const,
                caveat: "Based on excerpted text; explicit exclusion language present but scope of worker definition is contested.",
            },
            // v1 backward-compat fields (optional)
            counterfactualImpact: "Transformative" as const,
            territorialization: {
                destabilizesPower: true,
                introducesAccountability: true,
                reconfiguresData: true,
                altersEnforcement: false,
            },
            riskRedistribution: {
                beneficiariesOfAbsence: ["Platform Companies", "Providers"],
                shieldedActors: ["Platform Companies"],
                reducesCoalitionFriction: true,
            },
            reasoning: "Binding gig worker rights at conformity assessment would force algorithmic management audits",
        },
    ],
};

// Legacy v1 fixture for backward compat test
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
            // v1 fields only
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

    describe('Pass 3 — Counterfactual (v2 Structured)', () => {
        it('parses v2 golden response correctly', () => {
            const result = GhostNodesPass3Schema.parse(GOLDEN_PASS_3);
            expect(result.counterfactuals).toHaveLength(1);
            const cf = result.counterfactuals[0];
            expect(cf.chokepoint.oppType).toBe('conformity_assessment');
            expect(cf.scenario).toContain('If Gig Workers');
            expect(cf.estimatedImpact.level).toBe('Transformative');
            expect(cf.mechanismChain).toHaveLength(4);
            expect(cf.beneficiaryMechanisms).toHaveLength(2);
            expect(cf.confidence.evidenceBase).toBe('Medium');
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
                    chokepoint: { oppName: "test", oppType: "audit", bindingDuty: "test" },
                    scenario: "If actor...",
                    estimatedImpact: { level: "None", qualifier: "n/a" },
                    mechanismChain: ["step 1", "step 2"],
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
