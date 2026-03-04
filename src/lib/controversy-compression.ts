/**
 * Pre-LLM Compression Layer for Controversy Mapping
 * Objective: Radically reduce heterogeneous JSON structures from 7 different analytical strata
 * down to < 32k tokens, preserving only the highest signal structural features 
 * (names, themes, scores, friction points) while aggressively truncating quotes and arrays.
 */

export interface RawLensData {
    cultural?: any;
    institutional?: any;
    resistance?: any;
    abstractMachine?: any;
    actors?: any[];
    ghostNodes?: any[];
    configurations?: any[];
    crossCaseExport?: any;
}

export function compressLensesForControversyMapping(raw: RawLensData): string {
    // Helper to truncate strings 
    const truncate = (str: string, max = 250) =>
        str?.length > max ? str.substring(0, max) + '...' : str;

    // Helper to generic-filter arrays and strip heavy fields
    const stripNoise = (obj: any, depth = 0): any => {
        if (depth > 5) return "..."; // Prevent circular or massive nested objects
        if (obj === null || obj === undefined) return undefined;

        if (typeof obj === 'string') {
            // Strip UUIDs typically used for tracing (like q-ghost-xxxx)
            if (obj.match(/^[0-9a-fA-F-]{36}$/) || obj.match(/^q-/)) return undefined;
            return truncate(obj);
        }

        if (Array.isArray(obj)) {
            // Take at most top 7 items per array to avoid context blowout
            return obj.slice(0, 7).map(item => stripNoise(item, depth + 1)).filter(Boolean);
        }

        if (typeof obj === 'object') {
            const clean: any = {};
            for (const [key, value] of Object.entries(obj)) {
                // Aggressively drop heavy/noisy keys common in our schemas
                if ([
                    'evidenceQuotes', 'excerpts', 'supportedBy', 'rationale',
                    'sourceRef', 'id', 'color', 'createdAt', 'updatedAt',
                    'x', 'y', 'vx', 'vy', 'index'
                ].includes(key)) {
                    continue; // Skip entirely
                }

                const cleanedValue = stripNoise(value, depth + 1);
                // Drop empty objects/arrays to shrink JSON payload
                if (cleanedValue !== undefined &&
                    !(Array.isArray(cleanedValue) && cleanedValue.length === 0) &&
                    !(typeof cleanedValue === 'object' && Object.keys(cleanedValue).length === 0)) {
                    clean[key] = cleanedValue;
                }
            }
            return clean;
        }

        return obj; // Numbers, booleans pass through
    };

    // targeted aggressive mapping before the generic recursive strip
    const compressed = {
        cultural: raw.cultural ? {
            themes: raw.cultural.macro_themes?.map((t: any) => ({ name: t.name })),
            frames: raw.cultural.state_market_framing?.key_metaphors,
            justifications: raw.cultural.justification_regimes?.dominant_orders
        } : null,

        institutional: raw.institutional ? {
            clashes: raw.institutional.hybridity_friction_zones,
            dominance: raw.institutional.dominance_hierarchy
        } : null,

        resistance: raw.resistance ? {
            frictions: raw.resistance.friction_points_summary
        } : null,

        abstractMachine: raw.abstractMachine ? {
            diagram: raw.abstractMachine.diagram,
            articulations: raw.abstractMachine.double_articulation ? {
                clashes: raw.abstractMachine.double_articulation.clashes?.slice(0, 3),
                resonances: raw.abstractMachine.double_articulation.resonances?.slice(0, 3)
            } : null
        } : null,

        ontology: {
            // Only keep names and types for context
            actors: raw.actors?.slice(0, 15).map(a => ({ name: a.name, type: a.type })),
            ghosts: raw.ghostNodes?.slice(0, 10).map(g => ({ name: g.name, gap: truncate(g.ghostReason || g.description, 100) }))
        },

        compass: raw.configurations?.slice(0, 5).map(c => ({
            name: c.name,
            territorialization: c.properties?.territorialization_score,
            codingIntensity: c.properties?.coding_intensity_score
        })),

        crossCaseSynthesis: raw.crossCaseExport ? {
            impacts: raw.crossCaseExport.impactNarrative
        } : null
    };

    // Final recursive strip for any missed noise
    const finalClean = stripNoise(compressed);

    return JSON.stringify(finalClean, null, 2);
}
