import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Checks a given text string against the OpenAI Moderation endpoint.
 * Returns true if the content is flagged as inappropriate.
 * 
 * @param text The text to moderate.
 * @returns boolean - True if the content violates OpenAI moderation policies.
 */
export async function isContentFlagged(text: string): Promise<boolean> {
    try {
        const response = await openai.moderations.create({
            input: text,
        });

        // The response contains an array of results; we usually just check the first one.
        const result = response.results[0];
        if (result && result.flagged) {
            console.warn(`[MODERATION] Content flagged:`, result.categories);
            return true;
        }

        return false;
    } catch (error) {
        // If the moderation API fails, we log it, but typically we might want to fail closed or open.
        // For now, failing open (false) so standard service isn't entirely blocked by an API hiccup,
        // but you might want to throw an error depending on strictness requirements.
        console.error("[MODERATION API ERROR]", error);
        throw new Error("Failed to verify content safety.");
    }
}
