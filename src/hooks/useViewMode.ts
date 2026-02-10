// import { useLocalStorage } from "@/hooks/useLocalStorage";

export type ViewMode = 'guided' | 'advanced';

export function useViewMode() {
    // Deprecated: We now always default to advanced/full view
    // const [mode, setMode] = useLocalStorage<ViewMode>('antigravity_view_mode', 'guided');

    // Mock state to satisfy interface without using local storage
    const mode: ViewMode = 'advanced';
    const setMode = () => { }; // No-op
    const toggleMode = () => { }; // No-op

    return {
        mode,
        setMode,
        toggleMode,
        isAdvanced: true,
        isGuided: false
    };
}
