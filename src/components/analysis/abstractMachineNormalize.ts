export type Compat = "ok" | "coerced" | "incompatible";

type AnyObj = Record<string, any>;

export function normalizeAbstractMachine(input: unknown): { normalized: AnyObj | null; compat: Compat } {
    if (!input || typeof input !== "object") return { normalized: null, compat: "incompatible" };

    const am = input as AnyObj;
    let coerced = false;

    // Ensure top-level structure exists
    if (!am.diagram || typeof am.diagram !== "object") {
        am.diagram = {};
        coerced = true;
    }

    const ensureArray = (obj: AnyObj, key: string) => {
        if (!Array.isArray(obj[key])) {
            obj[key] = [];
            coerced = true;
        }
    };

    ensureArray(am.diagram, "operators");
    ensureArray(am.diagram, "constraints");
    ensureArray(am.diagram, "transformations");

    // Optional fields; keep stable
    if (!am.version) {
        am.version = "unknown";
        coerced = true;
    }

    return { normalized: am, compat: coerced ? "coerced" : "ok" };
}
