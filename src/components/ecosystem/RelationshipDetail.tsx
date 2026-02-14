
import React from 'react';
import { Relationship, getMediatorClassification, getMediatorVisuals } from '@/types/relationship';
import { X, Quote, Zap, Activity, Repeat, GitBranch, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RelationshipDetailProps {
    relationship: Relationship;
    onClose: () => void;
}

export function RelationshipDetail({ relationship, onClose }: RelationshipDetailProps) {
    const { mediatorScore, dimensions, empiricalTraces } = relationship;
    const classification = relationship.classification || getMediatorClassification(mediatorScore);
    const visuals = getMediatorVisuals(mediatorScore);

    // [NEW] Draggable Logic
    const [offset, setOffset] = React.useState({ x: 0, y: 0 });
    const isDragging = React.useRef(false);
    const startPos = React.useRef({ x: 0, y: 0 });
    const initialOffset = React.useRef({ x: 0, y: 0 });

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            const dx = e.clientX - startPos.current.x;
            const dy = e.clientY - startPos.current.y;
            setOffset({
                x: initialOffset.current.x + dx,
                y: initialOffset.current.y + dy
            });
        };
        const handleMouseUp = () => {
            isDragging.current = false;
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) return; // Prevent drag when clicking close button
        isDragging.current = true;
        startPos.current = { x: e.clientX, y: e.clientY };
        initialOffset.current = { ...offset };
        e.preventDefault();
    };

    return (
        <div
            className="absolute top-4 right-4 w-96 max-h-[calc(100vh-2rem)] overflow-y-auto bg-white rounded-xl shadow-2xl border border-slate-200 z-50 animate-in slide-in-from-right-4 duration-300"
            style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, transition: isDragging.current ? 'none' : 'transform 0.1s ease-out' }}
        >

            {/* Header */}
            <div
                className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 p-4 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
                onMouseDown={handleMouseDown}
            >
                <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Relationship Analysis</div>
                    <Badge
                        className="text-xs font-bold px-2 py-0.5"
                        style={{ backgroundColor: visuals?.color || '#333' }}
                    >
                        {visuals?.label || classification.replace('_', ' ')}
                    </Badge>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="h-4 w-4 text-slate-400 hover:text-slate-700" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">

                {/* Score & Metaphor */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-center">
                        <div className="text-3xl font-black text-slate-900">{mediatorScore.toFixed(2)}</div>
                        <div className="text-[9px] uppercase font-bold text-slate-400 mt-1">Transform Score</div>
                    </div>
                    <div className="h-10 w-px bg-slate-200" />
                    <div className="text-xs text-slate-600 italic">
                        {mediatorScore > 0.7 ?
                            "&quot;Site of intense transformation and contestation.&quot;" :
                            "&quot;Passive transmission of meaning/force.&quot;"}
                    </div>
                </div>

                {/* Dimensions */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase">ANT Dimensions (0-1)</h4>

                    <DimensionBar
                        label="Transformation"
                        score={dimensions.transformation.score}
                        icon={Zap}
                        desc={dimensions.transformation.justification}
                    />
                    <DimensionBar
                        label="Contestation"
                        score={dimensions.contestation.score}
                        icon={Scale}
                        desc={dimensions.contestation.justification}
                    />
                    <DimensionBar
                        label="Multiplicity"
                        score={dimensions.multiplicity.score}
                        icon={GitBranch}
                        desc={dimensions.multiplicity.justification}
                    />
                    <DimensionBar
                        label="Generativity"
                        score={dimensions.generativity.score}
                        icon={Activity}
                        desc={dimensions.generativity.justification}
                    />
                    <DimensionBar
                        label="Stability"
                        score={dimensions.stability.score}
                        icon={Repeat}
                        desc={dimensions.stability.justification}
                        inverted // Higher stability = Lower mediator score normally, but here let's assume raw score (1=Unstable/Mediator) based on prompt logic (Stability 1.0 = Provisional/Mediator)
                    />
                </div>

                {/* Empirical Traces */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                        <Quote className="h-3 w-3" /> Empirical Traces
                    </h4>
                    {empiricalTraces && empiricalTraces.map((trace, i) => (
                        <div key={i} className="text-xs text-slate-600 italic bg-amber-50/50 p-3 rounded border-l-2 border-amber-300">
                            &quot;{trace}&quot;
                        </div>
                    ))}
                    {!empiricalTraces?.length && (
                        <div className="text-xs text-slate-400">No specific quotes extracted for this link.</div>
                    )}
                </div>

            </div>
        </div>
    );
}

interface DimensionBarProps {
    label: string;
    score: number;
    icon: React.ElementType;
    desc: string;
    inverted?: boolean;
}

function DimensionBar({ label, score, icon: Icon, desc }: DimensionBarProps) {
    const fillPercent = score * 100;
    const colorClass = score > 0.7 ? 'bg-red-500' : score > 0.4 ? 'bg-orange-400' : 'bg-slate-300';

    return (
        <div className="group">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                    <Icon className="h-3 w-3 text-slate-400" />
                    {label}
                </div>
                <div className="text-[10px] font-mono text-slate-500">{score.toFixed(2)}</div>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-1">
                <div className={`h-full rounded-full ${colorClass} transition-all duration-500`} style={{ width: `${fillPercent}%` }} />
            </div>
            <div className="text-[10px] text-slate-400 leading-tight hidden group-hover:block transition-all">
                {desc}
            </div>
        </div>
    );
}
