/**
 * Glossary definitions for contextual help tooltips
 */

export const glossaryDefinitions: Record<string, string> = {
    'assemblage-compass': 'Visualize how actors, technologies, and institutions form networks of influence. Maps the relationships and power dynamics within policy assemblages.',

    'institutional-logics': 'Competing value systems (market, state, professional, community) that shape policy decisions. Each logic has different assumptions about what is valuable and how things should work.',

    'drift-analysis': 'Measures the gap between policy rhetoric (what is promised in documents) and material reality (what is actually enforced). High drift indicates symbolic policies.',

    'micro-resistance': 'Subtle forms of opposition that emerge during policy implementation. These small acts of resistance can accumulate to undermine or transform policies.',

    'opp': 'Obligatory Passage Point - critical actors or resources that control access to the network. All other actors must pass through these points to participate.',

    'territorialization': 'How policies stabilize and become fixed in practice through routines, regulations, and material infrastructure.',

    'deterritorialization': 'Forces that destabilize or transform existing arrangements. Can include technological change, social movements, or policy reforms.',

    'coloniality-of-power': 'Center-periphery dynamics in global governance. Examines how power concentrates in certain locations (Global North) while marginalizing others (Global South).',

    'reflexivity': 'Critical examination of the analysis itself, including its assumptions, blind spots, and potential biases. Essential for rigorous social science.',

    'provisional-inscription': 'Temporary or contested elements in policy assemblages. These are not yet stabilized and may change or disappear.',

    'actor-network-theory': 'A theoretical framework that treats humans and non-humans (technologies, documents, nature) as equally important actors in social networks.',

    'assemblage-theory': 'Views social phenomena as temporary arrangements of heterogeneous elements. Emphasizes fluidity, emergence, and the role of material objects.',
};

/**
 * Get glossary definition for a term
 */
export function getGlossaryDefinition(term: string): string {
    const key = term.toLowerCase().replace(/\s+/g, '-');
    return glossaryDefinitions[key] || 'No definition available.';
}
