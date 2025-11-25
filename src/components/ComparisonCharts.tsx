'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Evaluation, Client } from '@/lib/data';
import { calculateBodyComposition } from '@/lib/data';


type ComparisonChartsProps = {
    evaluations: Evaluation[];
    client: Client;
};


export default function ComparisonCharts({ evaluations, client }: ComparisonChartsProps) {
    const chartData = evaluations.map(ev => {
        const masses = calculateBodyComposition(ev, client);
        return {
            date: new Date(ev.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
            'Massa Gorda (kg)': parseFloat(masses.fatMassKg.toFixed(1)),
            'Massa Muscular (kg)': parseFloat(masses.muscleMassKg.toFixed(1)),
            'Massa Residual (kg)': parseFloat(masses.residualMassKg.toFixed(1)),
        };
    });

    const renderChart = (title: string, dataKey: string, color: string) => (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderColor: 'hsl(var(--border))',
                                    color: 'hsl(var(--foreground))'
                                }}
                            />
                            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="grid grid-cols-1 gap-6">
            {renderChart('Massa Gorda', 'Massa Gorda (kg)', 'hsl(var(--chart-2))')}
            {renderChart('Massa Muscular', 'Massa Muscular (kg)', 'hsl(var(--chart-1))')}
            {renderChart('Massa Residual', 'Massa Residual (kg)', 'hsl(var(--chart-3))')}
        </div>
    );
}
