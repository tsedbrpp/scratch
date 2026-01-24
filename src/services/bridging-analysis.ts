
export interface DriftEvidence {
    rhetoric: string;
    reality: string;
    reasoning: string;
}

export interface DriftAnalysisResult {
    dimensionId: string;
    driftScore: number;
    summary: string;
    evidence: DriftEvidence;
}

export type AnalysisStatus = 'idle' | 'planning' | 'tracing' | 'done' | 'error';

export async function analyzeBridgingDrift(
    policyText: string,
    technicalText: string,
    onStatus: (status: string) => void,
    onResult: (result: DriftAnalysisResult) => void,
    onError: (error: string) => void
) {
    try {
        const response = await fetch('/api/analysis/bridging-chasm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ policyText, technicalText })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || response.statusText);
        }

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            const lines = buffer.split('\n\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonStr = line.slice(6);
                    try {
                        const message = JSON.parse(jsonStr);

                        if (message.type === 'status') {
                            onStatus(message.message);
                        } else if (message.type === 'result') {
                            onResult(message.data);
                        } else if (message.type === 'error') {
                            onError(message.message);
                        } else if (message.type === 'done') {
                            // Finished
                        }
                    } catch (e) {
                        console.warn("Failed to parse SSE message", e);
                    }
                }
            }
        }
    } catch (err) {
        onError(err instanceof Error ? err.message : "Stream connection failed");
    }
}
