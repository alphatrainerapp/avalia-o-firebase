'use client';
import React, { forwardRef, useState, useEffect } from 'react';
import type { Evaluation, Client, BioimpedanceScale, BioimpedanceInBody, BioimpedanceOmron } from '@/lib/data';
import { User, BarChart, Activity, Droplet, Bone, Scale, Zap, HeartPulse, Percent, TrendingUp, TrendingDown, Target, PieChartIcon } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, PieChart as RechartsPieChart, Pie, Cell, Bar as RechartsBar, BarChart as RechartsBarChart } from 'recharts';
import { calculateBodyComposition } from '@/lib/data';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getPlaceholderImage } from '@/lib/placeholder-images';

type BioimpedanceReportProps = {
    client: Client;
    evaluations: Evaluation[];
    scaleType: BioimpedanceScale;
    inbodyFields: { block: string; fields: { key: keyof BioimpedanceInBody; label: string; unit: string }[] }[];
    omronFields: { key: keyof BioimpedanceOmron; label: string; unit: string }[];
};

const Section = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <section className="mt-4 break-inside-avoid">
        <div className="flex items-center gap-2 mb-2 pb-1 border-b border-gray-300">
            {icon}
            <h2 className="font-bold text-gray-700 uppercase tracking-wide text-sm">{title}</h2>
        </div>
        {children}
    </section>
);


