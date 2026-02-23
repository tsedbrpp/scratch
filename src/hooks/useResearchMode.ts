import { useState, useEffect, useCallback } from 'react';
import { get, set, clear } from 'idb-keyval';
import { StudyState, GhostNodeSurveyResponse, STUDY_CASES, StudyCase, SurveyResponseData, GhostNodeSurveyResponseSchema } from '@/lib/study-config';
import { saveStudyBackup, getStudyBackup, deleteStudyData } from '@/app/actions/research';

const STORAGE_KEY = 'instant_tea_research_store';

// V2 Legacy Migration Helper
function migrateStudyState(state: StudyState): StudyState {
    if (!state.responses) return state;
    const migratedResponses = { ...state.responses };
    Object.keys(migratedResponses).forEach(key => {
        const res = migratedResponses[key];
        if (res.absenceGate === undefined) res.absenceGate = 'unsure';
        if (res.feasibility === undefined) res.feasibility = 0;
    });
    return { ...state, responses: migratedResponses };
}

// Linear Congruential Generator constants
const LCG_MUL = 1664525;
const LCG_INC = 1013904223;
const LCG_MOD = 4294967296;

function seededRandom(seed: number) {
    let state = seed;
    return () => {
        state = (LCG_MUL * state + LCG_INC) % LCG_MOD;
        return state / LCG_MOD;
    };
}

