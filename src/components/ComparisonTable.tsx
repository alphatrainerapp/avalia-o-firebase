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
        return fields.map((field, index) => {
            const fieldKey = 'key' in field ? field.key : field.name;
            return (
                <TableRow key={`${dataKey}-${fieldKey}`}>
                    <TableCell className="font-medium">{field.label}</TableCell>
                    {evaluations.map((ev, evalIndex) => {
                        const data = ev[dataKey] as any;
                        const currentValue = data?.[fieldKey] as number | undefined;
                        
                        let difference: number | null = null;
                        if (evalIndex > 0) {
                            const prevEval = evaluations[evalIndex - 1];
                            const prevData = prevEval[dataKey] as any;
                            const previousValue = prevData?.[fieldKey] as number | undefined;
                            if (currentValue !== undefined && previousValue !== undefined) {
                                difference = currentValue - previousValue;
                            }
                        }

                        return (
                            <TableCell key={ev.id}>
                                {currentValue?.toFixed(1) ?? '-'}
                                {difference !== null && (
                                    <p className={cn("text-sm", difference > 0 ? "text-green-500" : "text-red-500")}>
                                        {difference.toFixed(1)}
                                    </p>
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
            <CardContent className="pt-6">
                <Tabs defaultValue="perimetria" className="w-full">
                    <TabsList className="bg-transparent p-0 border-b border-gray-200 justify-start rounded-none">
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
