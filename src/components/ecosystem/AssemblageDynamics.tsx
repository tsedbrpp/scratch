import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, Info, X } from 'lucide-react';
import { TerritorializationView } from './TerritorializationView';
import { DeterritorializationView } from './DeterritorializationView';
import { CodingView } from './CodingView';

import { SimulationNode, SimulationLink } from '@/hooks/useForceGraph';

interface AssemblageDynamicsProps {
    onClose: () => void;
    nodes: SimulationNode[];
    links: SimulationLink[];
}

export function AssemblageDynamics({ onClose, nodes, links }: AssemblageDynamicsProps) {
    const [activeTab, setActiveTab] = useState("territorialization");
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card className={`fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md shadow-2xl border-slate-200 transition-all duration-300 z-[100] ${isExpanded ? 'w-[95vw] h-[90vh]' : 'w-[900px] h-[600px]'}`}>
            <CardHeader className="border-b border-slate-100 py-3 flex flex-row items-center justify-between sticky top-0 bg-white/50 backdrop-blur-sm z-10">
                <div>
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        Assemblage Dynamics
                        <Info className="h-4 w-4 text-slate-400" />
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                        Interactive models of structural power and resistance.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-60px)]">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                    <div className="px-6 pt-4 border-b border-slate-100">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="territorialization">Territorialization (Stabilization)</TabsTrigger>
                            <TabsTrigger value="deterritorialization">Deterritorialization (Escape)</TabsTrigger>
                            <TabsTrigger value="coding">Coding (Translation)</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 bg-slate-50/50 overflow-hidden relative min-h-0">
                        <TabsContent value="territorialization" className="h-full m-0 p-0 data-[state=active]:flex flex-col overflow-hidden">
                            <div className="flex-1 p-6 min-h-0">
                                <TerritorializationView isExpanded={isExpanded} nodes={nodes} />
                            </div>
                        </TabsContent>
                        <TabsContent value="deterritorialization" className="h-full m-0 p-0 data-[state=active]:flex flex-col overflow-hidden">
                            <div className="flex-1 p-6 min-h-0">
                                <DeterritorializationView isExpanded={isExpanded} nodes={nodes} />
                            </div>
                        </TabsContent>
                        <TabsContent value="coding" className="h-full m-0 p-0 data-[state=active]:flex flex-col overflow-hidden">
                            <div className="flex-1 p-6 min-h-0">
                                <CodingView isExpanded={isExpanded} nodes={nodes} />
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    );
}
