import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, ReferenceLine, Label } from 'recharts';

interface GovernanceCompassProps {
    rhetoricScore: number; // 0-100 (Y-Axis)
    realityScore: number; // 0-100 (X-Axis)
    driftExplanation?: string;
}

export function GovernanceCompass({ rhetoricScore, realityScore, driftExplanation }: GovernanceCompassProps) {
    const data = [
        { x: realityScore, y: rhetoricScore, name: 'Governance State' }
    ];

    // Calculate drift magnitude
    const drift = Math.abs(rhetoricScore - realityScore);
    const isHighDrift = drift > 30;

    return (
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="mb-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Governance Compass</h4>
                <p className="text-xs text-slate-500">Mapping Discursive Claims (Rhetoric) vs. Material Operations (Reality)</p>
            </div>

            <div className="h-[300px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <XAxis
                            type="number"
                            dataKey="x"
                            name="Reality (Enforcement)"
                            domain={[0, 100]}
                            tick={{ fontSize: 10 }}
                            label={{ value: 'Material Reality (Enforcement) →', position: 'bottom', offset: 0, fontSize: 10 }}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name="Rhetoric (Claims)"
                            domain={[0, 100]}
                            tick={{ fontSize: 10 }}
                            label={{ value: 'Discursive Rhetoric (Claims) →', angle: -90, position: 'left', offset: 0, fontSize: 10 }}
                        />
                        <ZAxis range={[100, 100]} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />

                        {/* Quadrant Lines */}
                        <ReferenceLine x={50} stroke="#e2e8f0" />
                        <ReferenceLine y={50} stroke="#e2e8f0" />

                        {/* Quadrant Labels */}
                        <ReferenceLine y={90} label={{ value: "High Rhetoric", position: 'insideTopRight', fontSize: 10, fill: '#94a3b8' }} stroke="none" />
                        <ReferenceLine x={90} label={{ value: "High Reality", position: 'insideTopRight', fontSize: 10, fill: '#94a3b8' }} stroke="none" />

                        {/* Drift Vector (Ideal Line) */}
                        <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]} stroke="#cbd5e1" strokeDasharray="3 3" />

                        <Scatter data={data} fill="#8884d8">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={isHighDrift ? '#ef4444' : '#10b981'} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>

                {/* Custom Annotation for the Point */}
                <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{
                        left: `${(realityScore / 100) * 80 + 10}%`, // Rough approximation for positioning
                        bottom: `${(rhetoricScore / 100) * 80 + 10}%`
                    }}
                >
                    <div className={`px-2 py-1 rounded text-[10px] font-bold text-white ${isHighDrift ? 'bg-red-500' : 'bg-emerald-500'} shadow-sm whitespace-nowrap`}>
                        {isHighDrift ? 'Drift Detected' : 'Aligned'}
                    </div>
                </div>
            </div>

            {isHighDrift && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-xs text-red-800">
                    <strong>Governance Drift:</strong> {driftExplanation || "Significant gap between ethical claims and enforcement mechanisms."}
                </div>
            )}
        </div>
    );
}
