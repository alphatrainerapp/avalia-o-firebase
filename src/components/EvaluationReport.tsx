'use client';
import React, { forwardRef, useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import type { Evaluation, Client, SkinfoldKeys } from '@/lib/data';
import { 
    calculateBodyComposition, 
    getFunctionalClassification, 
    getBoneDensityClassification,
    getFatClassification,
    getAsymmetryClassification,
    calculateRCQ,
    getRcqClassification,
    calculateRCE,
    getRceClassification
} from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { User, BarChart, PieChart as PieChartIcon, Target, TrendingDown, TrendingUp, Activity, Bone } from 'lucide-react';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Bar, XAxis, YAxis, Tooltip, BarChart as RechartsBarChart, Legend } from 'recharts';

type EvaluationReportProps = {
    client: Client;
    evaluation?: Evaluation;
    comparedEvaluations: Evaluation[];
    perimetriaFields: { key: string, label: string }[];
    skinfoldFields: { name: SkinfoldKeys, label: string }[];
};

const Section = ({ title, icon, children, className }: { title: string, icon: React.ReactNode, children: React.ReactNode, className?: string }) => (
    <section className={`mt-6 break-inside-avoid ${className}`}>
        <div className="flex items-center gap-2 mb-3 pb-1 border-b border-gray-300">
            {icon}
            <h2 className="font-bold text-gray-700 uppercase tracking-wide text-xs">{title}</h2>
        </div>
        {children}
    </section>
);


