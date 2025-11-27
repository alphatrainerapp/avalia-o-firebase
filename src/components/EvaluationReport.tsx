'use client';
import React, { forwardRef, useState, useEffect } from 'react';
import type { Evaluation, Client, BioimpedanceScale } from '@/lib/data';
import { calculateBodyComposition } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { BarChart, PieChart, User } from 'lucide-react';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart as RechartsBarChart } from 'recharts';

type EvaluationReportProps = {
    client: Client;
    evaluation?: Evaluation;
    comparedEvaluations: Evaluation[];
    perimetriaFields: { key: string, label: string }[];
};

const EvaluationReport = forwardRef<HTMLDivElement, EvaluationReportProps>(({ client, evaluation, comparedEvaluations, perimetriaFields }, ref) => {
    
    const evaluationsToDisplay = comparedEvaluations.length > 0 ? comparedEvaluations : (evaluation ? [evaluation] : []);
    const mainEvaluation = evaluationsToDisplay[0];
    const [evalDate, setEvalDate] = useState('');

    useEffect(() => {
        if (mainEvaluation?.date) {
            setEvalDate(new Date(mainEvaluation.date).toLocaleDateString('pt-BR'));
        }
    }, [mainEvaluation]);

    const { fatMassKg, muscleMassKg, residualMassKg, boneMassKg } = mainEvaluation ? calculateBodyComposition(mainEvaluation, client) : { fatMassKg: 0, muscleMassKg: 0, residualMassKg: 0, boneMassKg: 0 };
    
    const bmi = mainEvaluation && mainEvaluation.bodyMeasurements.weight && mainEvaluation.bodyMeasurements.height
        ? (mainEvaluation.bodyMeasurements.weight / ((mainEvaluation.bodyMeasurements.height / 100) ** 2)).toFixed(1)
        : 'N/A';

    const chartData = [
        { name: 'Massa Gorda (kg)', value: parseFloat(fatMassKg.toFixed(2)), fill: '#f87171' },
        { name: 'Massa Muscular (kg)', value: parseFloat(muscleMassKg.toFixed(2)), fill: '#60a5fa' },
        { name: 'Massa Residual (kg)', value: parseFloat(residualMassKg.toFixed(2)), fill: '#a3a3a3' },
    ];
    
    const evolutionChartData = evaluationsToDisplay.map(ev => {
        const masses = calculateBodyComposition(ev, client);
        return {
            date: new Date(ev.date).toLocaleDateString('pt-BR'),
            'Gordura (kg)': masses.fatMassKg,
            'Músculo (kg)': masses.muscleMassKg,
        }
    });

    return (
        <div ref={ref} className="p-8 font-sans bg-white text-gray-800">
            <header className="flex items-center justify-between pb-4 border-b-2 border-gray-700">
                <div className="flex items-center">
                    <div className="p-2 bg-gray-700 text-white font-bold text-2xl tracking-wider">SMART</div>
                    <div className="p-2 bg-blue-500 text-white font-bold text-2xl tracking-wider">EVOLUTION</div>
                </div>
                <div className="text-right">
                    <h1 className="text-2xl font-bold text-gray-700">RELATÓRIO DE AVALIAÇÃO FÍSICA</h1>
                </div>
            </header>

            <section className="mt-4 border border-gray-400 p-2">
                <h2 className="font-bold flex items-center gap-2"><User size={16} /> DADOS PESSOAIS</h2>
                <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                    <div><strong>Nome:</strong> {client.name}</div>
                    <div><strong>Idade:</strong> {client.age}</div>
                    <div><strong>Sexo:</strong> {client.gender}</div>
                    <div><strong>Data da avaliação:</strong> {evalDate}</div>
                </div>
            </section>
            
            <section className="mt-4 border border-gray-400 p-2">
                <h2 className="font-bold flex items-center gap-2"><BarChart size={16}/> DADOS DA AVALIAÇÃO</h2>
                 <Table className="mt-2 text-xs">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-bold">Medida</TableHead>
                            {evaluationsToDisplay.map(ev => (
                                <TableHead key={ev.id} className="text-center font-bold">{new Date(ev.date).toLocaleDateString('pt-BR')}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Peso (kg)</TableCell>
                            {evaluationsToDisplay.map(ev => <TableCell key={ev.id} className="text-center">{ev.bodyMeasurements.weight.toFixed(1)}</TableCell>)}
                        </TableRow>
                        <TableRow>
                            <TableCell>Altura (m)</TableCell>
                            {evaluationsToDisplay.map(ev => <TableCell key={ev.id} className="text-center">{(ev.bodyMeasurements.height / 100).toFixed(2)}</TableCell>)}
                        </TableRow>
                        <TableRow>
                            <TableCell>IMC</TableCell>
                             {evaluationsToDisplay.map(ev => {
                                 const currentBmi = ev.bodyMeasurements.weight && ev.bodyMeasurements.height
                                    ? (ev.bodyMeasurements.weight / ((ev.bodyMeasurements.height / 100) ** 2)).toFixed(1)
                                    : 'N/A';
                                return <TableCell key={ev.id} className="text-center">{currentBmi}</TableCell>
                            })}
                        </TableRow>
                         <TableRow>
                            <TableCell>% Gordura Corporal</TableCell>
                            {evaluationsToDisplay.map(ev => <TableCell key={ev.id} className="text-center">{ev.bodyComposition.bodyFatPercentage.toFixed(1)}%</TableCell>)}
                        </TableRow>
                        <TableRow>
                            <TableCell>Massa Gorda (kg)</TableCell>
                             {evaluationsToDisplay.map(ev => {
                                 const masses = calculateBodyComposition(ev, client);
                                return <TableCell key={ev.id} className="text-center">{masses.fatMassKg.toFixed(2)}</TableCell>
                            })}
                        </TableRow>
                        <TableRow>
                            <TableCell>Massa Muscular (kg)</TableCell>
                             {evaluationsToDisplay.map(ev => {
                                 const masses = calculateBodyComposition(ev, client);
                                return <TableCell key={ev.id} className="text-center">{masses.muscleMassKg.toFixed(2)}</TableCell>
                            })}
                        </TableRow>
                        <TableRow>
                            <TableCell>Massa Residual (kg)</TableCell>
                             {evaluationsToDisplay.map(ev => {
                                 const masses = calculateBodyComposition(ev, client);
                                return <TableCell key={ev.id} className="text-center">{masses.residualMassKg.toFixed(2)}</TableCell>
                            })}
                        </TableRow>
                        <TableRow>
                            <TableCell>Massa Óssea (kg)</TableCell>
                            {evaluationsToDisplay.map(ev => {
                                 const masses = calculateBodyComposition(ev, client);
                                return <TableCell key={ev.id} className="text-center">{masses.boneMassKg.toFixed(2)}</TableCell>
                            })}
                        </TableRow>
                    </TableBody>
                </Table>
            </section>
            
            <section className="mt-4">
                <h2 className="font-bold text-center mb-2">EVOLUÇÃO DURANTE O PERÍODO</h2>
                <div className="grid grid-cols-3 gap-4 items-end">
                    <Card className="col-span-1">
                        <CardHeader className="p-2 bg-blue-500 text-white text-center rounded-t-lg"><CardTitle className="text-sm">GORDURA (KG)</CardTitle></CardHeader>
                        <CardContent className="p-2">
                             <ResponsiveContainer width="100%" height={150}>
                                <RechartsBarChart data={evolutionChartData}>
                                    <XAxis dataKey="date" fontSize={10} />
                                    <YAxis fontSize={10} />
                                    <Tooltip wrapperClassName="text-xs" />
                                    <Bar dataKey="Gordura (kg)" fill="#f87171" />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="col-span-1">
                         <CardHeader className="p-2 bg-blue-500 text-white text-center rounded-t-lg"><CardTitle className="text-sm">MASSA MUSCULAR (KG)</CardTitle></CardHeader>
                        <CardContent className="p-2">
                            <ResponsiveContainer width="100%" height={150}>
                                <RechartsBarChart data={evolutionChartData}>
                                    <XAxis dataKey="date" fontSize={10} />
                                    <YAxis fontSize={10} />
                                    <Tooltip wrapperClassName="text-xs" />
                                    <Bar dataKey="Músculo (kg)" fill="#60a5fa" />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <div className="col-span-1 text-center">
                        <h3 className="font-bold">Distribuição Corporal</h3>
                        <ResponsiveContainer width="100%" height={150}>
                            <RechartsPieChart>
                                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                    return (
                                        <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10}>
                                            {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                    );
                                }}>
                                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip wrapperClassName="text-xs"/>
                            </RechartsPieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center flex-wrap text-xs gap-x-4">
                           {chartData.map(item => (
                               <div key={item.name} className="flex items-center gap-1">
                                   <div className="w-2 h-2" style={{backgroundColor: item.fill}}></div>
                                   <span>{item.name}</span>
                               </div>
                           ))}
                        </div>
                    </div>
                </div>
            </section>
            
            <section className="mt-4">
                 <h2 className="font-bold flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ruler"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0L21.3 15.3z"/><path d="m9.4 12.6 6-6"/><path d="m3 21 2.6-2.6"/><path d="m18.4 5.6 2.6-2.6"/><path d="m21 3-3.4 3.4"/><path d="m3 21 3.4-3.4"/></svg> PERIMETRIA CORPORAL</h2>
                <Table className="mt-2 text-xs">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-bold">Medida</TableHead>
                            {evaluationsToDisplay.map(ev => (
                                <TableHead key={ev.id} className="text-center font-bold">{new Date(ev.date).toLocaleDateString('pt-BR')}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {perimetriaFields.map(field => (
                             <TableRow key={field.key}>
                                <TableCell>{field.label}</TableCell>
                                {evaluationsToDisplay.map(ev => (
                                    <TableCell key={ev.id} className="text-center">{ev.perimetria?.[field.key]?.toFixed(1) || '-'}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </section>
        </div>
    );
});

EvaluationReport.displayName = "EvaluationReport";
export default EvaluationReport;

    