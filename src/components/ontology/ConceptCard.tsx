import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ConceptCardProps {
    title: string;
    concepts: string[];
    variant?: 'default' | 'outline' | 'secondary' | 'destructive';
    emptyMessage?: string;
    className?: string; // Additional styling
}

export function ConceptCard({
    title,
    concepts,
    variant = 'secondary',
    emptyMessage = "No concepts identified.",
    className
}: ConceptCardProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-base text-slate-500">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {(concepts || []).map((concept, i) => (
                        <Badge key={i} variant={variant}>
                            {concept}
                        </Badge>
                    ))}
                    {(!concepts || concepts.length === 0) && (
                        <span className="text-xs text-slate-400 italic">{emptyMessage}</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
