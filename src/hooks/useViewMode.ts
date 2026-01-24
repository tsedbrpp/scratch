import { useLocalStorage } from "@/hooks/useLocalStorage";

export type ViewMode = 'guided' | 'advanced';

export function useViewMode() {
    const [mode, setMode] = useLocalStorage<ViewMode>('antigravity_view_mode', 'guided');

    const toggleMode = () => setMode(prev => prev === 'guided' ? 'advanced' : 'guided');

    return {
        mode,
        setMode,
        toggleMode,
        isAdvanced: mode === 'advanced',
        isGuided: mode === 'guided'
    };
}
