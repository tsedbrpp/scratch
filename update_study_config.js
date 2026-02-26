const fs = require('fs');

const original = fs.readFileSync('src/lib/study-config.ts', 'utf8');

const newConfigBlock = `
export interface EvaluationConfig {
    presenceGateQuestion?: string;
    presenceGateOptions?: string[];
    disambiguationPrompts?: { id: string; question: string; options: string[] }[];
    strengthAbsence?: { min: number; max: number; anchors: { value: number; label: string }[] };
    confidenceOptions?: string[];
    feasibility?: {
        min: number; max: number; anchors: { value: number; label: string }[];
        mechanismGateThreshold: number; mechanismOptions: string[]
    };
    // V2 Dynamic Options
    ghostingMechanisms?: { label: string; value: string }[];
    oppTargets?: { label: string; value: string }[];
    institutionalLogics?: { label: string; value: string }[];
    riskPathways?: { label: string; value: string }[];
    blockers?: { label: string; value: string }[];
}
`;

const schemaBlock = `
const Id = z.string().min(1);

export const SurveyVersion = z.literal("ghost_survey_v2");

export const QuoteRefSchema = z.object({
  quoteText: z.string().min(1),
  sourceId: z.string().min(1),
  excerptId: z.string().min(1).nullable(),
  location: z.string().min(1).nullable(),
  notes: z.string().max(2000).nullable(),
}).strict();

export type QuoteRef = z.infer<typeof QuoteRefSchema>;

export const ScopeExpectation = z.enum([
  "in_scope", "depends", "out_of_scope", "insufficient_context"
]);

export const MentionStatus = z.enum([
  "not_mentioned", "affected_impacted_only", "stakeholder_participant",
  "decision_maker_authority", "ambiguous_or_cannot_tell"
]);

export const TernaryEvidence = z.enum(["yes", "no", "cannot_tell"]);
export const NodeStanding = z.enum(["mention_only", "standing_candidate", "structural_ghost", "not_applicable"]);
export const Confidence = z.enum(["low", "medium", "high"]);

export const MissingSignal = z.enum([
  "noGovernanceMechanism", "noParticipationRule", "noBoundedForum",
  "noOPPAccessInfo", "noExclusionLanguage"
]);

export const GhostingMechanism = z.enum([
  "no_formal_forum_or_opp", "restricted_access_bounded_eligibility",
  "discursive_passivation_victim_only", "illegible_impacts_missing_metrics",
  "proxy_displacement", "other"
]);

export const OPPTarget = z.enum([
  "standard_setting", "risk_scoping_definitions", "conformity_assessment_audits",
  "complaints_redress", "enforcement_sanctions", "oversight_board_advisory",
  "procurement_deployment_approval", "reporting_transparency", "other"
]);

export const InstitutionalLogic = z.enum([
  "market_competition", "state_administrative", "techno_professional",
  "security_surveillance", "rights_constitutional", "care_community_participatory",
  "environmental_stewardship", "mixed_contested", "other"
]);

export const BenefitType = z.enum(["direct", "indirect", "blind_spot", "cannot_tell"]);

export const RiskPathway = z.enum([
  "accountability_gap", "regulatory_capture_lock_in", "externalized_harm",
  "implementation_failure", "epistemic_injustice", "disparate_impact_discrimination",
  "innovation_suppression_path_dependency", "other"
]);

export const TimeHorizon = z.enum(["immediate_0_12m", "medium_1_3y", "long_3y_plus"]);

export const Blocker = z.enum([
  "legal_authority_jurisdiction", "political_coalition_resistance", "administrative_capacity_cost",
  "industry_lobbying_capture_risk", "measurement_verification_difficulty",
  "legitimacy_representation_dispute", "international_harmonization_constraints", "other"
]);

export const Likert5 = z.number().int().min(1).max(5);
export const Slider0to100 = z.number().min(0).max(100);

const TimingSchema = z.object({
  startedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  submittedAt: z.string().datetime().nullable(),
  timeSpentSeconds: z.number().int().min(0).nullable(),
}).strict();

const Phase0Schema = z.object({
  scopeExpectation: ScopeExpectation.nullable(),
  scopeRationale: z.string().max(2000).nullable(),
}).strict();

const Phase1Schema = z.object({
  v1_mentionStatus: MentionStatus.nullable(),
  v2_standingEvidence: z.object({
    status: TernaryEvidence.nullable(),
    quote: QuoteRefSchema.nullable(),
    notes: z.string().max(2000).nullable(),
  }).strict(),
  v3_exclusionBounding: z.object({
    status: TernaryEvidence.nullable(),
    quote: QuoteRefSchema.nullable(),
    boundedInDefinition: z.string().max(2000).nullable(),
    boundedOutImplication: z.string().max(2000).nullable(),
    notes: z.string().max(2000).nullable(),
  }).strict(),
  v4_nodeStanding: z.object({
    derived: NodeStanding.nullable(),
    selected: NodeStanding.nullable(),
    overrideReason: z.string().max(2000).nullable(),
  }).strict(),
  v5_diagnostics: z.object({
    confidence: Confidence.nullable(),
    missingSignals: z.array(MissingSignal).default([]),
  }).strict(),
}).strict();

const Phase2Schema = z.object({
  s1_primaryMechanisms: z.array(GhostingMechanism).default([]),
  s1_otherText: z.string().max(2000).nullable(),
  s2_oppTargets: z.array(OPPTarget).default([]),
  s2_otherText: z.string().max(2000).nullable(),
  s3_institutionalLogics: z.array(InstitutionalLogic).default([]),
  s3_otherText: z.string().max(2000).nullable(),
  s4_distributionalEffects: z.object({
    benefitType: BenefitType.nullable(),
    benefitingActorsText: z.string().max(2000).nullable(),
  }).strict(),
}).strict();

const Phase3Schema = z.object({
  c1_severity: Slider0to100.nullable(),
  c1_rationale: z.string().max(2000).nullable(),
  c2_riskPathways: z.array(RiskPathway).default([]),
  c2_otherText: z.string().max(2000).nullable(),
  c3_timeHorizon: TimeHorizon.nullable(),
}).strict();

const Phase4Schema = z.object({
  f1_plausibility: z.object({
    mechanismRealism: Likert5.nullable(),
    actorReactionRealism: Likert5.nullable(),
    outcomeRealism: Likert5.nullable(),
  }).strict(),
  f2_feasibility: Slider0to100.nullable(),
  f3_mainBlockers: z.array(Blocker).default([]),
  f3_otherText: z.string().max(2000).nullable(),
  f4_minimumViableInclusion: z.string().max(4000).nullable(),
}).strict();

export const GhostNodeSurveyResponseSchemaV2 = z.object({
  surveyVersion: SurveyVersion,
  responseId: Id,
  evaluatorId: Id.nullable(),
  evaluatorCode: z.string().min(1).nullable(),
  studyCaseId: Id,
  ghostNodeId: Id,
  actorName: z.string().min(1).nullable(),
  ecosystemId: z.string().min(1).nullable(),
  status: z.enum(["draft", "submitted"]).default("draft"),
  timing: TimingSchema,
  configHash: z.string().min(1).nullable(),
  configVersion: z.string().min(1).nullable(),
  phase0: Phase0Schema,
  phase1: Phase1Schema,
  phase2: Phase2Schema,
  phase3: Phase3Schema,
  phase4: Phase4Schema,
}).strict()
.superRefine((r, ctx) => {
  const scope = r.phase0.scopeExpectation;
  if (scope === "out_of_scope") {
    const sel = r.phase1.v4_nodeStanding.selected;
    if (sel && sel !== "not_applicable") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phase1","v4_nodeStanding","selected"], message: "Out of scope requires selected NodeStanding = not_applicable." });
    }
    const mustBeNullPaths = [
      ["phase1","v1_mentionStatus"],
      ["phase1","v2_standingEvidence","status"],
      ["phase1","v3_exclusionBounding","status"],
      ["phase3","c1_severity"],
      ["phase4","f2_feasibility"],
    ];
    for (const p of mustBeNullPaths) {
      const val = p.reduce((acc, k) => (acc ? acc[k] : undefined), r);
      if (val !== null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: p, message: "Skipped (out_of_scope) responses must keep non-applicable fields null." });
      }
    }
  }

  const v2 = r.phase1.v2_standingEvidence;
  if (v2.status === "yes" && !v2.quote) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phase1","v2_standingEvidence","quote"], message: "Standing evidence requires a supporting quote when status = yes." });
  }

  const v3 = r.phase1.v3_exclusionBounding;
  if (v3.status === "yes") {
    if (!v3.quote) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phase1","v3_exclusionBounding","quote"], message: "Exclusion bounding requires a quote when status = yes." });
    }
    if (!v3.boundedInDefinition) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phase1","v3_exclusionBounding","boundedInDefinition"], message: "Provide the bounded eligibility definition when status = yes." });
    }
  }

  if (r.phase2.s1_primaryMechanisms.includes("other") && !r.phase2.s1_otherText) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phase2","s1_otherText"], message: "Other text is required when 'other' is selected." });
  }
  if (r.phase2.s2_oppTargets.includes("other") && !r.phase2.s2_otherText) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phase2","s2_otherText"], message: "Other text is required when 'other' is selected." });
  }
  if (r.phase2.s3_institutionalLogics.includes("other") && !r.phase2.s3_otherText) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phase2","s3_otherText"], message: "Other text is required when 'other' is selected." });
  }
  if (r.phase3.c2_riskPathways.includes("other") && !r.phase3.c2_otherText) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phase3","c2_otherText"], message: "Other text is required when 'other' is selected." });
  }
  if (r.phase4.f3_mainBlockers.includes("other") && !r.phase4.f3_otherText) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phase4","f3_otherText"], message: "Other text is required when 'other' is selected." });
  }
});

export type GhostNodeSurveyResponseV2 = z.infer<typeof GhostNodeSurveyResponseSchemaV2>;

export const GhostNodeSurveyResponseSchemaV1 = z.object({
    evaluatorId: z.string(),
    studyId: z.string(),
    caseId: z.string(),
    caseIndex: z.number(),
    startedAt: z.number(),
    submittedAt: z.number(),
    timeOnCaseMs: z.number(),
    strength: z.number().nullable(),
    confidence: z.enum(['low', 'medium', 'high']).nullable(),
    missingRoles: z.array(z.string()),
    missingRolesOther: z.string().optional(),
    isUncertain: z.boolean().optional(),
    institutionalLogics: z.object({
        market: z.enum(['weak', 'moderate', 'dominant']).nullable(),
        state: z.enum(['weak', 'moderate', 'dominant']).nullable(),
        professional: z.enum(['weak', 'moderate', 'dominant']).nullable(),
        community: z.enum(['weak', 'moderate', 'dominant']).nullable(),
    }),
    reflexivity: z.string(),
    absenceGate: z.enum(['yes', 'no', 'unsure']).optional(),
    selectedQuoteId: z.string().optional(),
    disambiguationAnswers: z.record(z.string(), z.string()).optional(),
    feasibility: z.number().min(0).max(100).optional(),
    feasibleMechanisms: z.array(z.string()).optional(),
    feasibilityNotes: z.string().optional(),
});

export type GhostNodeSurveyResponseV1 = z.infer<typeof GhostNodeSurveyResponseSchemaV1>;

// The unified schema
export const GhostNodeSurveyResponseSchema = z.union([
    GhostNodeSurveyResponseSchemaV2,
    GhostNodeSurveyResponseSchemaV1
]);

export type GhostNodeSurveyResponse = z.infer<typeof GhostNodeSurveyResponseSchema>;
export type SurveyResponseData = Partial<GhostNodeSurveyResponse>;

// --- CSV FLATTENING OPTIONS ---
export type CsvFlattenOptions = {
  arrayDelimiter?: string;
  nullValue?: string;
  includeJsonColumn?: boolean;
  includeConfigColumns?: boolean;
  quoteMode?: "text_only" | "text_source_loc";
  maxCellChars?: number;
};

export type FlattenedCsv = {
  headers: string[];
  rows: Record<string, string>[];
};
`;

let modified = original.replace(/export interface EvaluationConfig \{[\s\S]*?\}\n/, newConfigBlock);
modified = modified.replace(/export type InstitutionalLogicStrength[\s\S]*?export type SurveyResponseData[\s\S]*?;\n/, schemaBlock + '\n');

fs.writeFileSync('src/lib/study-config.ts', modified);
console.log('Successfully updated study-config.ts');
