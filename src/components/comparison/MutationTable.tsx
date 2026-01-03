"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowRight, Plane, GitBranch } from 'lucide-react';

interface ConceptMutation {
    concept: string;
    origin_context: string;
    local_mutation: string;
    mechanism: string;
}

interface MutationTableProps {
    mutations: ConceptMutation[];
}

export function MutationTable({ mutations }: MutationTableProps) {
    if (!mutations || mutations.length === 0) return null;

    return (
        <Card className="border-indigo-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-indigo-50/50 pb-3">
                <CardTitle className="text-base font-semibold text-indigo-900 flex items-center gap-2">
                    <Plane className="h-5 w-5 text-indigo-600" />
                    Policy Mobilities & Mutations
                </CardTitle>
                <CardDescription>
                    Tracing how key concepts travel and transform between jurisdictions.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 border-b border-slate-100">
                                <TableHead className="w-[15%] font-semibold text-slate-700">Travellng Concept</TableHead>
                                <TableHead className="w-[20%] font-semibold text-slate-500">Origin / Source</TableHead>
                                <TableHead className="w-[5%]"></TableHead>
                                <TableHead className="w-[30%] font-semibold text-indigo-700">Local Mutation (The Shift)</TableHead>
                                <TableHead className="w-[30%] font-semibold text-slate-500">Translation Mechanism</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mutations.map((mut, idx) => (
                                <TableRow key={idx} className="hover:bg-slate-50/50">
                                    <TableCell className="font-medium text-slate-900 align-top py-4 whitespace-normal break-words">
                                        <div className="flex items-start gap-2">
                                            <GitBranch className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                                            {mut.concept}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500 align-top py-4 bg-slate-50/30 whitespace-normal break-words">
                                        {mut.origin_context}
                                    </TableCell>
                                    <TableCell className="align-top py-4">
                                        <ArrowRight className="h-4 w-4 text-slate-300 mx-auto" />
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-800 align-top py-4 font-medium bg-indigo-50/10 whitespace-normal break-words">
                                        {mut.local_mutation}
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500 align-top py-4 italic whitespace-normal break-words">
                                        {mut.mechanism}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
