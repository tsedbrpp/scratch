
import { normalizeActorName, isActorMatch, mergeLinks } from '../lib/link_merge_utils';

function testNormalization() {
    console.log("--- Testing Normalization ---");
    const pairs = [
        ["Tesla Inc.", "tesla"],
        ["National Congress of Brazil", "national congress"],
        ["Communities near Brazilian data centers... (Absent)", "communities near brazilian data centers"],
        ["OpenAI ", "openai"],
        ["  Ministry of Finance; ", "ministry of finance"],
        ["Google LLC.", "google"]
    ];

    pairs.forEach(([raw, expected]) => {
        const result = normalizeActorName(raw);
        const match = isActorMatch(raw, expected);
        console.log(`[${match ? 'PASS' : 'FAIL'}] "${raw}" -> "${result}" (Matches "${expected}": ${match})`);
    });
}

function testMerging() {
    console.log("\n--- Testing Merging Logic ---");

    const actors: any[] = [
        {
            id: 'actor-1',
            name: 'Tesla Inc.',
            type: 'PrivateTech',
            potentialConnections: [
                { targetActor: 'National Congress', relationshipType: 'Advocates for', evidence: 'Quote from lobbying doc.' }
            ]
        },
        { id: 'actor-2', name: 'National Congress of Brazil', type: 'Policymaker' }
    ];

    const nameToIdMap = new Map();
    actors.forEach(a => nameToIdMap.set(normalizeActorName(a.name), a.id));

    const heuristicLinks = [
        { source: 'actor-1', target: 'actor-2', type: 'Coordinates', description: 'Default heuristic.' }
    ];

    const result = mergeLinks(heuristicLinks, actors, nameToIdMap);

    console.log("Merged Links Count:", result.length);
    const lobbyLink = result.find(l => l.type === 'Advocates for');

    if (lobbyLink) {
        console.log("[PASS] Found AI-enriched link with correct label:", lobbyLink.type);
        console.log("Evidence correctly mapped:", lobbyLink.analysis?.empiricalTraces[0] === 'Quote from lobbying doc.');
        console.log("Heuristic overlap suppressed:", result.length === 1);
    } else {
        console.log("[FAIL] AI-enriched link not found.");
    }

    // Testing Directionality
    console.log("\n--- Testing Directionality (Reversed) ---");
    const heuristicLinksRev = [
        { source: 'actor-2', target: 'actor-1', type: 'Coordinates' }
    ];
    const resultRev = mergeLinks(heuristicLinksRev, actors, nameToIdMap);
    const lobbyLinkRev = resultRev.find(l => l.type === 'Advocates for');
    if (lobbyLinkRev) {
        console.log("[PASS] Directional mismatch reconciled.");
    } else {
        console.log("[FAIL] Directional mismatch failed to reconcile.");
    }
}

testNormalization();
testMerging();
