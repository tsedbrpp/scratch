import { z } from 'zod';

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

export const GhostNodesPass1Schema = z.object({
    dominantDiscourses: z.array(z.object({
        label: DiscourseTaxonomySchema, // Use string for "Other"
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

export const GhostNodesPass2Schema = z.object({
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
        }).optional()
    }))
});
