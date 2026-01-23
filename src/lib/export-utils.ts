import { CulturalAnalysisResult } from "@/types/cultural";

export const exportSummaryToCSV = (culturalAnalysis: CulturalAnalysisResult) => {
    // 1. Clusters CSV
    const clustersHeader = "Type,Name,Themes,Sources\n";
    const clustersRows = culturalAnalysis.clusters.map(c =>
        `Cluster,"${c.name}","${c.themes.join(', ')}","${c.sources.join(', ')}"`
    ).join("\n");

    const csvContent = "data:text/csv;charset=utf-8,"
        + "Analysis Summary\n" + `"${(culturalAnalysis.summary || '').replace(/"/g, '""')}"\n\n`
        + clustersHeader + clustersRows;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cultural_analysis_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportDetailedMatrixToCSV = (culturalAnalysis: CulturalAnalysisResult) => {
    const header = "Cluster Name,Cluster Description,Theme,Attributed Source,Evidence (Quote)\n";
    const rows: string[] = [];

    culturalAnalysis.clusters.forEach(cluster => {
        if (cluster.quotes && cluster.quotes.length > 0) {
            cluster.quotes.forEach(quote => {
                const row = [
                    `"${cluster.name.replace(/"/g, '""')}"`,
                    `"${(cluster.description || '').replace(/"/g, '""')}"`,
                    `"${(quote.theme || '').replace(/"/g, '""')}"`,
                    `"${quote.source.replace(/"/g, '""')}"`,
                    `"${quote.text.replace(/"/g, '""')}"`
                ].join(",");
                rows.push(row);
            });
        } else {
            // Export cluster even if no quotes
            const row = [
                `"${cluster.name.replace(/"/g, '""')}"`,
                `"${(cluster.description || '').replace(/"/g, '""')}"`,
                "",
                "",
                ""
            ].join(",");
            rows.push(row);
        }
    });

    const csvContent = "data:text/csv;charset=utf-8," + header + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cultural_matrix_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
