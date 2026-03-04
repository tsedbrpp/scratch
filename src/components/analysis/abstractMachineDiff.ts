type AbstractMachineStub = {
    diagram?: {
        operators?: unknown[];
        constraints?: unknown[];
        transformations?: unknown[];
    };
    [key: string]: unknown;
};

function namesFrom(arr: unknown[], fallbackPrefix: string): string[] {
    return (arr ?? []).map((x, i) => String((x as Record<string, unknown>)?.name ?? (x as Record<string, unknown>)?.id ?? `${fallbackPrefix}-${i}`));
}

function getBigrams(s: string): Set<string> {
    const b = new Set<string>();
    const str = s.toLowerCase();
    for (let i = 0; i < str.length - 1; i++) {
        b.add(str.slice(i, i + 2));
    }
    return b;
}

function stringSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    const tA = getBigrams(a);
    const tB = getBigrams(b);
    if (tA.size === 0 && tB.size === 0) return 1;
    if (tA.size === 0 || tB.size === 0) return 0;
    let intersection = 0;
    for (const t of tA) if (tB.has(t)) intersection++;
    return intersection / (tA.size + tB.size - intersection);
}

const SIMILARITY_THRESHOLD = 0.45;

function fuzzyPartitions(a: Set<string>, b: Set<string>) {
    const shared: string[] = [];
    const onlyA: string[] = [];
    const onlyB: string[] = [];
    const matchedB = new Set<string>();
    const arrayA = Array.from(a);
    const arrayB = Array.from(b);
    const aMatched = new Set<string>();

    // Pass 1: Exact matches (case-insensitive)
    for (const x of arrayA) {
        const xNorm = x.toLowerCase().trim();
        for (const y of arrayB) {
            if (matchedB.has(y)) continue;
            if (xNorm === y.toLowerCase().trim()) {
                shared.push(x);
                matchedB.add(y);
                aMatched.add(x);
                break;
            }
        }
    }

    // Pass 2: Fuzzy matches
    for (const x of arrayA) {
        if (aMatched.has(x)) continue;
        let bestMatch = null;
        let bestScore = 0;
        for (const y of arrayB) {
            if (matchedB.has(y)) continue;
            const score = stringSimilarity(x, y);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = y;
            }
        }
        if (bestMatch && bestScore >= SIMILARITY_THRESHOLD) {
            matchedB.add(bestMatch);
            aMatched.add(x);
            shared.push(`${x} (≈ ${bestMatch})`);
        } else {
            onlyA.push(x);
            aMatched.add(x);
        }
    }
    for (const y of b) {
        if (!matchedB.has(y)) onlyB.push(y);
    }
    return { shared: shared.sort(), onlyA: onlyA.sort(), onlyB: onlyB.sort() };
}

export function diffAbstractMachines(left: AbstractMachineStub, right: AbstractMachineStub) {
    const lOps = new Set<string>(namesFrom(left.diagram?.operators ?? [], "op"));
    const rOps = new Set<string>(namesFrom(right.diagram?.operators ?? [], "op"));

    const lCons = new Set<string>((left.diagram?.constraints as unknown[] ?? []).map((x: unknown) => String((x as Record<string, unknown>).rule || x)));
    const rCons = new Set<string>((right.diagram?.constraints as unknown[] ?? []).map((x: unknown) => String((x as Record<string, unknown>).rule || x)));

    const formatTransformation = (t: unknown, i: number) => {
        const tr = t as Record<string, unknown>;
        if (tr?.name) return String(tr.name);
        if (tr?.from && tr?.to) {
            const triggerText = tr.trigger ? ` via [${tr.trigger}]` : "";
            return `${tr.from} → ${tr.to}${triggerText}`;
        }
        return `tx-${i}`;
    };

    const lTrans = new Set<string>((left.diagram?.transformations ?? []).map(formatTransformation));
    const rTrans = new Set<string>((right.diagram?.transformations ?? []).map(formatTransformation));

    const opsDiff = fuzzyPartitions(lOps, rOps);
    const consDiff = fuzzyPartitions(lCons, rCons);
    const transDiff = fuzzyPartitions(lTrans, rTrans);

    const leftTokens = new Set<string>();
    const rightTokens = new Set<string>();
    const addTokens = (ops: any[], set: Set<string>) => {
        ops.forEach(op => {
            (op.inputs || []).forEach((t: any) => set.add(String(t)));
            (op.outputs || []).forEach((t: any) => set.add(String(t)));
        });
    };
    addTokens(left.diagram?.operators ?? [], leftTokens);
    addTokens(right.diagram?.operators ?? [], rightTokens);
    const tokensDiff = fuzzyPartitions(leftTokens, rightTokens);

    const sharedSpine = [
        ...opsDiff.shared.map((x) => `Operator: ${x}`),
        ...consDiff.shared.map((x) => `Constraint: ${x}`),
        ...transDiff.shared.map((x) => `Transformation: ${x}`),
        ...tokensDiff.shared.map((x) => `Token: ${x}`),
    ];

    const onlyInLeft = [
        ...opsDiff.onlyA.map((x) => `Operator: ${x}`),
        ...consDiff.onlyA.map((x) => `Constraint: ${x}`),
        ...transDiff.onlyA.map((x) => `Transformation: ${x}`),
        ...tokensDiff.onlyA.map((x) => `Token: ${x}`),
    ];

    const onlyInRight = [
        ...opsDiff.onlyB.map((x) => `Operator: ${x}`),
        ...consDiff.onlyB.map((x) => `Constraint: ${x}`),
        ...transDiff.onlyB.map((x) => `Transformation: ${x}`),
        ...tokensDiff.onlyB.map((x) => `Token: ${x}`),
    ];

    return {
        sharedSpine: opsDiff.shared,
        leftOnlyOps: opsDiff.onlyA,
        rightOnlyOps: opsDiff.onlyB,
        sharedCons: consDiff.shared,
        leftOnlyCons: consDiff.onlyA,
        rightOnlyCons: consDiff.onlyB,
        sharedTokens: tokensDiff.shared,
        leftOnlyTokens: tokensDiff.onlyA,
        rightOnlyTokens: tokensDiff.onlyB,
        textRepresentation: {
            sharedSpine,
            onlyInLeft,
            onlyInRight
        }
    };
}
