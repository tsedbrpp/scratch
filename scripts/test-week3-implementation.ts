
import { ANTTraceService } from '../src/lib/ant-trace-service';
import { AssemblageMechanismService } from '../src/lib/assemblage-mechanism-service';
import { ProvisionalWrapper } from '../src/lib/provisional-wrapper';

// Mock Data
const mockActors = [
    { id: '1', name: 'EU AI Act', type: 'Policymaker', description: 'Regulation' },
    { id: '2', name: 'OpenAI', type: 'Startup', description: 'AI Company' }
];

const mockLinks = [
    { source: '1', target: '2', type: 'regulates' }
];

async function testWeek3Implementation() {
    console.log("=== Testing Week 3 Implementation ===\n");

    // 1. Test ANT Trace Service directly
    console.log("1. Testing ANTTraceService...");
    const tracedActors = ANTTraceService.hydrateWithProvenance(mockActors as any, "ai_inference");
    const associations = ANTTraceService.traceAssociations(tracedActors, mockLinks as any);

    if (tracedActors[0].provisional) {
        console.log("  PASS: trace_metadata correctly added to actors");
    } else {
        console.error("  FAIL: trace_metadata missing");
    }

    if (associations.length === 1) {
        console.log("  PASS: Associations traced correctly");
    } else {
        console.error("  FAIL: Association tracing failed");
    }

    // 2. Test Provisional Wrapper
    console.log("\n2. Testing ProvisionalWrapper...");
    const inscription = ProvisionalWrapper.wrap("Test Narrative", "ai_generated", 0.6);

    if (inscription.fragility_score && inscription.fragility_score.value > 0) {
        console.log(`  PASS: Fragility Score calculated: ${(inscription.fragility_score.value * 100).toFixed(0)}% (${inscription.fragility_score.interpretation})`);
    } else {
        console.error("  FAIL: Fragility Score calculation failed");
    }

    // 3. Test Assemblage Mechanism Service
    console.log("\n3. Testing AssemblageMechanismService...");
    const mechanisms = AssemblageMechanismService.detectTerritorialization(tracedActors, associations, []);

    // We expect 0 mechanisms with this simple mock, but we check it doesn't crash
    console.log(`  PASS: Mechanism detection ran without error (Found: ${mechanisms.length})`);

    // 4. Simulate API Response Structure for /api/analyze/mechanisms
    console.log("\n4. Verifying API Response Structure...");
    const apiResponse = {
        success: true,
        mode: "assemblage_realist",
        detected_mechanisms: mechanisms,
        identified_capacities: [],
        provisional_status: inscription
    };

    if (apiResponse.provisional_status && apiResponse.provisional_status.fragility_score) {
        console.log("  PASS: API Response contains provisional_status for UI Badge");
    } else {
        console.error("  FAIL: API Response missing provisional_status");
    }

    console.log("\n=== Test Complete ===");
}

testWeek3Implementation().catch(console.error);
