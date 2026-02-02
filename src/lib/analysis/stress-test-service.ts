
import OpenAI from 'openai';
import { PromptRegistry } from '@/lib/prompts/registry';
import { parseAnalysisResponse } from '@/lib/analysis-parser';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runStressTest(openai: OpenAI, userId: string, text: string, currentAnalysis: any, existingAnalysis: any = null) {
    console.log('[ANALYSIS] Running Stress Test sub-analyses...');
    const stressRes = currentAnalysis || {};
    const invertedText = stressRes.inverted_text_excerpt || stressRes.inverted_text;

    // 1. Analyze Inverted Text
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let invAnalysis: any = {};
    if (invertedText) {
        const dsfPrompt = await PromptRegistry.getEffectivePrompt(userId, 'dsf_lens');
        const invCompletion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o",
            messages: [
                { role: 'system', content: dsfPrompt },
                { role: 'user', content: `TEXT CONTENT: \n${invertedText} \n\nAnalyze this text using the Decolonial Situatedness Framework.` }
            ],
            response_format: { type: "json_object" }
        });
        invAnalysis = JSON.parse(invCompletion.choices[0]?.message?.content || '{}');
    } else {
        console.warn('[ANALYSIS WARNING] Stress test failed to generate inverted text.');
    }

    // 2. Analyze Original Text (Standard DSF)
    let origAnalysis = existingAnalysis;

    // [FIX] Check for verified quotes to ensure Audit functionality works
    const hasAuditData = origAnalysis && origAnalysis.verified_quotes && origAnalysis.verified_quotes.length > 0;

    if (origAnalysis && origAnalysis.governance_scores && hasAuditData) {
        console.log('[ANALYSIS] Utilizing EXISTING analysis (with Audit Data). Skipping re-run.');
    } else {
        if (!hasAuditData && origAnalysis) {
            console.log('[ANALYSIS] Existing analysis found but missing Audit Data (Verified Quotes). Forcing re-run to extract evidence.');
        } else {
            console.log('[ANALYSIS] No existing analysis provided. Re-running standard DSF...');
        }
        const dsfPrompt = await PromptRegistry.getEffectivePrompt(userId, 'dsf_lens');
        const origCompletion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o",
            messages: [
                { role: 'system', content: dsfPrompt },
                { role: 'user', content: `TEXT CONTENT: \n${text} \n\nAnalyze this text using the Decolonial Situatedness Framework.` }
            ],
            response_format: { type: "json_object" }
        });

        const rawContent = origCompletion.choices[0]?.message?.content || '{}';
        origAnalysis = parseAnalysisResponse(rawContent, 'dsf');

        if (!origAnalysis.governance_scores) {
            console.warn('[ANALYSIS WARNING] Standard DSF re-run failed to produce governance scores. Parsing likely failed.');
            origAnalysis.governance_scores = {
                centralization: 50, rights_focus: 50, flexibility: 50, market_power: 50, procedurality: 50
            };
        }
    }

    // 3. Compute Deviation
    const scoreA = origAnalysis.governance_scores?.market_power || 50;
    const scoreB = invAnalysis.governance_scores?.market_power || 50;
    const diff = Math.abs(scoreA - scoreB);

    // 4. Construct Final Object
    return {
        ...origAnalysis,
        stress_test_report: {
            original_score: scoreA,
            perturbed_score: scoreB,
            framing_sensitivity: diff > 30 ? "High" : (diff > 15 ? "Medium" : "Low"),
            shift_explanation: stressRes.shift_explanation || "No explanation provided.",
            inverted_text_excerpt: invertedText ? (invertedText.substring(0, 300) + "...") : "Generation failed",
            rhetorical_shifts: stressRes.rhetorical_shifts || []
        }
    };
}
