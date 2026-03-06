"use client";

import React, { useEffect, useState } from "react";
import { ReportData } from "@/types/report";
import { EcosystemMap } from "@/components/ecosystem/EcosystemMap";
import { GovernanceCompass } from "@/components/policy/GovernanceCompass";
import { OntologyMap } from "@/components/ontology/OntologyMap";
import { TEADiagram } from "@/components/policy/TEADiagram";

interface HiddenExportVisualsProps {
    data: ReportData | null;
    isExporting: boolean;
}

export function HiddenExportVisuals({ data, isExporting }: HiddenExportVisualsProps) {
    if (!isExporting || !data) return null;

    // To prevent layout shift or weird scrollbars on the main dashboard,
    // we render everything in a fixed, invisible, unclickable container that is 
    // positioned way off-screen but still fully in the DOM for html2canvas to read.

    // Aggregate Ontology Data
    let mergedOntoNodes: any[] = [];
    let mergedOntoLinks: any[] = [];
    if (data.ontology?.maps) {
        Object.values(data.ontology.maps).forEach(mapObj => {
            mergedOntoNodes = mergedOntoNodes.concat(mapObj.nodes || []);
            mergedOntoLinks = mergedOntoLinks.concat(mapObj.links || []);
        });
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '1200px', // Force a wide responsive layout for good standard chart aspect ratios
            pointerEvents: 'none',
            zIndex: -9999
        }}>

            {/* 1. Governance Compass (First Source Fallback) */}
            {data.sources[0]?.analysis?.governance_scores && (
                <div className="bg-white p-4 w-[800px] h-[600px]">
                    <GovernanceCompass
                        rhetoricScore={(data.sources[0].analysis.governance_scores as any).rhetoric || data.sources[0].analysis.governance_scores.rights_focus || 50}
                        realityScore={(data.sources[0].analysis.governance_scores as any).reality || (data.sources[0].analysis.governance_scores as any).technical_reality || 50}
                        driftExplanation={(data.sources[0].analysis.governance_scores as any).drift_explanation || "No explanation provided"}
                        scoreExplanations={{
                            rhetoric: "Rhetorical Posture",
                            reality: "Technical Reality"
                        }}
                    />
                </div>
            )}

            {/* 2. Ecosystem Map */}
            {data.ecosystem?.actors && data.ecosystem?.configurations && (
                <div id="ecosystem-map-canvas" className="bg-white p-4 w-[1200px] h-[800px]">
                    <EcosystemMap
                        actors={data.ecosystem.actors}
                        configurations={data.ecosystem.configurations}
                        absenceAnalysis={data.ecosystem.absenceAnalysis!}
                        interactionMode="select"
                        setInteractionMode={() => { }}
                        selectedForGrouping={[]}
                        onToggleSelection={() => { }}
                        onCreateConfiguration={() => { }}
                        onActorDrag={() => { }}
                        onConfigDrag={() => { }}
                    />
                </div>
            )}

            {/* 3. Ontology Map */}
            {data.ontology?.maps && (
                <div id="ontology-map-canvas" className="bg-white p-4 w-[1200px] h-[800px] relative">
                    <OntologyMap
                        nodes={mergedOntoNodes}
                        links={mergedOntoLinks}
                        selectedCategory={null}
                        onSelectCategory={() => { }}
                        selectedNodeId={null}
                        onSelectNode={() => { }}
                    />
                </div>
            )}

            {/* 4. TEA Diagram */}
            {data.teaAnalysis && (
                <div id="tea-diagram-export" className="bg-white p-6 w-[1400px]">
                    <TEADiagram data={data.teaAnalysis} />
                </div>
            )}

        </div>
    );
}
