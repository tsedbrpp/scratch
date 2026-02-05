
/**
 * Verification Script for Meta-Governance Logic
 * 
 * Run this script to verify:
 * 1. Tenure Math Formula (Does it behave as expected?)
 * 2. Genesis Phases (Does the service correctly identify phases?)
 * 3. Voting Eligibility
 * 
 * Usage: npx tsx scripts/verify-governance.ts
 */

import { GovernanceService } from '../src/services/governance/governance-service';
import { TenureMath } from '../src/lib/governance/tenure-math';

async function runVerification() {
    console.log("🔍 Starting Meta-Governance Verification...\n");

    // 1. Verify Math Engine
    console.log("📊 1. Verifying Tenure Math Engine");
    console.log("-----------------------------------");
    const scenarios = [0, 30, 365, 730, 1460];

    scenarios.forEach(days => {
        const weight = TenureMath.calculateWeight(days);
        const { explanation } = TenureMath.getWeightExplanation(days);
        console.log(`Day ${days.toString().padEnd(4)} -> Weight: ${weight.toFixed(3)}x (${explanation})`);
    });
    console.log("\n");

    // 2. Verify Governance Service & Phases
    console.log("🏛️  2. Verifying Governance Service");
    console.log("-----------------------------------");
    const service = new GovernanceService();
    const currentPhase = service.getCurrentPhase();
    console.log(`Current System Phase: ${currentPhase}`);

    // 3. Verify User Registration & Voting Weights
    console.log("\n👤 3. Verifying User Profiles");
    console.log("-----------------------------------");
    const user = await service.registerUser('test-user-01');
    console.log(`New User Registered: ${user.userId} (${user.verificationStatus})`);
    console.log(`Voting Weight: ${service.calculateVotingPower(user)}x`);

    // Mocking tenure change
    user.tenureDays = 400;
    console.log(`User (simulated 400 days): ${service.calculateVotingPower(user)}x`);

    console.log("\n✅ Verification Complete.");
}

runVerification().catch(console.error);
