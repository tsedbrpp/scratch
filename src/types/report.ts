import { Source, ResistanceSynthesisResult, AnalysisResult, EcosystemImpact } from "./index";
import { EcosystemActor, EcosystemConfiguration, CulturalHolesAnalysisResult } from "./ecosystem";
import { ComparisonResult as OntologyComparisonResult, OntologyData } from "./ontology";
import { SynthesisComparisonResult } from "./synthesis";

export type LensType = "structural" | "postcolonial" | "feminist" | "ecological" | "political_economy";

export interface ReportData {
    sources: Source[];
    resistance?: ResistanceSynthesisResult | null;
    ecosystem?: {
        actors: EcosystemActor[];
        configurations: EcosystemConfiguration[];
        culturalHoles: CulturalHolesAnalysisResult | null;
    };
    synthesis?: {
        comparison: SynthesisComparisonResult | null;
        ecosystemImpacts: EcosystemImpact[];
    };
    ontology?: {
        maps: Record<string, OntologyData>;
        comparison: OntologyComparisonResult | null;
    };
    multiLens?: {
        results: Record<LensType, AnalysisResult | null>;
        text: string;
    };
    cultural?: AnalysisResult | null;
}
