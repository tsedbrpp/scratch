import { AssemblageMechanism, AssemblageCapacity, HullMetrics, MechanismType } from '@/types/assemblage-realist';
import { TracedActor, Association } from '@/types/ant';
import { EcosystemConfiguration } from '@/types/ecosystem';

/**
 * Assemblage Mechanism Service
 * Implements DeLanda's Assemblage Theory as ONTOLOGICAL layer
 * 
 * Key Principle: Provides explanatory mechanisms grounded in ANT traces
 */
export class AssemblageMechanismService {
    /**
     * Detect territorialization mechanisms from traced network
     */
    static detectTerritorialization(
        actors: TracedActor[],
        associations: Association[],
        configurations: EcosystemConfiguration[]
    ): AssemblageMechanism[] {
        const mechanisms: AssemblageMechanism[] = [];

        configurations.forEach(config => {
            const memberActors = actors.filter(a => config.memberIds.includes(a.id));
            const internalLinks = associations.filter(
                a => config.memberIds.includes(a.source) && config.memberIds.includes(a.target)
            );

            const intensity = config.properties.calculated_stability || 0.5;

            mechanisms.push({
                type: "territorialization",
                intensity,
                evidence: memberActors,
                explanation: `Configuration "${config.name}" exhibits ${this.intensityLabel(intensity)} territorialization through ${internalLinks.length} internal associations among ${memberActors.length} actors. This boundary-making process stabilizes the assemblage.`,
                confidence: 0.75
            });
        });

        return mechanisms;
    }

    /**
     * Detect deterritorialization mechanisms
     */
    static detectDeterritorialization(
        actors: TracedActor[],
        associations: Association[]
    ): AssemblageMechanism[] {
        const mechanisms: AssemblageMechanism[] = [];

        // Look for actors with high external connectivity (lines of flight)
        actors.forEach(actor => {
            const externalLinks = associations.filter(
                a => (a.source === actor.id || a.target === actor.id)
            );

            if (externalLinks.length > 5) { // Threshold for deterritorialization
                mechanisms.push({
                    type: "deterritorialization",
                    intensity: Math.min(externalLinks.length / 10, 1),
                    evidence: [actor],
                    explanation: `Actor "${actor.name}" shows deterritorialization through ${externalLinks.length} cross-boundary connections, creating lines of flight that destabilize territorial boundaries.`,
                    confidence: 0.7
                });
            }
        });

        return mechanisms;
    }

    /**
     * Identify assemblage capacities (what it can/cannot do)
     */
    static identifyCapacities(
        actors: TracedActor[],
        associations: Association[]
    ): AssemblageCapacity[] {
        const capacities: AssemblageCapacity[] = [];

        // Enforcement capacity
        const policymakers = actors.filter(a => a.type === "Policymaker");
        const regulatoryLinks = associations.filter(a => a.relation_type === "Regulates");

        if (policymakers.length > 0 && regulatoryLinks.length > 0) {
            capacities.push({
                name: "Enforcement Capacity",
                description: "Ability to enforce regulatory compliance through legal mechanisms",
                enabled_by: policymakers.map(p => p.id),
                blocked_by: [],
                actual: true,
                potential: true,
                evidence: `${policymakers.length} policymaker(s) with ${regulatoryLinks.length} regulatory link(s)`
            });
        }

        // Deliberation capacity
        const civilSociety = actors.filter(a => a.type === "Civil Society");
        const academics = actors.filter(a => a.type === "Academic");

        if (civilSociety.length > 0 || academics.length > 0) {
            capacities.push({
                name: "Deliberation Capacity",
                description: "Ability to engage in multi-stakeholder dialogue and knowledge production",
                enabled_by: [...civilSociety.map(c => c.id), ...academics.map(a => a.id)],
                blocked_by: [],
                actual: civilSociety.length + academics.length > 2,
                potential: true,
                evidence: `${civilSociety.length} civil society + ${academics.length} academic actor(s)`
            });
        }

        // Innovation capacity
        const startups = actors.filter(a => a.type === "Startup");
        const infrastructure = actors.filter(a => a.type === "Infrastructure");

        if (startups.length > 0 && infrastructure.length > 0) {
            capacities.push({
                name: "Innovation Capacity",
                description: "Ability to develop and deploy new technological solutions",
                enabled_by: [...startups.map(s => s.id), ...infrastructure.map(i => i.id)],
                blocked_by: [],
                actual: true,
                potential: true,
                evidence: `${startups.length} startup(s) with ${infrastructure.length} infrastructure actor(s)`
            });
        }

        return capacities;
    }

    /**
     * Calculate hull metrics (both ANT and Assemblage perspectives)
     */
    static calculateHullMetrics(
        config: EcosystemConfiguration,
        actors: TracedActor[],
        associations: Association[]
    ): HullMetrics {
        const memberIds = config.memberIds;
        const memberActors = actors.filter(a => memberIds.includes(a.id));

        const internalLinks = associations.filter(
            a => memberIds.includes(a.source) && memberIds.includes(a.target)
        );

        const externalLinks = associations.filter(
            a => (memberIds.includes(a.source) && !memberIds.includes(a.target)) ||
                (!memberIds.includes(a.source) && memberIds.includes(a.target))
        );

        const totalLinks = internalLinks.length + externalLinks.length;

        // ANT flow metrics (methodological)
        const porosity = totalLinks > 0 ? externalLinks.length / totalLinks : 0;
        const connectivity = memberActors.length > 1
            ? internalLinks.length / (memberActors.length * (memberActors.length - 1))
            : 0;

        // Assemblage realist metrics (ontological)
        const territorialization = config.properties.calculated_stability || 0.5;
        const coding_intensity = 1 - (config.properties.porosity_index || 0.5);
        const capacity_score = 0.7; // Would calculate from actual capacities

        return {
            flow_metrics: {
                porosity,
                connectivity,
                label: "ANT Flow Analysis"
            },
            realist_metrics: {
                territorialization,
                coding_intensity,
                capacity_score,
                label: "Assemblage Mechanism Analysis"
            }
        };
    }

    /**
     * Helper: Get intensity label
     */
    private static intensityLabel(intensity: number): string {
        if (intensity > 0.7) return "high";
        if (intensity > 0.4) return "medium";
        return "low";
    }
}
