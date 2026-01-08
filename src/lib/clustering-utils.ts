
// Helper function to calculate cosine similarity
export function cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

// Helper function to perform hierarchical clustering
export function hierarchicalClustering(
    themeObjects: { theme: string; quote: string; source: string }[],
    embeddings: number[][],
    sourceIds: string[],
    threshold: number = 0.7
): Array<{ themes: { theme: string; quote: string; source: string }[]; sources: string[]; centroid: number[] }> {
    // Start with each theme as its own cluster
    let clusters = themeObjects.map((obj, i) => ({
        themes: [obj],
        sources: [sourceIds[i]],
        embeddings: [embeddings[i]],
        centroid: embeddings[i],
    }));

    // Merge clusters until no more similar pairs
    let merged = true;
    while (merged && clusters.length > 1) {
        merged = false;
        let maxSimilarity = threshold;
        let mergeIndices: [number, number] | null = null;

        // Find most similar pair
        for (let i = 0; i < clusters.length; i++) {
            for (let j = i + 1; j < clusters.length; j++) {
                const similarity = cosineSimilarity(clusters[i].centroid, clusters[j].centroid);
                if (similarity > maxSimilarity) {
                    maxSimilarity = similarity;
                    mergeIndices = [i, j];
                }
            }
        }

        // Merge if found
        if (mergeIndices) {
            const [i, j] = mergeIndices;
            const newCluster = {
                themes: [...clusters[i].themes, ...clusters[j].themes],
                sources: [...new Set([...clusters[i].sources, ...clusters[j].sources])],
                embeddings: [...clusters[i].embeddings, ...clusters[j].embeddings],
                centroid: clusters[i].centroid.map((val, idx) =>
                    (val + clusters[j].centroid[idx]) / 2
                ),
            };
            clusters = [
                ...clusters.slice(0, i),
                ...clusters.slice(i + 1, j),
                ...clusters.slice(j + 1),
                newCluster,
            ];
            merged = true;
        }
    }

    return clusters;
}
