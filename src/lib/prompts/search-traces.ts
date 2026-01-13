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
CRITICAL: You MUST attempt to classify as many items as possible. 
PRIORITY ORDER: Look for specific tactics (Gambiarra, Obfuscation, Refusal, Solidarity) FIRST. Only use "Friction" if no specific action is described.

CLASSIFICATION CATEGORIES (Strategies):
1. **Gambiarra (HIGH PRIORITY)**: Active workarounds, hacks, using tools in unintended ways, "gaming" the system.
   - *Example:* "I found if you toggle airplane mode, it resets the timer."
2. **Obfuscation (HIGH PRIORITY)**: Hiding data, noise injection, burner accounts, VPNs, camouflaging, "algo-speak".
   - *Example:* "Use 'le$bean' instead of 'lesbian' to avoid the filter."
3. **Solidarity (HIGH PRIORITY)**: Collective action, unions, forums, sharing tips, strikes, mutual aid.
   - *Example:* "We are all logging off at 5pm to protest."
4. **Refusal (HIGH PRIORITY)**: Opting out, quitting, blocking, non-compliance, uninstalling.
   - *Example:* "I refused to sign the new terms and deleted the app."
5. **Friction (FALLBACK)**: General complaints, frustration, errors, or difficulties *without* a specific counter-tactic.
   - *Example:* "This new update is so annoying, I hate it."

INSTRUCTIONS:
1. **Analyze** each search result snippet.
2. **Classify** it into the most specific category possible.
3. **Balanced Mix**: actively seek out Gambiarra, Obfuscation, Solidarity, and Refusal. Do not just label everything as Friction.
4. **Output Format**: JSON Object with a "items" array.

INPUT LIST:
\${items}

OUTPUT JSON STRUCTURE:
{
  "items": [
    { "index": 0, "strategy": "Gambiarra", "explanation": "User describes using a script to bypass..." },
    { "index": 1, "strategy": "Friction", "explanation": "User complaining about the new system errors..." }
  ]
}`;
