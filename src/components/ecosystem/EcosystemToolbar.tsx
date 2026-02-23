import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Network, Layers, ZoomIn, Maximize, Minimize, MessageSquare, EyeOff } from 'lucide-react';
import { AssemblageSuggester } from './AssemblageSuggester';
import { VisualGuideDialog } from './VisualGuideDialog';
import { EcosystemActor, EcosystemConfiguration } from '@/types/ecosystem';

interface EcosystemToolbarProps {
    extraToolbarContent?: React.ReactNode;
    is3DMode: boolean;
    setIs3DMode: () => void;
    setIsStratumMode: () => void;
    isStratumMode: boolean;
    reduceMotion: boolean;
    setReduceMotion: () => void;
    isMetricMode: boolean;
    setLayoutMode: () => void;
    isReadOnly: boolean;
    isExplaining: boolean;
    handleExplainMap: () => void;
    explanation: any; // We can refine this type if needed
    isFullScreen: boolean;
    toggleFullScreen: () => void;
    tracedActorId: string | null;
    setTracedActorId: (id: string | null) => void;
    isPresentationMode: boolean;
    setIsPresentationMode: () => void;
    actors: EcosystemActor[];
    links: any[]; // Using any[] to match usage, ideally strict type
    configurations: EcosystemConfiguration[];
    onCreateAssemblage: (name: string, members: string[]) => void;
    resetZoom: () => void;
    // [NEW] Visual Filters
    showUnverifiedLinks?: boolean;
    onToggleUnverified?: () => void;
    linkClassFilter?: 'all' | 'mediator' | 'intermediary';
    onCycleClassFilter?: () => void;
    // [NEW] Directory View
    isAssociationDirectoryOpen?: boolean;
    onToggleAssociationDirectory?: () => void;
}