const EvaluationReport = forwardRef<HTMLDivElement, EvaluationReportProps>(({ client, evaluation, comparedEvaluations, perimetriaFields, skinfoldFields }, ref) => {
    
    const evaluationsToDisplay = useMemo(() => 
        comparedEvaluations.length > 0 ? comparedEvaluations : (evaluation ? [evaluation] : []),
    [comparedEvaluations, evaluation]);

    const mainEvaluation = useMemo(() => evaluationsToDisplay[evaluationsToDisplay.length - 1], [evaluationsToDisplay]);
    
    const [headerDates, setHeaderDates] = useState<string[]>([]);

    useEffect(() => {
        if (evaluationsToDisplay.length > 0) {
            const dates = evaluationsToDisplay.map(ev => new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR'));
            setHeaderDates(dates);
        }
    }, [evaluationsToDisplay]);


    const bodyComp = useMemo(() => mainEvaluation ? calculateBodyComposition(mainEvaluation, client) : null, [mainEvaluation, client]);
    
    const pieChartData = useMemo(() => {
        if (!bodyComp) return [];
        return [
            { name: 'Massa Gorda', value: parseFloat(bodyComp.fatMassKg.toFixed(2)), fill: '#ef4444' },
            { name: 'Massa Muscular', value: parseFloat(bodyComp.muscleMassKg.toFixed(2)), fill: '#3b82f6' },
            { name: 'Massa Óssea', value: parseFloat(bodyComp.boneMassKg.toFixed(2)), fill: '#eab308' },
            { name: 'Massa Residual', value: parseFloat(bodyComp.residualMassKg.toFixed(2)), fill: '#a3a3a3' },
        ];
    }, [bodyComp]);
    
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

    const functionalTests = [
        { id: 'pushUps', label: 'Flexão de Braço (reps)' },
        { id: 'sitUps', label: 'Abdominal 1 min (reps)' },
        { id: 'handgrip', label: 'Handgrip (kgf)' },
        { id: 'wells', label: 'Banco de Wells (cm)' },
    ];

    return (
        <div ref={ref} className="p-8 font-sans bg-white text-gray-900 text-[10px] w-[800px]">
            {/* Header */}
            <header className="flex items-start justify-between pb-3 border-b-2 border-gray-900 mb-4">
                <div className="flex items-center gap-4">
                     {logo && <Image src={logo.imageUrl} alt="Logo" width={140} height={35} className="object-contain" />}
                </div>
                <div className="text-right">
                    <h1 className="text-lg font-bold text-gray-800">Relatório de Avaliação Física</h1>
                    <p className="text-sm text-gray-600">Marcelo Prado</p>
                </div>
            </header>

            {/* Atleta Info */}
            <div className="flex items-center gap-4 mt-2 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-14 w-14">
                    <AvatarImage src={client.avatarUrl} alt={client.name} />
                    <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="grid grid-cols-4 gap-x-4 gap-y-1 text-[11px] flex-1">
                    <div><strong className="block text-gray-500 text-[10px]">Nome:</strong> {client.name}</div>
                    <div><strong className="block text-gray-500 text-[10px]">Idade:</strong> {client.age} anos</div>
                    <div><strong className="block text-gray-500 text-[10px]">Sexo:</strong> {client.gender}</div>
                    <div><strong className="block text-gray-500 text-[10px]">Data:</strong> {new Date(mainEvaluation.date.replace(/-/g, '/')).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            {/* Página 1: Composição Corporal e Evolução */}
            <Section title="Análise de Composição Corporal (4 Componentes)" icon={<BarChart size={14} className="text-gray-600"/>}>
                <div className="grid grid-cols-2 gap-6 mt-2">
                    <div className="text-center">
                        <h3 className="font-bold text-[9px] mb-2 uppercase text-gray-500 tracking-wider">Distribuição Atual (kg)</h3>
                        <ResponsiveContainer width="100%" height={160}>
                            <RechartsPieChart>
                                <Pie 
                                    data={pieChartData} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={40} 
                                    outerRadius={60} 
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} 
                                    labelLine={false} 
                                    fontSize={8}
                                    stroke="none"
                                >
                                    {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${value} kg`, name]} />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-center">
                         <h3 className="font-bold text-[9px] mb-2 uppercase text-gray-500 tracking-wider">Evolução de Tecidos (kg)</h3>
                        <ResponsiveContainer width="100%" height={160}>
                            <RechartsBarChart data={evolutionChartData}>
                                <XAxis dataKey="date" fontSize={8} tick={{ fill: '#374151' }} />
                                <YAxis fontSize={8} tick={{ fill: '#374151' }} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: '8px' }} iconSize={6}/>
                                <Bar dataKey="Gordura (kg)" fill="#ef4444" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="Músculo (kg)" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                <Table className="mt-4 text-[9px]">
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
                            { label: 'Massa Muscular (kg)', key: 'muscleMassKg', format: (val: number) => val.toFixed(2) },
                            { label: 'Massa Óssea (kg)', key: 'boneMassKg', format: (val: number) => val.toFixed(2) },
                            { label: 'Massa Residual (kg)', key: 'residualMassKg', format: (val: number) => val.toFixed(2) },
                        ].map(metric => (
                            <TableRow key={metric.key}>
                                <TableCell className="font-medium py-1">{metric.label}</TableCell>
                                {evaluationsToDisplay.map(ev => {
                                    const masses = calculateBodyComposition(ev, client);
                                    let value;
                                    if(metric.key === 'weight') value = ev.bodyMeasurements.weight;
                                    else if(metric.key === 'bodyFatPercentage') value = ev.bodyComposition.bodyFatPercentage;
                                    else value = (masses as any)[metric.key];

                                    return <TableCell key={ev.id} className="text-center py-1">{typeof value === 'number' ? metric.format(value) : '-'}</TableCell>
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Section>

            {/* Página 2: Dados Brutos (Perimetria e Dobras) */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-dashed mt-8">
                <Section title="Perimetria Corporal (cm)" icon={<Activity size={14} className="text-gray-600"/>} className="mt-0">
                    <Table className="text-[9px]">
                        <TableHeader>
                            <TableRow className="bg-gray-100">
                                <TableHead className="font-bold text-gray-600">Local</TableHead>
                                {headerDates.map((date, index) => (
                                    <TableHead key={index} className="text-center font-bold text-gray-600">{date}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {perimetriaFields.map(field => (
                                <TableRow key={field.key}>
                                    <TableCell className="font-medium py-0.5">{field.label}</TableCell>
                                    {evaluationsToDisplay.map(ev => (
                                        <TableCell key={ev.id} className="text-center py-0.5">{ev.perimetria?.[field.key]?.toFixed(1) || '-'}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Section>

                <Section title="Dobras Cutâneas (mm)" icon={<Activity size={14} className="text-gray-600"/>} className="mt-0">
                    <Table className="text-[9px]">
                        <TableHeader>
                            <TableRow className="bg-gray-100">
                                <TableHead className="font-bold text-gray-600">Local</TableHead>
                                {headerDates.map((date, index) => (
                                    <TableHead key={index} className="text-center font-bold text-gray-600">{date}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {skinfoldFields.map(field => (
                                <TableRow key={field.name}>
                                    <TableCell className="font-medium py-0.5">{field.label}</TableCell>
                                    {evaluationsToDisplay.map(ev => (
                                        <TableCell key={ev.id} className="text-center py-0.5">{ev.skinFolds?.[field.name]?.toFixed(1) || '-'}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Section>
            </div>

            {/* Página 3: Resumo de Indicadores e Simetria (Igual à Dash) */}
            <Section title="Resumo de Indicadores e Simetria" icon={<Target size={14} className="text-gray-600"/>}>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                    {evaluationsToDisplay.map(ev => {
                        const masses = calculateBodyComposition(ev, client);
                        const skinfoldsSum = ev.skinFolds ? Object.values(ev.skinFolds).reduce((s, v) => s + (v || 0), 0) : 0;
                        const rcq = calculateRCQ(ev.perimetria?.cintura, ev.perimetria?.quadril);
                        const rce = calculateRCE(ev.perimetria?.cintura, ev.bodyMeasurements.height);
                        const boneClass = getBoneDensityClassification(masses.boneMassPercentage, client.gender);
                        const armAsym = getAsymmetryClassification(ev.perimetria?.bracoDRelaxado, ev.perimetria?.bracoERelaxado);
                        const thighAsym = getAsymmetryClassification(ev.perimetria?.coxaMedialD, ev.perimetria?.coxaMedialE);
                        const fatClass = getFatClassification(masses.fatMassPercentage, client.gender);

                        return (
                            <div key={ev.id} className="col-span-full border border-gray-200 rounded-lg p-3 bg-gray-50 mb-4">
                                <h4 className="font-bold text-primary mb-3 text-[11px] flex items-center gap-2">
                                    <TrendingUp size={12} /> Indicadores - Avaliação de {new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR')}
                                </h4>
                                <div className="grid grid-cols-4 gap-3">
                                    <div className="bg-white p-2 rounded border border-gray-100">
                                        <p className="text-[7px] font-bold text-gray-400 uppercase">Soma Dobras</p>
                                        <p className="text-sm font-black text-gray-800">{skinfoldsSum.toFixed(1)} <span className="text-[8px] font-normal">mm</span></p>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-gray-100">
                                        <p className="text-[7px] font-bold text-gray-400 uppercase">RCQ (C/Q)</p>
                                        <p className="text-sm font-black text-gray-800">{rcq}</p>
                                        <p className="text-[7px] font-bold text-primary uppercase">{getRcqClassification(rcq, client.gender)}</p>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-gray-100">
                                        <p className="text-[7px] font-bold text-gray-400 uppercase">RCE (C/E)</p>
                                        <p className="text-sm font-black text-gray-800">{rce}</p>
                                        <p className="text-[7px] font-bold text-primary uppercase">{getRceClassification(rce)}</p>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-gray-100">
                                        <p className="text-[7px] font-bold text-gray-400 uppercase">Densidade Óssea</p>
                                        <p className="text-sm font-black text-gray-800">{masses.boneMassKg.toFixed(1)} <span className="text-[8px] font-normal">kg</span></p>
                                        <p className="text-[7px] font-bold text-gray-500 uppercase">{boneClass}</p>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-gray-100">
                                        <p className="text-[7px] font-bold text-gray-400 uppercase">Assimetria Braços</p>
                                        <p className="text-[9px] font-black text-gray-800 uppercase">{armAsym}</p>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-gray-100">
                                        <p className="text-[7px] font-bold text-gray-400 uppercase">Assimetria Coxas</p>
                                        <p className="text-[9px] font-black text-gray-800 uppercase">{thighAsym}</p>
                                    </div>
                                    <div className="bg-primary/5 p-2 rounded border border-primary/20 col-span-2">
                                        <p className="text-[7px] font-bold text-primary uppercase">Gordura Calculada</p>
                                        <div className="flex justify-between items-baseline">
                                            <p className="text-sm font-black text-primary">{masses.fatMassPercentage.toFixed(1)}%</p>
                                            <p className="text-[8px] font-bold text-primary uppercase opacity-70">{fatClass}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Section>

            {/* Aptidão Física Section */}
            <Section title="Avaliação de Aptidão Física" icon={<Activity size={14} className="text-gray-600"/>}>
                <Table className="mt-1 text-[9px]">
                    <TableHeader>
                        <TableRow className="bg-gray-100">
                            <TableHead className="font-bold text-gray-600">Teste</TableHead>
                            {headerDates.map((date, index) => (
                                <TableHead key={index} className="text-center font-bold text-gray-600">Valor / Classe</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {functionalTests.map(test => (
                            <TableRow key={test.id}>
                                <TableCell className="font-medium py-1">{test.label}</TableCell>
                                {evaluationsToDisplay.map(ev => {
                                    const value = ev.functionalTests?.[test.id as keyof typeof ev.functionalTests] || 0;
                                    const { classification } = getFunctionalClassification(test.id as any, value, client.age, client.gender);
                                    return (
                                        <TableCell key={ev.id} className="text-center py-1">
                                            <span className="font-bold">{value}</span> <span className="text-[8px] text-primary font-bold uppercase">({classification})</span>
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Section>

            {/* Footer */}
            <footer className="mt-8 pt-3 border-t border-gray-300 text-center text-[8px] text-gray-500">
                <p>Este é um relatório gerado automaticamente por Alpha Trainer Engine &copy; {new Date().getFullYear()}.</p>
                <p>Os resultados devem ser interpretados por um profissional qualificado de Educação Física ou Saúde.</p>
            </footer>
        </div>
    );
});

EvaluationReport.displayName = "EvaluationReport";
export default EvaluationReport;
