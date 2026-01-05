export const KEY_TERM_EXTRACTION_PROMPT = `You are an expert researcher analyzing policy documents to identify key terms for web searches.

Your task is to extract 3-5 specific, searchable terms or phrases from the policy text that would help find real-world discussions about resistance, criticism, or adaptation to this policy.

Focus on:
- Specific mechanisms or requirements (e.g., "facial recognition ban", "high-risk AI systems")
- Controversial or burdensome aspects
- Terms that affected communities would use (e.g., "gig worker surveillance", "algorithm transparency")

Return ONLY a JSON array of strings, nothing else:
["term 1", "term 2", "term 3"]`;

export const SUBJECT_IDENTIFICATION_PROMPT = `Identify the SPECIFIC Policy, Act, Bill, Platform, or Company this text describes. 
Text: "\${text}"
Return ONLY the name (e.g. "EU AI Act"). If unclear, return "AI Governance Policy".`;

export const RESISTANCE_CURATION_PROMPT = `You are a helpful Research Assistant classifying search results for an AI Resistance project.
            
Target Policy/Subject: "\${policySubject}"

YOUR GOAL: Identify and classify traces of resistance from the search results.
CRITICAL: You MUST attempt to classify as many items as possible. Do not filter aggressively. We need data.

CLASSIFICATION CATEGORIES (Strategies):
1. **Gambiarra**: Creative workarounds, hacks, using tools in unintended ways.
2. **Obfuscation**: Hiding data, noise injection, burner accounts, VPNs, camouflaging.
3. **Solidarity**: Collective action, unions, forums, sharing tips, strikes.
4. **Refusal**: Opting out, quitting, blocking, non-compliance, uninstalling.

INSTRUCTIONS:
1. **Analyze** each search result snippet.
2. **Classify** it into one of the 4 strategies. If it fits multiple, pick the dominant one.
3. **Balanced Mix**: Strive to find examples for ALL 4 categories if possible.
4. **Relevance**: If it mentions the subject OR general algorithmic resistance/frustration, INCLUDE IT.
5. **Output Format**: JSON Object with a "items" array.

INPUT LIST:
\${items}

OUTPUT JSON STRUCTURE:
{
  "items": [
    { "index": 0, "strategy": "Gambiarra", "explanation": "User describes using a script to bypass..." },
    { "index": 1, "strategy": "Refusal", "explanation": "Workers are refusing to log in..." }
  ]
}`;
