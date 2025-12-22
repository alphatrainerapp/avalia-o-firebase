'use client';
import React, { forwardRef, useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import type { Evaluation, Client } from '@/lib/data';
import { calculateBodyComposition } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { User, BarChart, PieChart as PieChartIcon, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Bar, XAxis, YAxis, Tooltip, BarChart as RechartsBarChart, Legend } from 'recharts';

type EvaluationReportProps = {
    client: Client;
    evaluation?: Evaluation;
    comparedEvaluations: Evaluation[];
    perimetriaFields: { key: string, label: string }[];
};

const Section = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <section className="mt-6">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-300">
            {icon}
            <h2 className="font-bold text-gray-700 uppercase tracking-wide text-sm">{title}</h2>
        </div>
        {children}
    </section>
);


const EvaluationReport = forwardRef<HTMLDivElement, EvaluationReportProps>(({ client, evaluation, comparedEvaluations, perimetriaFields }, ref) => {
    
    const evaluationsToDisplay = useMemo(() => 
        comparedEvaluations.length > 0 ? comparedEvaluations : (evaluation ? [evaluation] : []),
        [comparedEvaluations, evaluation]
    );

    const mainEvaluation = useMemo(() => evaluationsToDisplay[evaluationsToDisplay.length - 1], [evaluationsToDisplay]);
    
    const [headerDates, setHeaderDates] = useState<string[]>([]);

    useEffect(() => {
        if (evaluationsToDisplay.length > 0) {
            const dates = evaluationsToDisplay.map(ev => new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR'));
            setHeaderDates(dates);
        }
    }, [evaluationsToDisplay]);


    const { fatMassKg, muscleMassKg, boneMassKg, leanMassKg, residualMassKg, idealWeight, fatLossNeeded } = mainEvaluation ? calculateBodyComposition(mainEvaluation, client) : { fatMassKg: 0, muscleMassKg: 0, boneMassKg: 0, leanMassKg: 0, residualMassKg: 0, idealWeight: 0, fatLossNeeded: 0 };
    
    const pieChartData = [
        { name: 'Massa Gorda', value: parseFloat(fatMassKg.toFixed(2)), fill: '#ef4444' }, // red-500
        { name: 'Massa Muscular', value: parseFloat(muscleMassKg.toFixed(2)), fill: '#3b82f6' }, // blue-500
        { name: 'Massa Óssea', value: parseFloat(boneMassKg.toFixed(2)), fill: '#eab308' }, // yellow-500
        { name: 'Massa Residual', value: parseFloat(residualMassKg.toFixed(2)), fill: '#a3a3a3' }, // neutral-400
    ];
    
    const evolutionChartData = evaluationsToDisplay.map(ev => {
        const masses = calculateBodyComposition(ev, client);
        return {
            date: new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR', {month: 'short', day: '2-digit'}),
            'Gordura (kg)': masses.fatMassKg,
            'Músculo (kg)': masses.muscleMassKg,
        }
    });

    const logo = getPlaceholderImage('alpha-trainer-logo');

    if (!mainEvaluation) return <div ref={ref}></div>;

    return (
        <div ref={ref} className="p-8 font-sans bg-white text-gray-900 text-xs w-[800px]">
            {/* Header */}
            <header className="flex items-start justify-between pb-4 border-b-2 border-gray-900">
                <div className="flex items-center gap-4">
                     {logo && <Image src={logo.imageUrl} alt="Logo" width={150} height={40} className="object-contain" />}
                </div>
                <div className="text-right">
                    <h1 className="text-xl font-bold text-gray-800">Relatório de Avaliação Física</h1>
                    <p className="text-sm text-gray-600">Marcelo Prado</p>
                </div>
            </header>

            {/* Client Info */}
            <Section title="Dados do Cliente" icon={<User size={16} className="text-gray-600"/>}>
                 <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={client.avatarUrl} alt={client.name} />
                        <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="grid grid-cols-4 gap-x-6 gap-y-2 text-sm flex-1">
                        <div><strong className="block text-gray-500">Nome:</strong> {client.name}</div>
                        <div><strong className="block text-gray-500">Idade:</strong> {client.age}</div>
                        <div><strong className="block text-gray-500">Sexo:</strong> {client.gender}</div>
                        <div><strong className="block text-gray-500">Altura:</strong> {(mainEvaluation.bodyMeasurements.height / 100).toFixed(2)} m</div>
                    </div>
                </div>
            </Section>

            {/* Main Results Table */}
            <Section title="Resultados Principais" icon={<BarChart size={16} className="text-gray-600"/>}>
                 <Table className="mt-2 text-xs">
                    <TableHeader>
                        <TableRow className="bg-gray-100">
                            <TableHead className="font-bold text-gray-600">Medida</TableHead>
                            {headerDates.map((date, index) => (
                                <TableHead key={index} className="text-center font-bold text-gray-600">{date}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[
                            { label: 'Peso (kg)', key: 'weight', format: (val: number) => val.toFixed(1) },
                            { label: '% Gordura Corporal', key: 'bodyFatPercentage', format: (val: number) => `${val.toFixed(1)}%` },
                            { label: 'Massa Gorda (kg)', key: 'fatMassKg', format: (val: number) => val.toFixed(2) },
                            { label: 'Massa Magra (kg)', key: 'leanMassKg', format: (val: number) => val.toFixed(2) },
                            { label: 'Massa Muscular (kg)', key: 'muscleMassKg', format: (val: number) => val.toFixed(2) },
                            { label: 'Massa Óssea (kg)', key: 'boneMassKg', format: (val: number) => val.toFixed(2) },
                        ].map(metric => (
                            <TableRow key={metric.key}>
                                <TableCell className="font-medium">{metric.label}</TableCell>
                                {evaluationsToDisplay.map(ev => {
                                    const masses = calculateBodyComposition(ev, client);
                                    let value;
                                    if(metric.key === 'weight') value = ev.bodyMeasurements.weight;
                                    else if(metric.key === 'bodyFatPercentage') value = ev.bodyComposition.bodyFatPercentage;
                                    else value = masses[metric.key as keyof typeof masses];

                                    return <TableCell key={ev.id} className="text-center">{typeof value === 'number' ? metric.format(value) : '-'}</TableCell>
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Section>

            {/* Body Composition Charts */}
            <Section title="Composição Corporal" icon={<PieChartIcon size={16} className="text-gray-600"/>}>
                <div className="grid grid-cols-2 gap-8 mt-4">
                    <div className="text-center">
                        <h3 className="font-semibold text-sm mb-2">Distribuição da Última Avaliação ({headerDates[headerDates.length - 1]})</h3>
                        <ResponsiveContainer width="100%" height={180}>
                            <RechartsPieChart>
                                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                                    {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${value} kg`, name]} wrapperClassName="text-xs" />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-center">
                         <h3 className="font-semibold text-sm mb-2">Evolução da Composição</h3>
                        <ResponsiveContainer width="100%" height={180}>
                            <RechartsBarChart data={evolutionChartData}>
                                <XAxis dataKey="date" fontSize={10} tick={{ fill: '#374151' }} />
                                <YAxis fontSize={10} tick={{ fill: '#374151' }} />
                                <Tooltip wrapperClassName="text-xs" />
                                <Legend wrapperStyle={{ fontSize: '10px' }} iconSize={10}/>
                                <Bar dataKey="Gordura (kg)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Músculo (kg)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </Section>

            {/* Goals */}
            <Section title="Metas e Objetivos" icon={<Target size={16} className="text-gray-600"/>}>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="bg-gray-100 p-3 rounded-lg text-center">
                        <h4 className="font-semibold text-sm text-gray-600">Peso Ideal Estimado</h4>
                        <p className="text-2xl font-bold text-gray-800">{idealWeight > 0 ? idealWeight.toFixed(1) : '-'} kg</p>
                    </div>
                     <div className="bg-gray-100 p-3 rounded-lg text-center">
                        <h4 className="font-semibold text-sm text-gray-600">Necessidade de Perda de Gordura</h4>
                         <p className={`text-2xl font-bold ${fatLossNeeded > 0 ? 'text-red-500' : 'text-green-600'}`}>{fatLossNeeded.toFixed(1)} kg</p>
                    </div>
                </div>
            </Section>


            {/* Perimetria */}
            <Section title="Perimetria Corporal (cm)" icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ruler"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0L21.3 15.3z"/><path d="m9.4 12.6 6-6"/><path d="m3 21 2.6-2.6"/><path d="m18.4 5.6 2.6-2.6"/><path d="m21 3-3.4 3.4"/><path d="m3 21 3.4-3.4"/></svg>}>
                <Table className="mt-2 text-xs">
                    <TableHeader>
                        <TableRow className="bg-gray-100">
                            <TableHead className="font-bold text-gray-600">Medida</TableHead>
                             {headerDates.map((date, index) => (
                                <TableHead key={index} className="text-center font-bold text-gray-600">{date}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {perimetriaFields.map(field => (
                             <TableRow key={field.key}>
                                <TableCell className="font-medium">{field.label}</TableCell>
                                {evaluationsToDisplay.map(ev => (
                                    <TableCell key={ev.id} className="text-center">{ev.perimetria?.[field.key]?.toFixed(1) || '-'}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Section>

            {/* Footer */}
            <footer className="mt-8 text-center text-xs text-gray-500">
                <p>Este é um relatório gerado automaticamente. Os resultados devem ser interpretados por um profissional qualificado.</p>
                <p>Relatório gerado por Alpha Trainer &copy; {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
});

EvaluationReport.displayName = "EvaluationReport";
export default EvaluationReport;
