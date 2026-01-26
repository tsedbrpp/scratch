
// Removed require, using mock implementation below

// Mock helpers to simulate the TS environment
function mockGenerateEdges(actors) {
    // Simplified logic from graph-utils.ts to avoid requiring local modules that might fail
    // We will just create a simple graph
    const edges = [];
    actors.forEach((source, i) => {
        actors.slice(i + 1).forEach((target) => {
            // Create random connections for testing
            if (Math.random() > 0.5) {
                edges.push({ source: source, target: target, label: "Relates", description: "Test" });
            }
        });
    });
    return edges;
}

// Actors
const actors = Array.from({ length: 10 }, (_, i) => ({ id: `node-${i}`, type: 'Startup' }));

// Edges
// Let's create a fixed set of edges to check calculation
const links = [
    { source: actors[0], target: actors[1], label: "Relates" }, // 0-1
    { source: actors[1], target: actors[2], label: "Relates" }, // 1-2
    { source: actors[2], target: actors[3], label: "Relates" }, // 2-3
    { source: actors[3], target: actors[4], label: "Relates" }, // 3-4
    { source: actors[4], target: actors[0], label: "Relates" }, // 4-0
    { source: actors[0], target: actors[5], label: "Relates" }, // 0-5 (External to group 0-1)
];

// Map to simplified links like in EcosystemMap
const simpleLinks = links.map(l => ({
    source: l.source.id,
    target: l.target.id,
    type: l.label
}));

// Function to calculate porosity
function calculatePorosity(memberIds) {
    const memberSet = new Set(memberIds);
    let internal = 0;
    let external = 0;

    simpleLinks.forEach(l => {
        const s = l.source;
        const t = l.target;
        const sIn = memberSet.has(s);
        const tIn = memberSet.has(t);

        if (sIn && tIn) internal++;
        else if (sIn || tIn) external++;
    });

    const total = internal + external;
    const porosity = total > 0 ? external / total : 0;

    return { internal, external, total, porosity };
}

console.log("--- Test Case 1: Group [node-0, node-1] ---");
// Links: 
// 0-1 (Internal) - Count 1
// 4-0 (External) - Count 1
// 0-5 (External) - Count 1
// 1-2 (External) - Count 1
// Total Links involving members: 4
// Internal: 1
// External: 3
// Porosity: 3/4 = 0.75
const result1 = calculatePorosity(['node-0', 'node-1']);
console.log(result1);

console.log("--- Test Case 2: Group [node-0] ---");
// Links:
// 0-1 (External)
// 4-0 (External)
// 0-5 (External)
// Total: 3
// Internal: 0
// External: 3
// Porosity: 3/3 = 1.0
const result2 = calculatePorosity(['node-0']);
console.log(result2);

console.log("--- Test Case 3: Group [node-0, node-1, node-2] ---");
// Links:
// 0-1 (Internal)
// 1-2 (Internal)
// 4-0 (External)
// 0-5 (External)
// 2-3 (External)
// Total: 5
// Internal: 2
// External: 3
// Porosity: 3/5 = 0.6
const result3 = calculatePorosity(['node-0', 'node-1', 'node-2']);
console.log(result3);
