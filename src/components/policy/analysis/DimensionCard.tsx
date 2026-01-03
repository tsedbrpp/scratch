import React from 'react';

export function DimensionCard({ title, icon, content, color }: { title: string, icon: React.ReactNode, content: string, color: string }) {
    return (
        <div className={`group p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-${color}-200 transition-all duration-200`}>
            <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-md bg-${color}-50 group-hover:bg-${color}-100 transition-colors`}>
                    {icon}
                </div>
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide">{title}</h5>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors">
                {content}
            </p>
        </div>
    );
}
