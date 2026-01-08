
import { SimulationService } from '../src/lib/simulation-service';
import { EcosystemActor, TranslationStage } from '../src/types/ecosystem';

// Mock Data
// Use valid types from EcosystemActor["type"]
const mockActors: EcosystemActor[] = [
    {
        id: '1', name: 'Central Hub', type: 'Policymaker', description: '',
        influence: 'High', // Changed to enum
        metrics: { influence: 10, alignment: 10, resistance: 0 }
    },
    {
        id: '2', name: 'Linked Node 1', type: 'Startup', description: '',
        influence: 'Medium',
        metrics: { influence: 5, alignment: 5, resistance: 0 }
    },
    {
        id: '3', name: 'Linked Node 2', type: 'Civil Society', description: '',
        influence: 'Medium',
        metrics: { influence: 5, alignment: 5, resistance: 0 }
    },
    {
        id: '4', name: 'Isolated Node', type: 'Academic', description: '',
        influence: 'Low',
        metrics: { influence: 2, alignment: 2, resistance: 0 }
    },
];

const mockLinks = [
    { source: '1', target: '2', value: 1 },
    { source: '1', target: '3', value: 1 },
];

const mockStages: TranslationStage[] = [
    {
        id: "1", label: "Stage 1", description: "Start", actors: [], ontology: "social",
        required_actor_types: ["Policymaker", "Startup", "Civil Society", "Academic"] // Expect 4
    },
    {
        id: "2", label: "Stage 2", description: "Filter", actors: [], ontology: "market",
        required_actor_types: ["Policymaker", "Startup", "Civil Society"] // Expect 3 (Loss: 1) -> 3/4 = 0.75
    },
    {
        id: "3", label: "Stage 3", description: "End", actors: [], ontology: "regulatory",
        required_actor_types: ["Policymaker"] // Expect 1 (Loss: 2) -> 1/3 = 0.33
    },
];

// Test Runner
async function runTests() {
    console.log('🧪 Starting Simulation Service Tests (v2)...\n');

    // TEST 1: Dynamic Power (Centrality)
    console.log('Test 1: Dynamic Power Calculation');
    const hydratedActors = SimulationService.calculateDynamicPower(mockActors, mockLinks);

    const hub = hydratedActors.find(a => a.id === '1');
    const iso = hydratedActors.find(a => a.id === '4');

    if (hub?.metrics?.dynamic_power && hub.metrics.dynamic_power > (iso?.metrics?.dynamic_power || 0)) {
        console.log('✅ PASS: Central hub has higher power than isolated node.');
        console.log(`   Hub Power: ${hub.metrics.dynamic_power} (Degree: 2)`);
        console.log(`   Iso Power: ${iso?.metrics?.dynamic_power} (Degree: 0)`);
    } else {
        console.error('❌ FAIL: Power calculation incorrect.');
    }
    console.log('');

    // TEST 2: Chain Fidelity
    console.log('Test 2: Chain Fidelity & Translation Loss');

    // Calculate fidelity
    const hydratedStages = SimulationService.calculateChainFidelity(mockStages, mockActors);

    // Stage 1: Baseline (1.0)
    // Stage 2: 3/4 = 0.75
    // Stage 3: 1/3 = 0.33

    const s2 = hydratedStages[1];
    const s3 = hydratedStages[2];

    const s2Fidelity = s2.fidelity_score || 0;
    const s3Fidelity = s3.fidelity_score || 0;

    // Check Stage 2 (Expected ~0.75)
    if (s2Fidelity >= 0.7 && s2Fidelity <= 0.8) {
        console.log(`✅ PASS: Stage 2 Fidelity correct (~0.75). Got: ${s2Fidelity}`);
        console.log(`   Betrayal Type: ${s2.betrayal_type} (Expected: Displacement/None)`);
    } else {
        console.error(`❌ FAIL: Stage 2 Fidelity expected ~0.75. Got: ${s2Fidelity}`);
    }

    // Check Stage 3 (Expected ~0.33)
    if (s3Fidelity < 0.5) {
        console.log(`✅ PASS: Stage 3 correctly identified as High Loss. Got: ${s3Fidelity}`);
        console.log(`   Betrayal Type: ${s3.betrayal_type} (Expected: Simplification)`);
    } else {
        console.error(`❌ FAIL: Stage 3 Fidelity expected low. Got: ${s3Fidelity}`);
    }

    // TEST 3: Hull Metrics (Stability & Porosity)
    console.log('Test 3: Hull Stability & Porosity (DR-A5)');

    // Create a mock config (Hull)
    const mockConfig = {
        id: "hull-1", name: "Connected Group", description: "",
        memberIds: ["1", "2", "3"], // Hub + 2 connected nodes
        properties: { stability: "High" as const, generativity: "Low" as const },
        color: "#000"
    };

    // Connections:
    // 1-2 (Internal)
    // 1-3 (Internal)
    // No external links in this mock set for these members?
    // Wait, mockLinks has:
    // 1->2 (Internal)
    // 1->3 (Internal)
    // Total Internal: 2. Max Internal (3 nodes): 3*2/2 = 3. Density: 2/3 = 0.66
    // External: 0. Porosity: 0.

    const hydratedConfigs = SimulationService.calculateHullMetrics([mockConfig], hydratedActors, mockLinks);
    const hullParams = hydratedConfigs[0].properties;

    if (hullParams.calculated_stability && hullParams.calculated_stability > 0.5) {
        console.log(`✅ PASS: Hull Stability calculated correctly. Got: ${hullParams.calculated_stability} (Expected ~0.66)`);
    } else {
        console.error(`❌ FAIL: Hull Stability low/missing. Got: ${hullParams.calculated_stability}`);
    }

    if (hullParams.porosity_index !== undefined && hullParams.porosity_index < 0.1) {
        console.log(`✅ PASS: Hull Porosity correct (0). Got: ${hullParams.porosity_index}`);
    } else {
        console.error(`❌ FAIL: Hull Porosity incorrect. Got: ${hullParams.porosity_index}`);
    }

    // Summary
    console.log('\nTests Completed.');
}

runTests().catch(console.error);
