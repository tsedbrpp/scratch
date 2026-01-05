import { Source, ResistanceSynthesisResult, AnalysisResult, EcosystemImpact } from "./index";
import { EcosystemActor, EcosystemConfiguration, CulturalHolesAnalysisResult, AiAbsenceAnalysis, AssemblageAnalysis } from "./ecosystem";
import { CulturalAnalysisResult } from "./cultural";
import { ComparisonResult as OntologyComparisonResult, OntologyData } from "./ontology";
import { SynthesisComparisonResult } from "./synthesis";
import { MethodLog } from "./logs";
import { ResistanceArtifact } from "./resistance";

export type LensType = "dsf" | "cultural_framing" | "institutional_logics" | "legitimacy";

export interface ReportData {
    sources: Source[];
    resistance?: ResistanceSynthesisResult | null;
    ecosystem?: {
        actors: EcosystemActor[];
        configurations: EcosystemConfiguration[];
        culturalHoles: CulturalHolesAnalysisResult | null;
        absenceAnalysis?: AiAbsenceAnalysis | null;
        assemblage?: AssemblageAnalysis | null;
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
    cultural?: CulturalAnalysisResult | null;
    logs?: MethodLog[];
    resistanceArtifacts?: ResistanceArtifact[];
}

export interface ReportSectionSelection {
    documentAnalysis: boolean;
    comparisonMatrix: boolean;
    synthesis: boolean;
    resistance: boolean;
    ecosystem: boolean;
    cultural: boolean;
    ontology: boolean;
    multiLens: boolean;
    scenarios: boolean;
    logs: boolean;
    configurations: boolean;
    resistanceArtifacts: boolean;
}
