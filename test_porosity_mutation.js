
const assert = require('assert');

// Mock data
const actors = [
    { id: '1', type: 'A' },
    { id: '2', type: 'A' },
    { id: '3', type: 'B' }, // External
];

// Initial links (strings)
const links = [
    { source: '1', target: '2' }, // Internal
    { source: '1', target: '3' }  // External
];

// D3 Simulation Mock (Mutates links)
function simulateD3Mutation(links, actors) {
    links.forEach(l => {
        l.source = actors.find(a => a.id === l.source) || l.source;
        l.target = actors.find(a => a.id === l.target) || l.target;
    });
}

// Handler logic from EcosystemMap
function calculate(configurations, links) {
    return configurations.map(config => {
        const memberSet = new Set(config.memberIds);
        let internal = 0;
        let external = 0;

        links.forEach(l => {
            // Logic from EcosystemMap.tsx lines 157-158
            const s = typeof l.source === 'object' ? l.source.id : l.source;
            const t = typeof l.target === 'object' ? l.target.id : l.target;

            const sIn = memberSet.has(s);
            const tIn = memberSet.has(t);

            if (sIn && tIn) internal++;
            else if (sIn || tIn) external++;
        });

        const total = internal + external;
        const porosity = total > 0 ? external / total : 0;
        return { id: config.id, porosity, internal, external };
    });
}

// CONFIG 1: Members [1, 2]
const configs = [{ id: 'c1', memberIds: ['1', '2'] }];

console.log("--- Initial Calc (Strings) ---");
const res1 = calculate(configs, links);
console.log(res1[0]);
// Internal: 1-2 (1)
// External: 1-3 (1)
// Total 2. Porosity 0.5.
assert.strictEqual(res1[0].porosity, 0.5);

console.log("--- Mutating Links (D3 style) ---");
simulateD3Mutation(links, actors);
console.log("Link 0 source is now:", typeof links[0].source); // Should be object

console.log("--- Second Calc (Objects) ---");
// Simulate re-render with mutated links
const res2 = calculate(configs, links);
console.log(res2[0]);
assert.strictEqual(res2[0].porosity, 0.5);

console.log("--- Adding Member Mode ---");
// Add '3' to config
const configs2 = [{ id: 'c1', memberIds: ['1', '2', '3'] }];
const res3 = calculate(configs2, links);
console.log(res3[0]);
// Internal: 1-2, 1-3 (2)
// External: 0
// Porosity 0.
assert.strictEqual(res3[0].porosity, 0);

console.log("TEST PASSED");
