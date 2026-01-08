import { EcosystemActor, TranslationStage } from '@/types/ecosystem';

export const SimulationService = {
    /**
     * Calculates Degree Centrality and updates dynamic_power metric.
     * Heuristic: More connections = More structural power (Actor-Network Theory).
     */
    calculateDynamicPower: (nodes: EcosystemActor[], links: { source: string | EcosystemActor; target: string | EcosystemActor }[]) => {
        const connectionCounts = new Map<string, number>();

        // Initialize counts
        nodes.forEach(n => connectionCounts.set(n.id, 0));

        // Count connections (undirected mostly, but can be weighted)
        links.forEach(link => {
            const sId = typeof link.source === 'object' ? link.source.id : link.source;
            const tId = typeof link.target === 'object' ? link.target.id : link.target;

            connectionCounts.set(sId, (connectionCounts.get(sId) || 0) + 1);
            connectionCounts.set(tId, (connectionCounts.get(tId) || 0) + 1);
        });

        // Normalize (0-100 scale ideally, but relative is key)
        const maxConnections = Math.max(...Array.from(connectionCounts.values())) || 1;

        return nodes.map(node => {
            const count = connectionCounts.get(node.id) || 0;
            const normalizedPower = (count / maxConnections) * 10; // 0-10 scale

            return {
                ...node,
                metrics: {
                    ...node.metrics,
                    // Fallback to static influence if no connections yet
                    dynamic_power: parseFloat(normalizedPower.toFixed(2)),
                    influence: node.metrics?.influence || 5 // Maintain static for legacy props
                }
            } as EcosystemActor;
        });
    },

    /**
     * Calculates "Fidelity" between translation stages.
     * Logic: A drop in relevant actors from one stage to the next implies "Translation Loss" or "Betrayal".
     */
    calculateChainFidelity: (stages: TranslationStage[], actors: EcosystemActor[]) => {
        const lowerType = (t: string) => t.toLowerCase();

        // Helper: Count actors relevant to a stage's ontology based on required_actor_types
        const getStageActorCount = (stage: TranslationStage) => {
            // If required_actor_types is defined, use it
            if (stage.required_actor_types && stage.required_actor_types.length > 0) {
                return actors.filter(a =>
                    stage.required_actor_types!.some(t => lowerType(a.type).includes(lowerType(t)))
                ).length;
            }

            // Fallback: Use logic based on ontology if no types specified
            // This maintains some default behavior if config is missing
            switch (stage.ontology) {
                case 'social':
                    return actors.filter(a => ['civilsociety', 'ngo', 'academic', 'activist', 'public'].some(t => lowerType(a.type).includes(t))).length;
                case 'regulatory':
                    return actors.filter(a => ['policymaker', 'government', 'legislator', 'regulator', 'court'].some(t => lowerType(a.type).includes(t))).length;
                case 'technical':
                    return actors.filter(a => ['standard', 'algorithm', 'technologist', 'expert', 'scientist'].some(t => lowerType(a.type).includes(t))).length;
                case 'market':
                    return actors.filter(a => ['startup', 'private', 'corporation', 'sme', 'user'].some(t => lowerType(a.type).includes(t))).length;
                default:
                    return 0;
            }
        };

        return stages.map((stage, index) => {
            // No previous stage to compare with
            if (index === 0) return { ...stage, fidelity_score: 1.0, betrayal_type: "None" as const };

            const currentCount = getStageActorCount(stage);
            const prevCount = getStageActorCount(stages[index - 1]);

            // Simple Heuristic: If count drops significantly, it's a "Simplification" betrayal
            // If count stays same but ontology shifts totally (hard to measure without strict mapping), it might be displacement.

            // Avoid division by zero
            // If prevCount is 0, we can't really measure loss, so default to 1 unless current is also 0? 
            // Let's say if prev was 0 and current is >0, that's growth (fidelity 1). 
            const ratio = prevCount === 0 ? 1 : (currentCount / prevCount);
            const fidelity = Math.min(ratio, 1.0); // Cap at 1.0 (growth is not loss)

            let betrayal: "Simplification" | "Displacement" | "None" = "None";
            if (fidelity < 0.5) betrayal = "Simplification";
            if (fidelity < 0.8 && fidelity >= 0.5) betrayal = "Displacement";

            return {
                ...stage,
                fidelity_score: parseFloat(fidelity.toFixed(2)),
                betrayal_type: betrayal,
                active_actor_count: currentCount
            };
        });
    },

    /**
     * Calculates Stability (Internal) and Porosity (External) for Assemblage Hulls.
     * DR-A5: "Calculated Boundary Strength"
     */
    calculateHullMetrics: (
        configs: import('@/types/ecosystem').EcosystemConfiguration[],
        actors: EcosystemActor[],
        links: { source: string | EcosystemActor; target: string | EcosystemActor }[]
    ) => {
        return configs.map(config => {
            const memberIds = new Set(config.memberIds);

            // 1. Identify Links involving members
            let internalLinks = 0;
            let externalLinks = 0;

            links.forEach(link => {
                const sId = typeof link.source === 'object' ? link.source.id : link.source;
                const tId = typeof link.target === 'object' ? link.target.id : link.target;

                const sIn = memberIds.has(sId);
                const tIn = memberIds.has(tId);

                if (sIn && tIn) {
                    internalLinks++;
                } else if (sIn || tIn) {
                    externalLinks++;
                }
            });

            // 2. Calculate Density (Stability)
            // Max internal links = n * (n - 1) / 2 for undirected
            const n = config.memberIds.length;
            const maxInternal = (n * (n - 1)) / 2 || 1;
            // Heuristic: Density * factor + size bonus? 
            // Let's stick to Density for purity, maybe normalized 0-1
            const density = internalLinks / Math.max(maxInternal, 1);

            // 3. Calculate Porosity
            // Ratio of External Links to Total Links (Internal + External)
            const totalLinks = internalLinks + externalLinks;
            const porosity = totalLinks === 0 ? 1 : (externalLinks / totalLinks);

            return {
                ...config,
                properties: {
                    ...config.properties,
                    calculated_stability: parseFloat(density.toFixed(2)),
                    porosity_index: parseFloat(porosity.toFixed(2))
                }
            };
        });
    }
};
