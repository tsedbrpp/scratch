export type TheoryMapMode = "journal" | "interactive";

export type DiagramNode = {
    id: string;
    kind: "actor" | "opp" | "document" | "blackbox" | "territory" | "layer" | "flight";
    x: number;
    y: number;
    label?: string;
};

export type DiagramEdge = {
    from: string;
    to: string;
    style: "solid" | "dashed" | "red" | "converging";
};

export type DiagramConfig = {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
};

export type TheoryPanelData = {
    id: string;
    title: string;
    tea: {
        term: string;
        referent: string;
        effect: string;
        embeddingScore: number;
        legibilityScore: number;
        legibilityType: "public" | "partial" | "distorted" | "market";
    };
    ant: {
        bullets: string[];
        diagramConfig: DiagramConfig;
    };
    assemblage: {
        bullets: string[];
        diagramConfig: DiagramConfig;
    };
    implication: string;
    theme: "emerald" | "sky" | "rose" | "amber";
};
