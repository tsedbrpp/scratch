import { GhostNodeSurveyResponse } from './study-config';

export interface CsvFlattenOptions {
    arrayDelimiter?: string;
    nullValue?: string;
    includeJsonColumn?: boolean;
    includeConfigColumns?: boolean;
}

export interface FlattenedCsv {
    headers: string[];
    rows: Record<string, any>[];
}

export function flattenGhostNodeSurveyResponsesToCsv(
    responses: GhostNodeSurveyResponse[],
    opts?: CsvFlattenOptions
): FlattenedCsv {
    const arrayDelimiter = opts?.arrayDelimiter || '|';
    const nullValue = opts?.nullValue || '';
    const includeJsonColumn = opts?.includeJsonColumn ?? true;

    // V2 Base Headers
    const headers = [
        'surveyVersion', 'evaluatorId', 'studyId', 'caseId', 'caseIndex',
        'startedAt', 'submittedAt', 'timeOnCaseMs',
        'strength', 'confidence', 'missingRoles', 'missingRolesOther', 'isUncertain',
        'logics_market', 'logics_state', 'logics_professional', 'logics_community',
        'reflexivity', 'absenceGate', 'selectedQuoteId', 'disambiguationAnswers',
        'feasibility', 'feasibleMechanisms', 'feasibilityNotes'
    ];

    // V3 Extension Headers - explicitly mapped for deterministic columns
    const v3Headers = [
        'groundingGate', 'evidenceAnchor',
        'euAiActOmissionAgreement', 'euAiActOmissionEvidence', 'perceivedGaps', 'perceivedGapsOtherText', 'perceivedGapsNuance', 'broaderImplications',
        'counterfactualFeasibility', 'counterfactualFactorsTechnical', 'counterfactualFactorsLegal', 'counterfactualFactorsSocial', 'counterfactualFactorsEconomic',
        // Mechanism Table
        'mech_evidence_collection_status', 'mech_evidence_collection_effectiveness', 'mech_evidence_collection_improvements', 'mech_evidence_collection_risks',
        'mech_aggregation_status', 'mech_aggregation_effectiveness', 'mech_aggregation_improvements', 'mech_aggregation_risks',
        'mech_admissibility_status', 'mech_admissibility_effectiveness', 'mech_admissibility_improvements', 'mech_admissibility_risks',
        'mech_review_initiation_status', 'mech_review_initiation_effectiveness', 'mech_review_initiation_improvements', 'mech_review_initiation_risks',
        'mech_response_due_process_status', 'mech_response_due_process_effectiveness', 'mech_response_due_process_improvements', 'mech_response_due_process_risks',
        'mech_remedy_enforcement_status', 'mech_remedy_enforcement_effectiveness', 'mech_remedy_enforcement_improvements', 'mech_remedy_enforcement_risks',
        'mech_deterrence_status', 'mech_deterrence_effectiveness', 'mech_deterrence_improvements', 'mech_deterrence_risks',
        // Escalation
        'enforcementEscalation', 'enforcementEscalationOtherText', 'enforcementNuance',
        // Impacts Table
        'beneficiariesExclusion', 'beneficiariesNuance',
        'impact_env_status', 'impact_env_direction', 'impact_env_severity', 'impact_env_examples',
        'impact_econ_status', 'impact_econ_direction', 'impact_econ_severity', 'impact_econ_examples',
        'impact_soc_status', 'impact_soc_direction', 'impact_soc_severity', 'impact_soc_examples',
        'impact_legal_status', 'impact_legal_direction', 'impact_legal_severity', 'impact_legal_examples',
        // Challenges & Confidence
        'analyticalChallenges', 'analyticalChallengesOtherText', 'analyticalChallengesMitigations',
        'scenarioConfidence', 'scenarioConfidenceNuance',
        // Suggestions
        'innovativeIdeas', 'crossDisciplinaryInsights', 'finalComments'
    ];

    headers.push(...v3Headers);

    if (includeJsonColumn) {
        headers.push('response_json');
    }

    const rows = responses.map((r) => {
        const row: Record<string, any> = {};

        const setVal = (key: string, val: any) => {
            if (val === null || val === undefined) {
                row[key] = nullValue;
            } else if (Array.isArray(val)) {
                row[key] = val.join(arrayDelimiter);
            } else if (typeof val === 'object') {
                row[key] = JSON.stringify(val);
            } else {
                row[key] = val;
            }
        };

        const isV3 = 'surveyVersion' in r && r.surveyVersion === 'v3';
        const v3Data = isV3 ? r as any : {};

        // Base 
        setVal('surveyVersion', isV3 ? 'v3' : 'v2');
        setVal('evaluatorId', r.evaluatorId);
        setVal('studyId', r.studyId);
        setVal('caseId', r.caseId);
        setVal('caseIndex', r.caseIndex);
        setVal('startedAt', r.startedAt ? new Date(r.startedAt).toISOString() : nullValue);
        setVal('submittedAt', r.submittedAt ? new Date(r.submittedAt).toISOString() : nullValue);
        setVal('timeOnCaseMs', r.timeOnCaseMs);

        setVal('strength', r.strength);
        setVal('confidence', r.confidence);
        setVal('missingRoles', r.missingRoles);
        setVal('missingRolesOther', r.missingRolesOther);
        setVal('isUncertain', r.isUncertain);

        setVal('logics_market', r.institutionalLogics?.market);
        setVal('logics_state', r.institutionalLogics?.state);
        setVal('logics_professional', r.institutionalLogics?.professional);
        setVal('logics_community', r.institutionalLogics?.community);

        setVal('reflexivity', r.reflexivity);
        setVal('absenceGate', r.absenceGate);
        setVal('selectedQuoteId', r.selectedQuoteId);
        setVal('disambiguationAnswers', r.disambiguationAnswers);

        setVal('feasibility', r.feasibility);
        setVal('feasibleMechanisms', r.feasibleMechanisms);
        setVal('feasibilityNotes', r.feasibilityNotes);

        // V3 specific scalar fields
        if (isV3) {
            setVal('groundingGate', v3Data.groundingGate);
            setVal('evidenceAnchor', v3Data.evidenceAnchor);
            setVal('euAiActOmissionAgreement', v3Data.euAiActOmissionAgreement);
            setVal('euAiActOmissionEvidence', v3Data.euAiActOmissionEvidence);
            setVal('perceivedGaps', v3Data.perceivedGaps);
            setVal('perceivedGapsOtherText', v3Data.perceivedGapsOtherText);
            setVal('perceivedGapsNuance', v3Data.perceivedGapsNuance);
            setVal('broaderImplications', v3Data.broaderImplications);

            setVal('counterfactualFeasibility', v3Data.counterfactualFeasibility);
            setVal('counterfactualFactorsTechnical', v3Data.counterfactualFactorsTechnical);
            setVal('counterfactualFactorsLegal', v3Data.counterfactualFactorsLegal);
            setVal('counterfactualFactorsSocial', v3Data.counterfactualFactorsSocial);
            setVal('counterfactualFactorsEconomic', v3Data.counterfactualFactorsEconomic);

            // Mechanism table unwrapping
            const mechList = ['evidence_collection', 'aggregation', 'admissibility', 'review_initiation', 'response_due_process', 'remedy_enforcement', 'deterrence'];
            mechList.forEach(m => {
                const cell = v3Data[`mechanismEval_${m}`];
                setVal(`mech_${m}_status`, cell?.status);
                setVal(`mech_${m}_effectiveness`, cell?.effectiveness);
                setVal(`mech_${m}_improvements`, cell?.improvements);
                setVal(`mech_${m}_risks`, cell?.risks);
            });

            setVal('enforcementEscalation', v3Data.enforcementEscalation);
            setVal('enforcementEscalationOtherText', v3Data.enforcementEscalationOtherText);
            setVal('enforcementNuance', v3Data.enforcementNuance);

            setVal('beneficiariesExclusion', v3Data.beneficiariesExclusion);
            setVal('beneficiariesNuance', v3Data.beneficiariesNuance);

            // Impact table unwrapping
            const impList = ['environmental', 'economic', 'social', 'legal_regulatory'];
            const impMap: Record<string, string> = { 'environmental': 'env', 'economic': 'econ', 'social': 'soc', 'legal_regulatory': 'legal' };
            impList.forEach(i => {
                const cell = v3Data[`impact_${i}`];
                const pre = `impact_${impMap[i]}`;
                setVal(`${pre}_status`, cell?.status);
                setVal(`${pre}_direction`, cell?.direction);
                setVal(`${pre}_severity`, cell?.severity);
                setVal(`${pre}_examples`, cell?.examples);
            });

            setVal('analyticalChallenges', v3Data.analyticalChallenges);
            setVal('analyticalChallengesOtherText', v3Data.analyticalChallengesOtherText);
            setVal('analyticalChallengesMitigations', v3Data.analyticalChallengesMitigations);

            setVal('scenarioConfidence', v3Data.scenarioConfidence);
            setVal('scenarioConfidenceNuance', v3Data.scenarioConfidenceNuance);

            setVal('innovativeIdeas', v3Data.innovativeIdeas);
            setVal('crossDisciplinaryInsights', v3Data.crossDisciplinaryInsights);
            setVal('finalComments', v3Data.finalComments);
        }

        if (includeJsonColumn) {
            setVal('response_json', r);
        }

        return row;
    });

    return { headers, rows };
}

export function generateCsvString(flattened: FlattenedCsv): string {
    const headerRow = flattened.headers.join(',') + '\n';
    const dataRows = flattened.rows.map((row) => {
        return flattened.headers.map((header) => {
            let cell = row[header] || '';
            // Escape quotes and wrap in quotes if there are commas or quotes
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
                cell = `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        }).join(',');
    }).join('\n');
    return headerRow + dataRows;
}
