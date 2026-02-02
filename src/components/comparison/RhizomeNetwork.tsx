"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Network } from 'lucide-react';
import { ConceptMap, MarkmapNode } from '@/lib/diagram-wrapper';

interface AssemblageNetwork {
    nodes: string[];
    edges: { from: string; to: string; type: string }[];
}

interface RhizomeNetworkProps {
    network: AssemblageNetwork;
}

// Transform flat network to Markmap tree
function buildMarkmapData(network: AssemblageNetwork): MarkmapNode {
    if (!network || network.nodes.length === 0) {
        return { content: "Empty Network" };
    }

    const { nodes, edges } = network;
    const targets = new Set(edges.map(e => e.to));
    // Roots are nodes not in targets (no incoming edges)
    const roots = nodes.filter(n => !targets.has(n));
    // If no roots (cycle), pick the first node
    const actualRoots = roots.length > 0 ? roots : [nodes[0]];

    // Build adjacency list
    const adj: Record<string, string[]> = {};
    edges.forEach(e => {
        if (!adj[e.from]) adj[e.from] = [];
        adj[e.from].push(e.to);
    });

    const visited = new Set<string>();

    function buildNode(id: string): MarkmapNode {
        visited.add(id);
        const childrenIds = adj[id] || [];
        // Prevent infinite recursion in cycles
        const validChildren = childrenIds.filter(c => !visited.has(c));

        const node: MarkmapNode = {
            content: id,
        };

        if (validChildren.length > 0) {
            node.children = validChildren.map(buildNode);
        }
        return node;
    }

    // Creating a synthetic root if multiple roots exist
    return {
        content: "Assemblage Rhizome",
        children: actualRoots.map(buildNode)
    };
}

export function RhizomeNetwork({ network }: RhizomeNetworkProps) {
    const data = useMemo(() => buildMarkmapData(network), [network]);

    if (!network || network.nodes.length === 0) return null;

    return (
        <Card className="border-indigo-100 shadow-sm overflow-hidden h-full">
            <CardHeader className="bg-indigo-50/50 pb-3 flex flex-row items-center justify-between">
                <div className="space-y-1.5">
                    <CardTitle className="text-base font-semibold text-indigo-900 flex items-center gap-2">
                        <Network className="h-5 w-5 text-indigo-600" />
                        Assemblage Rhizome
                    </CardTitle>
                    <CardDescription>
                        Tracing shared ancestry and inter-referential citations.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-0 bg-white min-h-[400px] h-96">
                <ConceptMap data={data} options={{ fitRatio: 0.95 }} />
            </CardContent>
        </Card>
    );
}