export const EcosystemToolbar = memo(function EcosystemToolbar({
    extraToolbarContent,
    is3DMode,
    setIs3DMode,
    setIsStratumMode,
    isStratumMode,
    reduceMotion,
    setReduceMotion,
    isMetricMode,
    setLayoutMode,
    isReadOnly,
    isExplaining,
    handleExplainMap,
    explanation,
    isFullScreen,
    toggleFullScreen,
    tracedActorId,
    setTracedActorId,
    isPresentationMode,
    setIsPresentationMode,
    actors,
    links,
    configurations,
    onCreateAssemblage,
    resetZoom,
    showUnverifiedLinks,
    onToggleUnverified,
    linkClassFilter = 'all',
    onCycleClassFilter,
    isAssociationDirectoryOpen = false,
    onToggleAssociationDirectory
}: EcosystemToolbarProps) {
    return (
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-md border border-slate-200 overflow-x-auto max-w-full pb-1">
            {extraToolbarContent}
            {extraToolbarContent && <div className="w-px h-3 bg-slate-300 mx-0.5 shrink-0" />}

            <Button
                variant="ghost" size="sm"
                onClick={setIs3DMode}
                className={`h-7 px-2.5 text-xs font-medium shrink-0 ${is3DMode ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
            >
                <Network className="h-3 w-3 mr-1" /> {is3DMode ? "Toggle 2D View" : "Toggle 3D View"}
            </Button>

            {/* Accessibility / Perf Toggle (Reduce Motion) */}
            {is3DMode && (
                <>
                    <div className="w-px h-3 bg-slate-300 mx-0.5 shrink-0" />
                    <Button
                        variant="ghost" size="sm"
                        onClick={setReduceMotion}
                        className={`h-7 px-2.5 text-xs font-medium shrink-0 ${reduceMotion ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-slate-500 hover:text-slate-900"}`}
                        title="Disable intense animations (Jitter, Particles)"
                    >
                        {reduceMotion ? "Motion Reduced" : "Reduce Motion"}
                    </Button>
                </>
            )}

            {!is3DMode && (
                <>
                    <div className="w-px h-3 bg-slate-300 mx-0.5 shrink-0" />
                    <Button
                        variant="ghost" size="sm"
                        className={`h-7 px-2.5 text-xs font-medium shrink-0 ${isMetricMode ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-slate-500 hover:text-slate-900"}`}
                        onClick={setLayoutMode}
                    >
                        <Layers className="h-3 w-3 mr-1" /> {isMetricMode ? "Switch to Nested" : "Assemblage Compass"}
                    </Button>
                    <div className="w-px h-3 bg-slate-300 mx-0.5 shrink-0" />

                    {!isReadOnly && (
                        <AssemblageSuggester
                            actors={actors}
                            edges={links}
                            configurations={configurations}
                            onCreateAssemblage={onCreateAssemblage}
                        />
                    )}
                    <div className="w-px h-3 bg-slate-300 mx-0.5 shrink-0" />
                    <Button
                        variant="ghost" size="sm"
                        className="h-7 px-2.5 text-xs font-medium text-slate-500 hover:text-slate-900 shrink-0"
                        onClick={resetZoom}
                    >
                        <ZoomIn className="h-3 w-3 mr-1" /> Reset View
                    </Button>
                </>
            )}

            <div className="w-px h-3 bg-slate-300 mx-0.5 shrink-0" />

            {/* [NEW] Association Directory Toggle */}
            {onToggleAssociationDirectory && (
                <>
                    <Button
                        variant="ghost" size="sm"
                        onClick={onToggleAssociationDirectory}
                        className={`h-7 px-2.5 text-xs font-medium shrink-0 ${isAssociationDirectoryOpen ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-slate-500 hover:text-slate-900"}`}
                        title="Open Association Directory"
                    >
                        <Network className="h-3 w-3 mr-1" /> {isAssociationDirectoryOpen ? "Close Directory" : "Directory"}
                    </Button>
                    <div className="w-px h-3 bg-slate-300 mx-0.5 shrink-0" />
                </>
            )}

            {/* ANT Workbench Controls */}
            {tracedActorId && (
                <Button
                    variant="destructive" size="sm"
                    className="h-7 px-2.5 text-xs font-medium shrink-0 animate-in fade-in"
                    onClick={() => setTracedActorId(null)}
                >
                    <EyeOff className="h-3 w-3 mr-1" /> Exit Trace
                </Button>
            )}

            {is3DMode && (
                <>
                    <div className="w-px h-3 bg-slate-300 mx-0.5 shrink-0" />
                    <Button
                        variant="ghost" size="sm"
                        onClick={setIsStratumMode}
                        className={`h-7 px-2.5 text-xs font-medium shrink-0 ${isStratumMode ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-slate-500 hover:text-slate-900"}`}
                        title="Visualize Law as a Stratum over the Meshwork"
                    >
                        <Layers className="h-3 w-3 mr-1" /> {isStratumMode ? "Stratum Active" : "Legal Stratum"}
                    </Button>
                    <div className="w-px h-3 bg-slate-300 mx-0.5 shrink-0" />
                    <Button
                        variant="ghost" size="sm"
                        onClick={setIsPresentationMode}
                        className={`h-7 px-2.5 text-xs font-medium shrink-0 ${isPresentationMode ? "bg-purple-50 text-purple-700 border border-purple-200 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                        title="Toggle Presentation Mode: Bloom, Fog, Curved Links"
                    >
                        {isPresentationMode ? "✨ Presentation Mode" : "🔬 Research Mode"}
                    </Button>
                    {/* Class Filter Cycle */}
                    {onCycleClassFilter && (
                        <>
                            <div className="w-px h-3 bg-slate-300 mx-0.5 shrink-0" />
                            <Button
                                variant="ghost" size="sm"
                                onClick={onCycleClassFilter}
                                className={`h-7 px-2.5 text-xs font-medium shrink-0 ${linkClassFilter !== 'all' ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-slate-600 hover:bg-slate-100 border border-transparent"}`}
                                title="Filter analyzed links by classification"
                            >
                                {linkClassFilter === 'all' ? "All Types" :
                                    linkClassFilter === 'mediator' ? "Mediators" :
                                        "Intermediaries"}
                            </Button>
                        </>
                    )}
                    <div className="w-px h-3 bg-slate-300 mx-0.5 shrink-0" />
                    <Button
                        variant="ghost" size="sm"
                        onClick={onToggleUnverified}
                        className={`h-7 px-2.5 text-xs font-medium shrink-0 ${showUnverifiedLinks ? "bg-amber-50 text-amber-700 border border-amber-200" : "text-slate-500 hover:text-slate-900"}`}
                        title="Show/Hide unanalyzed relationships"
                    >
                        {showUnverifiedLinks ? "Show All Links" : "Filtered View"}
                    </Button>
                </>
            )}

            <div className="w-px h-3 bg-slate-300 mx-0.5 shrink-0" />

            <Button
                variant="ghost"
                size="sm"
                className={`h-7 px-2.5 text-xs font-medium shrink-0 ${isExplaining || explanation ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-900"}`}
                onClick={handleExplainMap}
                disabled={isReadOnly}
                title={isReadOnly ? "Trace analysis disabled in Demo Mode" : "Generate AI Analysis of current view"}
            >
                <MessageSquare className="h-3 w-3 mr-1.5" />
                {isExplaining ? "Tracing..." : "Open Trace"}
            </Button>

            <div className="w-px h-3 bg-slate-300 mx-0.5 shrink-0" />

            <Button
                variant="ghost" size="sm"
                className={`h-7 px-2.5 text-xs font-medium shrink-0 ${isFullScreen ? "bg-red-50 text-red-600" : "text-slate-500 hover:text-slate-900"}`}
                onClick={toggleFullScreen}
            >
                {isFullScreen ? (
                    <><Minimize className="h-3 w-3 mr-1" /> Exit Full Screen</>
                ) : (
                    <><Maximize className="h-3 w-3 mr-1" /> Full Screen</>
                )}
            </Button>
            <VisualGuideDialog />
        </div>
    );
});