const BioimpedanceReport = forwardRef<HTMLDivElement, BioimpedanceReportProps>(({ client, evaluations, scaleType, inbodyFields, omronFields }, ref) => {
    
    const mainEvaluation = evaluations[evaluations.length - 1]; // Use the latest evaluation for main data
    const historyEvaluations = evaluations.slice(-5); // Get last 5 for history
    const [examDate, setExamDate] = useState('');
    const logo = getPlaceholderImage('alpha-trainer-logo');


    useEffect(() => {
        if(mainEvaluation?.date) {
            const dateStr = mainEvaluation.date;
            setExamDate(new Date(dateStr.includes('/') ? dateStr : dateStr.replace(/-/g, '/')).toLocaleDateString('pt-BR'));
        }
    }, [mainEvaluation]);

    const getData = (evaluation: Evaluation, key: string) => {
        if (scaleType === 'inbody' && evaluation.bioimpedance.inbody) {
            return (evaluation.bioimpedance.inbody as any)[key] ?? '-';
        }
        if (scaleType === 'omron' && evaluation.bioimpedance.omron) {
             return (evaluation.bioimpedance.omron as any)[key] ?? '-';
        }
        return '-';
    };
    
    const bmi = getData(mainEvaluation, 'bmi');
    const getBmiClassification = (bmi?: number | string) => {
        if (!bmi || bmi === '-') return '#N/D';
        const bmiValue = typeof bmi === 'string' ? parseFloat(bmi) : bmi;
        if (bmiValue < 18.5) return 'Abaixo do peso';
        if (bmiValue < 24.9) return 'Peso normal';
        if (bmiValue < 29.9) return 'Sobrepeso';
        if (bmiValue < 34.9) return 'Obesidade Grau I';
        if (bmiValue < 39.9) return 'Obesidade Grau II';
        return 'Obesidade Grau III';
    };

    const fatPercentage = getData(mainEvaluation, 'bodyFatPercentage');
    const getFatClassification = (percentage?: number|string) => {
        if (percentage === undefined || percentage === '-') return '#N/D';
        const p = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
        const gender = client.gender;
        if (gender === 'Feminino') {
            if (p < 20) return 'Atleta';
            if (p <= 24) return 'Bom';
            if (p <= 30) return 'Aceitável';
            return 'Obeso';
        } else {
            if (p < 12) return 'Atleta';
            if (p <= 16) return 'Bom';
            if (p <= 22) return 'Aceitável';
            return 'Obeso';
        }
    };
    
    const evolutionChartData = historyEvaluations.map((ev) => {
        const weight = getData(ev, scaleType === 'inbody' ? 'totalBodyWeight' : 'weight');
        const fatMass = getData(ev, 'bodyFatMass');
        const muscleMass = getData(ev, scaleType === 'inbody' ? 'skeletalMuscleMass' : 'leanBodyMass'); // Note: Omron uses leanBodyMass as proxy

        return {
            date: new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR', {month: 'short', day: '2-digit'}),
            'Peso (kg)': typeof weight === 'number' ? weight : 0,
            'Massa Gorda (kg)': typeof fatMass === 'number' ? fatMass : 0,
            'Massa Muscular (kg)': typeof muscleMass === 'number' ? muscleMass : 0,
        }
    });

    const bodyModelImage = getPlaceholderImage('body-model');

    const renderTable = (fields: { key: string, label: string, unit: string}[], title: string, icon: React.ElementType) => {
        return (
             <Section title={title} icon={React.createElement(icon, { size: 14, className: "text-gray-600"})}>
                <table className="w-full text-xs mt-1">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-1.5 text-left font-bold text-gray-600">Medida</th>
                            {historyEvaluations.map(ev => (
                                <th key={ev.id} className="p-1.5 text-center font-bold text-gray-600 w-1/6">{new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {fields.map(field => (
                             <tr key={field.key} className="border-t">
                                <td className="p-1.5 font-medium">{field.label} ({field.unit})</td>
                                {historyEvaluations.map(ev => (
                                    <td key={ev.id} className="p-1.5 text-center">{getData(ev, field.key)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>
        )
    }

    if (!mainEvaluation) return <div ref={ref}></div>;

    return (
        <div ref={ref} className="p-6 font-sans bg-white text-gray-900 text-xs w-[800px]">
            <header className="flex items-start justify-between pb-3 border-b-2 border-gray-900">
                <div className="flex items-center gap-4">
                     {logo && <Image src={logo.imageUrl} alt="Logo" width={140} height={35} className="object-contain" />}
                </div>
                <div className="text-right">
                    <h1 className="text-lg font-bold text-gray-800">Relatório de Bioimpedância</h1>
                    <p className="text-sm text-gray-600">Marcelo Prado</p>
                </div>
            </header>

            <Section title="Dados do Cliente" icon={<User size={14} className="text-gray-600"/>}>
                 <div className="flex items-center gap-4 mt-2">
                    <Avatar className="h-14 w-14">
                        <AvatarImage src={client.avatarUrl} alt={client.name} />
                        <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="grid grid-cols-4 gap-x-4 gap-y-1 text-sm flex-1">
                        <div><strong className="block text-gray-500 text-xs">Nome:</strong> {client.name}</div>
                        <div><strong className="block text-gray-500 text-xs">Idade:</strong> {client.age}</div>
                        <div><strong className="block text-gray-500 text-xs">Sexo:</strong> {client.gender}</div>
                        <div><strong className="block text-gray-500 text-xs">Data:</strong> {examDate}</div>
                    </div>
                </div>
            </Section>

            <Section title="Resultados da Composição Corporal" icon={<PieChartIcon size={14} className="text-gray-600"/>}>
                <div className="grid grid-cols-2 gap-6 mt-2">
                    <div className="text-center">
                        <h3 className="font-semibold text-xs mb-1">Análise de Obesidade</h3>
                        <div className="p-2 bg-gray-50 rounded-md">
                            <div className="flex justify-between py-1 border-b"><span>IMC:</span> <span className="font-bold">{typeof bmi === 'number' ? bmi.toFixed(1) : bmi}</span></div>
                            <div className="flex justify-between py-1"><span>Classificação:</span> <span className="font-bold">{getBmiClassification(bmi as number)}</span></div>
                        </div>
                         <div className="p-2 bg-gray-50 rounded-md mt-2">
                            <div className="flex justify-between py-1 border-b"><span>% Gordura:</span> <span className="font-bold">{typeof fatPercentage === 'number' ? fatPercentage.toFixed(1) : fatPercentage}%</span></div>
                            <div className="flex justify-between py-1"><span>Classificação:</span> <span className="font-bold">{getFatClassification(fatPercentage as number)}</span></div>
                        </div>
                    </div>
                    <div className="text-center">
                         <h3 className="font-semibold text-xs mb-1">Evolução dos Componentes</h3>
                        <ResponsiveContainer width="100%" height={120}>
                            <RechartsBarChart data={evolutionChartData}>
                                <XAxis dataKey="date" fontSize={9} tick={{ fill: '#374151' }} />
                                <YAxis fontSize={9} tick={{ fill: '#374151' }} />
                                <Tooltip wrapperClassName="text-xs" />
                                <Legend wrapperStyle={{ fontSize: '9px' }} iconSize={8}/>
                                <RechartsBar dataKey="Peso (kg)" fill="#a3a3a3" radius={[4, 4, 0, 0]} />
                                <RechartsBar dataKey="Massa Gorda (kg)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                <RechartsBar dataKey="Massa Muscular (kg)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </Section>

            {scaleType === 'omron' && renderTable(omronFields, 'Análise Geral (Omron)', BarChart)}

            {scaleType === 'inbody' && (
                <>
                    {inbodyFields.map(block => renderTable(block.fields, block.block, BarChart))}
                    
                    <Section title="Distribuição dos Tecidos" icon={<BarChart size={14} className="text-gray-600"/>}>
                         <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="text-center">
                                <h3 className="font-bold mb-2">ANÁLISE MASSA MAGRA SEGMENTAR (KG)</h3>
                                {bodyModelImage ? (
                                    <div className="relative w-24 h-48 mx-auto">
                                        <Image src={bodyModelImage.imageUrl} alt="Body model" className="w-full h-full object-contain" layout="fill" />
                                        <div className="absolute top-[15%] left-[50%]" style={{transform: 'translateX(-50%)'}}>{getData(mainEvaluation, 'trunkLeanMass')}kg</div>
                                        <div className="absolute top-[25%] -left-4">{getData(mainEvaluation, 'leftArmLeanMass')}kg</div>
                                        <div className="absolute top-[25%] -right-4">{getData(mainEvaluation, 'rightArmLeanMass')}kg</div>
                                        <div className="absolute top-[60%] left-[15%]">{getData(mainEvaluation, 'leftLegLeanMass')}kg</div>
                                        <div className="absolute top-[60%] right-[15%]">{getData(mainEvaluation, 'rightLegLeanMass')}kg</div>
                                    </div>
                                ): <p>Body model image not found.</p>}
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold mb-2">ANÁLISE MASSA GORDA SEGMENTAR (KG)</h3>
                                {bodyModelImage ? (
                                     <div className="relative w-24 h-48 mx-auto">
                                        <Image src={bodyModelImage.imageUrl} alt="Body model" className="w-full h-full object-contain" layout="fill" />
                                        <div className="absolute top-[15%] left-[50%]" style={{transform: 'translateX(-50%)'}}>{getData(mainEvaluation, 'trunkFat')}kg</div>
                                        <div className="absolute top-[25%] -left-4">{getData(mainEvaluation, 'leftArmFat')}kg</div>
                                        <div className="absolute top-[25%] -right-4">{getData(mainEvaluation, 'rightArmFat')}kg</div>
                                        <div className="absolute top-[60%] left-[15%]">{getData(mainEvaluation, 'leftLegFat')}kg</div>
                                        <div className="absolute top-[60%] right-[15%]">{getData(mainEvaluation, 'rightLegFat')}kg</div>
                                    </div>
                                ): <p>Body model image not found.</p>}
                            </div>
                         </div>
                    </Section>
                </>
            )}

            <footer className="mt-6 pt-3 border-t border-gray-300 text-center text-[10px] text-gray-500">
                <p>Este é um relatório gerado automaticamente. Os resultados devem ser interpretados por um profissional qualificado.</p>
                <p>Relatório gerado por Alpha Trainer &copy; {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
});

BioimpedanceReport.displayName = "BioimpedanceReport";
export default BioimpedanceReport;

    