import { AnalysisResult } from "@/types";
import { AlertTriangle } from "lucide-react";

export function StressTestSection({ report }: { report: NonNullable<AnalysisResult['stress_test_report']> }) {
    // Helper to clean potential JSON artifacts from the text
    const cleanText = (text: string): string => {
        try {
            if (!text || typeof text !== 'string') return text;

            const trimmed = text.trim();
            // 1. Try recursive JSON Parse
            if (trimmed.startsWith('{') || trimmed.startsWith('"')) {
                const parsed = JSON.parse(text);
                if (parsed && typeof parsed === 'object' && parsed.inverted_text) {
                    return cleanText(parsed.inverted_text);
                }
                if (typeof parsed === 'string' && parsed !== text) {
                    return cleanText(parsed);
                }
            }
            return text;
        } catch (e) {
            // 2. Regex Fallback for malformed/dirty JSON
            // Look for: "inverted_text": "CAPTURE_THIS"
            const match = text.match(/"inverted_text"\s*:\s*"((?:[^"\\]|\\.)*)"/);
            if (match && match[1]) {
                try {
                    // Try to standard unescape by wrapping as valid JSON string
                    return JSON.parse(`"${match[1]}"`);
                } catch {
                    // Manual unescape if that fails
                    return match[1]
                        .replace(/\\"/g, '"')
                        .replace(/\\n/g, '\n')
                        .replace(/\\\\/g, '\\');
                }
            }

            // 3. Brute force strip if the key exists but regex failed
            if (text.includes('inverted_text"')) {
                return text
                    .replace(/.*"inverted_text"\s*:\s*"/, '') // Remove header
                    .replace(/"\s*\}?$/, '') // Remove trailer
                    .replace(/\\"/g, '"')
                    .replace(/\\n/g, '\n');
            }

            return text;
        }
    };

    return (
        <div className="rounded-xl border border-red-200 bg-red-50/10 overflow-hidden">
            <div className="bg-red-100/30 px-4 py-3 border-b border-red-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-700" />
                    <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider">Consistency Stress-Test (Adversarial Framing)</h4>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${report.framing_sensitivity === 'High' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                    Sensitivity: {report.framing_sensitivity}
                </span>
            </div>

            {/* Explanation of the Test */}
            <div className="mx-4 mt-4 p-3 bg-red-50/50 rounded-lg border border-red-100 text-xs text-red-900/80 leading-relaxed">
                <p>
                    <strong>Analysis:</strong> {getInterpretation(report)}
                </p>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                    <div>
                        <strong>• Sensitivity:</strong> {report.framing_sensitivity}
                    </div>
                    <div>
                        <strong>• Shift:</strong> {report.original_score} (Original) → {report.perturbed_score} (Inverted)
                    </div>
                </div>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4">
                <div>
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Inverted Rhetoric Sample</h5>
                    <p className="text-xs font-mono text-slate-600 bg-white p-2 rounded border border-slate-200 leading-relaxed whitespace-pre-wrap">
                        &quot;{cleanText(report.inverted_text_excerpt)}&quot;
                    </p>
                </div>
                <div>
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Score Deviation</h5>
                    <div className="flex items-center justify-center h-20 bg-white rounded border border-slate-200">
                        <div className="text-center">
                            <div className="text-xs text-slate-400 uppercase">Shift in Market Power</div>
                            <div className="text-lg font-bold text-slate-700">
                                {Math.abs(report.original_score - report.perturbed_score)} pts
                            </div>
                        </div>
                    </div>
                </div>

                {report.rhetorical_shifts && report.rhetorical_shifts.length > 0 && (
                    <div className="col-span-2 mt-2">
                        <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Key Rhetorical Shifts</h5>
                        <div className="space-y-2">
                            {report.rhetorical_shifts.map((shift, idx) => (
                                <div key={idx} className="bg-white p-3 rounded border border-slate-200 text-xs">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="line-through text-slate-400">{shift.original}</span>
                                        <span className="text-slate-300">→</span>
                                        <span className="font-bold text-red-700 bg-red-50 px-1 rounded">{shift.new}</span>
                                    </div>
                                    <p className="text-slate-600 text-[10px] italic">{shift.explanation}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
}

function getInterpretation(report: AnalysisResult['stress_test_report']): string {
    if (!report) return "No data available.";

    // [Fixed] We prioritize the calculated score interpretation because the AI's narrative 
    // often hallucinates fragility even when the score shift is low. 
    // The measurement is the ground truth.
    // if (report.shift_explanation && report.shift_explanation.length > 20) {
    //     return report.shift_explanation;
    // }

    const diff = report.original_score - report.perturbed_score;
    const absDiff = Math.abs(diff);

    if (report.framing_sensitivity === 'High') {
        return "CRITICAL FRAGILITY: This document's authority is highly dependent on its specific rhetorical framing. When the 'tone' is inverted, its perceived power collapses. This suggests the policy relies more on persuasive language than robust structural mechanisms.";
    }

    if (report.framing_sensitivity === 'Medium') {
        if (diff > 0) {
            return "MODERATE DEPENDENCY: The document shows some reliance on rhetoric. Inverting the framing weakens its authority (dropping " + absDiff + " points), suggesting that while it has some structural teeth, a hostile interpretation could successfully undermine it.";
        } else {
            return "UNUSUAL RESULT: The adversarial inversion actually INCREASED the perceived market power. This might suggest the original text was written too defensively or modestly, effectively 'hiding' its own potential power.";
        }
    }

    // Low Sensitivity
    return "ROBUST STRUCTURE: This document is extremely stable. Even when rewritten with hostile input, its core power dynamics remain largely unchanged. The mechanisms described are likely concrete and specific enough to survive 'spin'.";
}