// Fisher-Yates shuffle with seeded RNG
function shuffle<T>(array: T[], seed: number): T[] {
    const rng = seededRandom(seed);
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Simple numeric hash for the seed
function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

const INITIAL_STATE: StudyState = {
    evaluatorCode: null,
    consentGiven: false,
    consentTimestamp: null,
    profile: null,
    playlist: [],
    currentCaseIndex: -1, // -1 indicates onboarding/calibration not started
    responses: {},
    isComplete: false,
};

export function useResearchMode(fallbackCases?: StudyCase[]) {
    const [state, setState] = useState<StudyState>(INITIAL_STATE);
    const [isLoading, setIsLoading] = useState(true);

    // Load state from IndexedDB on mount
    useEffect(() => {
        const loadState = async () => {
            try {
                const savedState = await get<StudyState>(STORAGE_KEY);
                if (savedState) {
                    setState(migrateStudyState(savedState));
                } else {
                    setState(INITIAL_STATE);
                }
            } catch (error) {
                console.error('Failed to load research state:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadState();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            set(STORAGE_KEY, state).catch(err => console.error('Failed to save state:', err));
        }
    }, [state, isLoading]);



    const login = useCallback((code: string, customCases?: StudyCase[]) => {
        const sourceCases = customCases && customCases.length > 0 ? customCases : STUDY_CASES;

        const calibrationCase = sourceCases.find(c => c.isCalibration);
        const coreCases = sourceCases.filter(c => !c.isCalibration);

        const seed = hashCode(code);
        const shuffledIds = shuffle(coreCases.map(c => c.id), seed);

        // Playlist: Calibration (if exists) -> Shuffled Core Cases
        const finalPlaylist = calibrationCase ? [calibrationCase.id, ...shuffledIds] : shuffledIds;

        setState(() => {
            const nextState = {
                ...INITIAL_STATE,
                evaluatorCode: code,
                playlist: finalPlaylist,
                currentCaseIndex: 0,
                customCases: customCases
            };
            saveStudyBackup(nextState).catch(err => console.error("Auto-backup failed:", err));
            return nextState;
        });
    }, []);

    const giveConsent = useCallback(() => {
        setState(prev => ({
            ...prev,
            consentGiven: true,
            consentTimestamp: Date.now()
        }));
    }, []);

    const saveProfile = useCallback((profile: StudyState['profile']) => {
        setState(prev => ({
            ...prev,
            profile,
            // Assuming profile is done before login/calibration? 
            // The plan says: Consent -> Onboarding (Profile) -> Calibration
            // So profile save might happen before or after login?
            // "EvaluatorLoginDialog" comes first in plan generally.
        }));
    }, []);

    const submitResponse = useCallback((caseId: string, responseData: SurveyResponseData) => {
        setState(prev => {
            // Check if currentCaseId is valid/needed or remove
            // const currentCaseId = prev.playlist[prev.currentCaseIndex];

            const fullResponse: GhostNodeSurveyResponse = {
                ...responseData,
                studyId: 'v5.0-hybrid',
                evaluatorId: prev.evaluatorCode ? hashCode(prev.evaluatorCode).toString(16) : 'anon',
                caseId: caseId,
                caseIndex: prev.playlist.indexOf(caseId),
                submittedAt: Date.now(),
                // timeOnCaseMs needs to be calculated by component or state tracking
                timeOnCaseMs: 0 // Placeholder, component should pass this ideally
            };

            // V2 Payload Validation
            try {
                GhostNodeSurveyResponseSchema.parse(fullResponse);
            } catch (validationError) {
                console.error("Zod Validation Error: Invalid Survey Response Payload", validationError);
                // In production, we should probably stop the save or alert the user.
                // For now, we log the schema error so developers can catch malformed submits.
            }

            const newResponses = { ...prev.responses, [caseId]: fullResponse };

            // [Fix] Do NOT auto-set isComplete here. 
            // Completion is now an explicit action triggered by the user via completeStudy().
            // This prevents the modal from closing while typing in the last case.

            const nextState = {
                ...prev,
                responses: newResponses,
            };

            saveStudyBackup(nextState).catch(err => console.error("Auto-backup failed:", err));
            return nextState;
        });
    }, []);

    const nextCase = useCallback(() => {
        setState(prev => {
            if (prev.currentCaseIndex < prev.playlist.length - 1) {
                const nextState = { ...prev, currentCaseIndex: prev.currentCaseIndex + 1 };
                saveStudyBackup(nextState).catch(err => console.error("Auto-backup failed:", err));
                return nextState;
            }
            return prev;
        });
    }, []);

    const prevCase = useCallback(() => {
        setState(prev => {
            if (prev.currentCaseIndex > 0) {
                return { ...prev, currentCaseIndex: prev.currentCaseIndex - 1 };
            }
            return prev;
        });
    }, []);

    const importState = useCallback((importedState: StudyState, fallbackCases?: StudyCase[]) => {
        const finalState = migrateStudyState({ ...importedState });
        // If imported state doesn't have customCases but playlist refers to them, try to use fallback
        if ((!finalState.customCases || finalState.customCases.length === 0) && fallbackCases) {
            finalState.customCases = fallbackCases;
        }
        setState(finalState);
    }, []);

    const logout = useCallback(async () => {
        await clear();
        setState(INITIAL_STATE);
    }, []);

    const resetStudy = useCallback(async () => {
        if (state.evaluatorCode) {
            await deleteStudyData(state.evaluatorCode);
        }
        await clear();
        setState(INITIAL_STATE);
    }, [state.evaluatorCode]);

    const completeStudy = useCallback(() => {
        setState(prev => {
            const nextState = { ...prev, isComplete: true };
            saveStudyBackup(nextState).catch(err => console.error("Auto-backup failed:", err));
            return nextState;
        });
    }, []);

    // const currentCaseId = state.playlist[state.currentCaseIndex];
    // Look up in customCases if available, otherwise fallbackCases or static STUDY_CASES
    const availableCases = state.customCases || fallbackCases || STUDY_CASES;
    const currentCase = availableCases.find(c => c.id === state.playlist[state.currentCaseIndex]);

    const restoreSession = useCallback(async (code: string, fallbackCases?: StudyCase[]) => {
        setIsLoading(true);
        try {
            const backup = await getStudyBackup(code);
            if (backup) {
                // Verify it has necessary fields
                if (backup.playlist && backup.evaluatorCode === code) {
                    const finalState = migrateStudyState({ ...backup });
                    if ((!finalState.customCases || finalState.customCases.length === 0) && fallbackCases && fallbackCases.length > 0) {
                        finalState.customCases = fallbackCases;
                    }
                    setState(finalState);
                    return true;
                }
            }
        } catch (err) {
            console.error("Failed to restore session:", err);
        } finally {
            setIsLoading(false);
        }
        return false;
    }, []);

    const debugCompleteStudy = useCallback(() => {
        setState(prev => {
            const newResponses = { ...prev.responses };
            prev.playlist.forEach((caseId, index) => {
                if (!newResponses[caseId]) {
                    newResponses[caseId] = {
                        studyId: 'debug-fast-test',
                        evaluatorId: prev.evaluatorCode ? hashCode(prev.evaluatorCode).toString(16) : 'debug',
                        caseId: caseId,
                        caseIndex: index,
                        startedAt: Date.now() - 5000,
                        strength: 75,
                        confidence: 'high',
                        missingRoles: ['representation', 'standard_setting'],
                        missingRolesOther: 'Debug auto-fill response',
                        isUncertain: false,
                        institutionalLogics: {
                            market: 'weak',
                            state: 'moderate',
                            professional: 'dominant',
                            community: null
                        },
                        reflexivity: 'This is an automated debug response for fast testing.',
                        submittedAt: Date.now(),
                        timeOnCaseMs: 1000
                    };
                }
            });

            return {
                ...prev,
                responses: newResponses,
                isComplete: true,
                currentCaseIndex: prev.playlist.length - 1
            };
        });
    }, []);

    return {
        state,
        isLoading,
        login,
        giveConsent,
        saveProfile,
        submitResponse,
        prevCase,
        importState,
        logout, // [NEW]
        resetStudy,
        nextCase,
        completeStudy,
        debugCompleteStudy, // [NEW]
        restoreSession,
        currentCase,
        cases: availableCases
    };
}
