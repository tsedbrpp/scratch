import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function migrateGhostNodes(dryRun: boolean = true) {
    console.log(`Starting ghost node migration. Dry run: ${dryRun}`);

    try {
        const { redis } = await import('../src/lib/redis');
        const { GhostNodeStore } = await import('../src/lib/ghost-node-store');

        let totalMigrated = 0;
        let totalSkipped = 0;

        // 1. Migrate Ontology Maps
        const ontologyKeys = await redis.keys('user:*:storage:ontology_maps');
        console.log(`Found ${ontologyKeys.length} ontology_maps keys.`);

        for (const key of ontologyKeys) {
            const contextIdMatch = key.match(/^user:([^:]+):storage:ontology_maps$/);
            if (!contextIdMatch) continue;
            const contextId = contextIdMatch[1];

            const ontologyMapsStr = await redis.get(key);
            if (!ontologyMapsStr) continue;

            let ontologyMaps;
            try {
                ontologyMaps = typeof ontologyMapsStr === 'string' ? JSON.parse(ontologyMapsStr) : ontologyMapsStr;
            } catch (e) {
                console.error(`Failed to parse ontology maps for ${key}`);
                continue;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const [policyId, data] of Object.entries<any>(ontologyMaps)) {
                if (!data || !data.nodes) continue;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const ghosts = data.nodes.filter((n: any) => n.isGhost);

                for (const g of ghosts) {
                    const fingerprint = GhostNodeStore.generateFingerprint(g.label, policyId, g.category ? [g.category] : []);
                    const node = {
                        fingerprint,
                        policyId,
                        name: g.label,
                        description: g.description || g.whyAbsent || 'Migrated from ontology analysis',
                        category: g.category,
                        evidence: [{ rationale: g.whyAbsent || 'No rationale mapped during migration' }],
                        sourcePipelines: ['legacy_ontology'],
                        status: 'proposed' as const,
                        confidence: g.absenceStrength || 50,
                        aliases: [],
                        relatedThemes: g.category ? [g.category] : []
                    };

                    if (!dryRun) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const added = await GhostNodeStore.createGhostNode(contextId, node as any);
                        added ? totalMigrated++ : totalSkipped++;
                    } else {
                        console.log(`[DRY RUN] Would migrate ontology node "${node.name}" for policy ${policyId}`);
                        totalMigrated++;
                    }
                }
            }
        }

        // 2. Migrate Ecosystem Absence Analysis
        const absenceKeys = await redis.keys('user:*:storage:ecosystem_absence_*');
        console.log(`Found ${absenceKeys.length} ecosystem_absence keys.`);

        for (const key of absenceKeys) {
            const match = key.match(/^user:([^:]+):storage:ecosystem_absence_(.+)$/);
            if (!match) continue;
            const contextId = match[1];
            const policyId = match[2];

            const absenceStr = await redis.get(key);
            if (!absenceStr) continue;

            let absenceData;
            try {
                absenceData = typeof absenceStr === 'string' ? JSON.parse(absenceStr) : absenceStr;
            } catch (e) {
                continue;
            }

            if (!absenceData.missing_voices) continue;

            for (const g of absenceData.missing_voices) {
                const fingerprint = GhostNodeStore.generateFingerprint(g.name, policyId);
                const node = {
                    fingerprint,
                    policyId,
                    name: g.name,
                    description: g.description || '',
                    category: 'Expected Actor',
                    evidence: [{ rationale: g.ghostReason || 'Migrated from ecosystem trace' }],
                    sourcePipelines: ['legacy_ecosystem'],
                    status: 'proposed' as const,
                    confidence: 50,
                    aliases: [],
                    relatedThemes: []
                };

                if (!dryRun) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const added = await GhostNodeStore.createGhostNode(contextId, node as any);
                    added ? totalMigrated++ : totalSkipped++;
                } else {
                    console.log(`[DRY RUN] Would migrate ecosystem node "${node.name}" for policy ${policyId}`);
                    totalMigrated++;
                }
            }
        }

        console.log(`\nMigration Summary:`);
        console.log(`Items migrated: ${totalMigrated}`);
        console.log(`Items skipped (already exist): ${totalSkipped}`);

    } catch (err) {
        console.error("Migration failed:", err);
    }
}

const isDryRun = process.argv.includes('--dryRun');
migrateGhostNodes(isDryRun).then(() => process.exit(0));
