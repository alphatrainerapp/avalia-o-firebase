'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { Evaluation, SkinfoldKeys, BoneDiameterKeys } from '@/lib/data';

type FieldDef = {
    key: string;
    label: string;
};

type SkinfoldFieldDef = {
    name: SkinfoldKeys;
    label: string;
}

type BoneDiameterFieldDef = {
    name: BoneDiameterKeys;
    label: string;
}

type ComparisonTableProps = {
    evaluations: Evaluation[];
    perimetriaFields: FieldDef[];
    skinfoldFields: SkinfoldFieldDef[];
    diametrosFields: BoneDiameterFieldDef[];
};

export function ComparisonTable({ evaluations, perimetriaFields, skinfoldFields, diametrosFields }: ComparisonTableProps) {
    
    const renderComparisonRows = (fields: (FieldDef | SkinfoldFieldDef | BoneDiameterFieldDef)[], dataKey: 'perimetria' | 'skinFolds' | 'boneDiameters') => {
        return fields.map((field) => {
            const fieldKey = 'key' in field ? field.key : field.name;
            return (
                <TableRow key={`${dataKey}-${fieldKey}`}>
                    <TableCell className="font-medium">{field.label}</TableCell>
                    {evaluations.map((ev, evalIndex) => {
                        const data = ev[dataKey];
                        const currentValue = data?.[fieldKey as keyof typeof data] as number | undefined;
                        
                        let difference: number | null = null;
                        if (evalIndex > 0) {
                            const prevEval = evaluations[evalIndex - 1];
                            const prevData = prevEval[dataKey];
                            const previousValue = prevData?.[fieldKey as keyof typeof prevData] as number | undefined;

                            if (typeof currentValue === 'number' && typeof previousValue === 'number') {
                                difference = currentValue - previousValue;
                            }
                        }

                        return (
                            <TableCell key={ev.id} className="text-center">
                                {typeof currentValue === 'number' ? currentValue.toFixed(1) : '-'}
                                {difference !== null && (
                                    <span className={cn(
                                        "block text-xs", 
                                        difference > 0 ? (dataKey === 'skinFolds' ? "text-red-500" : "text-green-500") : (dataKey === 'skinFolds' ? "text-green-500" : "text-red-500")
                                    )}>
                                       {difference > 0 ? '+' : ''}{difference.toFixed(1)}
                                    </span>
                                )}
                            </TableCell>
                        );
                    })}
                </TableRow>
            );
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tabela Comparativa</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
                <Tabs defaultValue="perimetria" className="w-full">
                    <TabsList className="bg-transparent p-0 border-b border-gray-200 justify-start rounded-none mb-4">
                        <TabsTrigger value="perimetria" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Perimetria</TabsTrigger>
                        <TabsTrigger value="dobras" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Dobras</TabsTrigger>
                        <TabsTrigger value="diametros" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Diâmetros</TabsTrigger>
                    </TabsList>
                    <TabsContent value="perimetria">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Medida</TableHead>
                                    {evaluations.map(ev => (
                                        <TableHead key={ev.id} className="text-center">
                                            {new Date(ev.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                            <p className="text-xs font-normal text-muted-foreground">(cm)</p>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {renderComparisonRows(perimetriaFields, 'perimetria')}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="dobras">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Medida</TableHead>
                                    {evaluations.map(ev => (
                                        <TableHead key={ev.id} className="text-center">
                                            {new Date(ev.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                            <p className="text-xs font-normal text-muted-foreground">(mm)</p>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {renderComparisonRows(skinfoldFields, 'skinFolds')}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="diametros">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Medida</TableHead>
                                    {evaluations.map(ev => (
                                        <TableHead key={ev.id} className="text-center">
                                            {new Date(ev.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                            <p className="text-xs font-normal text-muted-foreground">(cm)</p>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {renderComparisonRows(diametrosFields, 'boneDiameters')}
                            </TableBody>
                        </Table>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}