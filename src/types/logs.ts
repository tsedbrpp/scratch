export interface ConflictResolutionLog {
    sessionId: string;
    analystId: string; // "ANALYST_04 (Positionality: ...)"
    targetDocument: string;
    timestamp: string;

    discrepancy: {
        metric: string;
        systemProposition: {
            placement: string;
            evidence: string;
            ontologicalSource: string;
        };
        humanAnchor: {
            placement: string;
            evidence: string;
            status: string;
        };
    };

    resolution: {
        action: "MANUAL_OVERRIDE" | "ACCEPTED_AI";
        finalValue: string;
    };

    justification: {
        rationale: string;
    };

    reflexivity: {
        epistemicCaptureFlag: boolean;
        systemNote: string;
        feedbackLoop: string;
    };
}

export interface MethodLogDetails {
    lens?: string;
    sourceCount?: number;
    statement?: string;
    discrepancy?: ConflictResolutionLog['discrepancy'];
    resolution?: ConflictResolutionLog['resolution'];
    justification?: string | { rationale: string };
    reflexivity?: ConflictResolutionLog['reflexivity'];
    agreement?: string;
    initial_impression?: string;
    [key: string]: unknown;
}

export interface MethodLog {
    id: string;
    action: string;
    details: MethodLogDetails;
    timestamp: string;
}
