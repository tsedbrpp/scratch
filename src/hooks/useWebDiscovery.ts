import { useState } from 'react';
import { SearchResult, ResistanceArtifact } from '@/types/resistance';
import { useWorkspace } from '@/providers/WorkspaceProvider';

interface UseWebDiscoveryProps {
    onImport: (artifact: Omit<ResistanceArtifact, 'id' | 'uploaded_at' | 'uploaded_by'>) => void;
}

export function useWebDiscovery({ onImport }: UseWebDiscoveryProps) {
    const { currentWorkspaceId } = useWorkspace();
    const [query, setQuery] = useState("AI Act resistance manifesto filetype:pdf");
    const [results, setResults] = useState<SearchResult[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [importingUrl, setImportingUrl] = useState<string | null>(null);
    const [isDemoMode, setIsDemoMode] = useState(false);

    const getHeaders = (base: HeadersInit = {}) => {
        const headers = { ...base } as Record<string, string>;
        if (currentWorkspaceId) {
            headers['x-workspace-id'] = currentWorkspaceId;
        }
        if (process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true') {
            headers['x-demo-user-id'] = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user';
        }
        return headers;
    };

    const handleSearch = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/resistance/search?q=${encodeURIComponent(query)}`, {
                headers: getHeaders()
            });
            const data = await response.json();

            if (data.results) {
                setResults(data.results);
                if (data.source === 'mock' || data.source === 'mock_fallback') {
                    setIsDemoMode(true);
                } else {
                    setIsDemoMode(false);
                }
            } else {
                setResults([]);
            }
        } catch (error) {
            console.error("Search failed", error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImport = async (result: SearchResult) => {
        if (!result.url) {
            console.error("Cannot import result with missing URL", result);
            return;
        }
        setImportingUrl(result.url);

        try {
            let extractedText = "";
            try {
                const response = await fetch('/api/fetch-url', {
                    method: 'POST',
                    headers: getHeaders({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify({ url: result.url })
                });
                const data = await response.json();
                if (data.markdown) {
                    extractedText = data.markdown;
                } else if (data.text) {
                    extractedText = data.text;
                } else if (data.content) {
                    extractedText = data.content;
                }

                if (!extractedText || extractedText.trim().length === 0) {
                    console.warn("API returned empty text, falling back to snippet");
                    extractedText = `[Content could not be automatically extracted from ${result.url}]\n\nSnippet: ${result.snippet}`;
                }
            } catch (e) {
                console.warn("Failed to fetch content, using snippet", e);
                extractedText = `[Content could not be automatically extracted from ${result.url}]\n\nSnippet: ${result.snippet}`;
            }

            const newArtifact: Omit<ResistanceArtifact, 'id' | 'uploaded_at' | 'uploaded_by'> = {
                title: result.title,
                type: result.type,
                source: result.source,
                date: result.date,
                text: extractedText.substring(0, 5000),
                target_components: [],
                tags: ["web-discovery", "auto-imported"]
            };

            await onImport(newArtifact);
            setImportingUrl(null);
        } catch (error) {
            console.error("Import failed", error);
            setImportingUrl(null);
        }
    };

    return {
        query,
        setQuery,
        results,
        isLoading,
        importingUrl,
        isDemoMode,
        handleSearch,
        handleImport
    };
}
