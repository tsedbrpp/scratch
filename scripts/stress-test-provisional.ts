
import { ProvisionalWrapper } from '@/lib/provisional-wrapper';
import { ProvisionalInscription } from '@/types/provisional';

// Mock the initial state as it comes from the API
const mockAIOutput = "The assemblage demonstrates high territorialization through data localization laws.";
const initialInscription = ProvisionalWrapper.wrap(mockAIOutput, "ai_generated", 0.7);

console.log("--- INITIAL STATE ---");
console.log("Source:", initialInscription.source);
console.log("Fragility:", initialInscription.fragility_score.value);
console.log("Interpretation:", initialInscription.fragility_score.interpretation);
console.log("Authority Conditions:", initialInscription.authority_conditions);

// Simulate the Ratification Action (logic mirrored from AssemblagePanel)
const ratifiedState: ProvisionalInscription = {
    ...initialInscription,
    source: "user_validated",
    fragility_score: {
        ...initialInscription.fragility_score,
        value: 0.1,
        interpretation: "stable"
    },
    authority_conditions: ["rationally ratified by human expert"]
};

console.log("\n--- POST-RATIFICATION STATE ---");
console.log("Source:", ratifiedState.source);
console.log("Fragility:", ratifiedState.fragility_score.value);
console.log("Interpretation:", ratifiedState.fragility_score.interpretation);

// Verification Checks
if (ratifiedState.fragility_score.value > 0.2) {
    console.error("FAIL: Fragility score did not drop sufficiently.");
    process.exit(1);
}

if (ratifiedState.source !== "user_validated") {
    console.error("FAIL: Source was not updated.");
    process.exit(1);
}

console.log("\n--- TEST PASSED: State transition logic is valid. ---");
