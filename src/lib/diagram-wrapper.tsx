"use client";

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Interface for Markmap JSON structure
export interface MarkmapNode {
    content: string;
    children?: MarkmapNode[];
    state?: {
        fold?: number;
    };
}

interface ConceptMapProps {
    data: MarkmapNode;
    options?: any;
    className?: string;
}

const ConceptMapInternal = ({ data, options }: ConceptMapProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const mmRef = useRef<any>(null);

    useEffect(() => {
        const loadMarkmap = async () => {
            // Dynamic import to avoid SSR/Bundle issues
            const { Markmap, loadCSS, loadJS } = await import('markmap-view');

            if (svgRef.current && !mmRef.current) {
                mmRef.current = Markmap.create(svgRef.current, options);
            }

            if (mmRef.current) {
                mmRef.current.setData(data);
                mmRef.current.fit();
            }
        };

        loadMarkmap();
    }, [data, options]);

    return <svg ref={svgRef} className="w-full h-full" />;
};

// Export as dynamic component
export const ConceptMap = dynamic(Promise.resolve(ConceptMapInternal), {
    ssr: false
});
