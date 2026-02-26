import { StudyCase } from '../study-config';

export type ResolverFn = (fieldId: string, caseData: StudyCase) => Promise<{ targets: string[], hintText?: string, error?: string }>;

const registry = new Map<string, ResolverFn>();

// Phase 1: Quote Extraction targeting
const quoteResolver: ResolverFn = async (id, data) => {
    const quotes = data.evidenceQuotes || [];
    if (!quotes.length) {
        return {
            targets: [],
            hintText: 'No quotes available in this case to select from.',
            error: 'empty_quotes'
        };
    }
    // We deterministically map evidence targets to their quote indices 
    // This allows QuotesCardList to register to these IDs on render
    const targets = quotes.map((q, i) => `quote-${data.id}-${i}`);

    return {
        targets,
        hintText: 'Review the highlighted excerpts to ground your assessment.'
    };
};

registry.set('v2_standingEvidence', quoteResolver);
registry.set('v3_exclusionBounding', quoteResolver);

// Phase 2.5: Map Ghost Node Evaluation Form fields to quote highlighting
const ghostNodeFields = ['presenceGate', 'disambiguation', 'strength', 'groundingGate', 'section3', 'section4', 'section5', 'section6'];
ghostNodeFields.forEach(field => registry.set(field, quoteResolver));


// Phase 2 + Phase 3: Claim/Hypothesis targeting
const claimResolver: ResolverFn = async (id, data) => {
    if (!data.claim || (!data.claim.summaryBullets.length && !data.claim.fullReasoning)) {
        return { targets: [], hintText: 'No specific interpretive claim provided to evaluate.' };
    }

    const targets = [];
    if (data.claim.summaryBullets.length > 0) {
        targets.push(`claim-bullets-${data.id}`);
    }
    targets.push(`claim-reasoning-${data.id}`);

    return {
        targets,
        hintText: 'Evaluate the claims and hypotheses identified by the AI system.'
    };
};

registry.set('s1_primaryMechanisms', claimResolver);
registry.set('s2_oppTargets', claimResolver);
registry.set('s3_institutionalLogics', claimResolver);
registry.set('c1_severity', claimResolver);
registry.set('c2_riskPathways', claimResolver);


// Phase 4: Counterfactual / Feasibility Logic targeting
const plausibilityResolver: ResolverFn = async (id, data) => {
    if (!data.counterfactual) {
        // Fall back to general claim if no counterfactual is available
        return claimResolver(id, data);
    }

    return {
        targets: [`counterfactual-${data.id}`],
        hintText: 'Assess the realism and feasibility of the proposed structural counterfactual.'
    };
};

registry.set('f1_plausibility', plausibilityResolver);
registry.set('f2_feasibility', plausibilityResolver);
registry.set('f3_mainBlockers', plausibilityResolver);
registry.set('f4_minimumViableInclusion', plausibilityResolver);


export async function resolveTargets(fieldId: string, caseData: StudyCase): Promise<{ targets: string[], hintText?: string, error?: string }> {
    const resolver = registry.get(fieldId);
    if (!resolver) {
        // Default to no targets if no specific mapping is needed (e.g. for general phase 0 questions)
        return { targets: [] };
    }
    return resolver(fieldId, caseData);
}
