'use client';
import React, { forwardRef } from 'react';
import Image from 'next/image';
import type { Client, Evaluation } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Dumbbell, Zap, TrendingUp, Target, Trophy, Activity, HeartPulse } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

type StrengthReportProps = {
    client: Client;
    evaluations: Evaluation[];
    isCompareMode: boolean;
};

const Section = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <section className="mt-6 break-inside-avoid">
        <div className="flex items-center gap-2 mb-3 pb-1 border-b-2 border-gray-200">
            {icon}
            <h2 className="font-bold text-gray-800 uppercase tracking-widest text-[10px]">{title}</h2>
        </div>
        {children}
    </section>
);

const StrengthReport = forwardRef<HTMLDivElement, StrengthReportProps>(({ client, evaluations, isCompareMode }, ref) => {
    const logo = getPlaceholderImage('alpha-trainer-logo');
    const mainEval = evaluations[evaluations.length - 1];
    
    const chartData = evaluations.map(ev => ({
        date: new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        'Carga Total': ev.strengthData?.totalTonnage || 0,
        'Alpha Score': ev.strengthData?.alphaForceScore || 0,
    }));

    if (!mainEval) return <div ref={ref}></div>;

    const strengthData = mainEval.strengthData;
    const isometricTests = strengthData?.isometric || {};

    return (
        <div ref={ref} className="p-10 font-sans bg-white text-gray-900 text-[10px] w-[800px]">
            {/* Header */}
            <header className="flex items-start justify-between pb-4 border-b-2 border-gray-900">
                <div className="flex items-center gap-4">
                     {logo && <Image src={logo.imageUrl} alt="Logo" width={160} height={40} className="object-contain" />}
                </div>
                <div className="text-right">
                    <h1 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Relatório de Força & Potência</h1>
                    <p className="text-xs text-gray-500 font-bold uppercase">Alpha Force Engine</p>
                </div>
            </header>

            {/* Atleta Info */}
            <div className="flex items-center gap-6 mt-6 p-4 bg-gray-50 rounded-xl">
                <Avatar className="h-16 w-16 border-2 border-primary">
                    <AvatarImage src={client.avatarUrl} alt={client.name} />
                    <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid grid-cols-4 gap-x-8 gap-y-2 flex-1">
                    <div><strong className="block text-gray-400 text-[9px] uppercase">Atleta:</strong> <span className="font-bold text-sm">{client.name}</span></div>
                    <div><strong className="block text-gray-400 text-[9px] uppercase">Peso Atual:</strong> <span className="font-bold text-sm">{client.bodyMeasurements?.weight || '--'} kg</span></div>
                    <div><strong className="block text-gray-400 text-[9px] uppercase">ID:</strong> <span className="font-bold text-sm">#STR-{mainEval.id.slice(-4).toUpperCase()}</span></div>
                    <div><strong className="block text-gray-400 text-[9px] uppercase">Data:</strong> <span className="font-bold text-sm">{new Date(mainEval.date.replace(/-/g, '/')).toLocaleDateString('pt-BR')}</span></div>
                </div>
            </div>

            {/* Score e Resumo Principal */}
            <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="bg-slate-900 p-6 rounded-2xl text-white text-center shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10"><Trophy size={60} /></div>
                    <p className="text-[9px] uppercase font-black opacity-60 mb-2">Alpha Force Score</p>
                    <div className="text-5xl font-black text-primary leading-none">{strengthData?.alphaForceScore || '--'}</div>
                    <p className="text-[8px] font-bold mt-2 uppercase tracking-widest">Pontos de Performance</p>
                </div>
                <div className="bg-gray-100 p-6 rounded-2xl text-gray-800 text-center border-2 border-gray-200">
                    <p className="text-[9px] uppercase font-black text-gray-400 mb-2">Carga Total (1RM)</p>
                    <div className="text-4xl font-black">{strengthData?.totalTonnage?.toFixed(0) || '--'} <span className="text-lg">kg</span></div>
                    <p className="text-[8px] font-bold mt-2 uppercase text-primary">Volume Máximo de Força</p>
                </div>
                <div className="bg-gray-100 p-6 rounded-2xl text-gray-800 text-center border-2 border-gray-200">
                    <p className="text-[9px] uppercase font-black text-gray-400 mb-2">IFR (Força Relativa)</p>
                    <div className="text-4xl font-black">{strengthData?.relativeStrengthIndex?.toFixed(2) || '--'}x</div>
                    <p className="text-[8px] font-bold mt-2 uppercase text-primary">Carga / Peso Corporal</p>
                </div>
            </div>

            {/* Gráficos de Evolução (se houver mais de uma avaliação) */}
            {evaluations.length > 1 && (
                <Section title="Análise Evolutiva" icon={<TrendingUp size={14} className="text-primary"/>}>
                    <div className="h-[200px] w-full bg-gray-50 rounded-xl p-4 border mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="date" tick={{fontSize: 8, fontWeight: 'bold'}} />
                                <YAxis yAxisId="left" orientation="left" stroke="#01baba" tick={{fontSize: 8}} />
                                <YAxis yAxisId="right" orientation="right" stroke="#1e293b" tick={{fontSize: 8}} />
                                <Tooltip contentStyle={{fontSize: '10px', borderRadius: '8px'}} />
                                <Legend wrapperStyle={{fontSize: '9px', paddingTop: '10px'}} />
                                <Line yAxisId="left" type="monotone" dataKey="Carga Total" stroke="#01baba" strokeWidth={3} dot={{r: 4}} />
                                <Line yAxisId="right" type="monotone" dataKey="Alpha Score" stroke="#1e293b" strokeWidth={3} dot={{r: 4}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Section>
            )}

            {/* Performance Isométrica */}
            <Section title="Performance Isométrica (Pico de Força)" icon={<Zap size={14} className="text-primary"/>}>
                <table className="w-full text-[9px] border-collapse mt-2">
                    <thead>
                        <tr className="bg-slate-900 text-white uppercase">
                            <th className="p-2 text-left rounded-tl-lg">Exercício / Teste</th>
                            <th className="p-2 text-center">Tentativas (kgf)</th>
                            <th className="p-2 text-center">Pico (kgf)</th>
                            <th className="p-2 text-center">Média (kgf)</th>
                            <th className="p-2 text-right rounded-tr-lg">Relativo (x)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {Object.entries(isometricTests).filter(([key]) => key !== 'evaluator').map(([key, data]: [string, any]) => (
                            <tr key={key} className="border-b border-gray-100">
                                <td className="p-2 font-bold text-gray-700">{data.title || key.toUpperCase()}</td>
                                <td className="p-2 text-center text-gray-500">{data.attempts?.join(' / ') || '--'}</td>
                                <td className="p-2 text-center font-black text-primary">{data.peakForce || '--'}</td>
                                <td className="p-2 text-center">{data.averageForce || '--'}</td>
                                <td className="p-2 text-right font-bold">{data.relativeForce || '--'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>

            {/* Performance Dinâmica (1RM) */}
            <Section title="Recordes Pessoais (1RM Dinâmico)" icon={<Dumbbell size={14} className="text-primary"/>}>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <table className="w-full text-[9px] border-collapse">
                        <thead>
                            <tr className="bg-gray-800 text-white uppercase">
                                <th className="p-2 text-left rounded-tl-lg">Exercício</th>
                                <th className="p-2 text-center">Carga (kg)</th>
                                <th className="p-2 text-center rounded-tr-lg">1RM Estimado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {strengthData?.dynamic.map((lift, idx) => (
                                <tr key={idx} className="border-b border-gray-100">
                                    <td className="p-2 font-bold text-gray-700">{lift.exercise}</td>
                                    <td className="p-2 text-center">{lift.weight} kg x {lift.reps}</td>
                                    <td className="p-2 text-center font-black text-primary">{lift.estimated1RM?.toFixed(1)} kg</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="p-4 bg-primary/5 border-2 border-dashed border-primary/20 rounded-xl flex flex-col justify-center items-center text-center">
                        <Activity size={24} className="text-primary mb-2" />
                        <h4 className="font-black text-primary uppercase text-[10px] mb-1">Prescrição Alpha</h4>
                        <p className="text-gray-600 text-[8px] leading-relaxed">
                            As cargas de 1RM estimadas utilizam o protocolo de Brzycki. Sugerimos o ajuste imediato da planilha de treinamento considerando as novas zonas de intensidade calculadas nesta avaliação.
                        </p>
                    </div>
                </div>
            </Section>

            <footer className="mt-12 pt-4 border-t border-gray-200 text-center">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Relatório Técnico Alpha Force Engine &copy; {new Date().getFullYear()}</p>
                <p className="text-[8px] text-gray-300 mt-1">Dados processados com base em protocolos de Brzycki e Epley. Resultados devem ser validados pelo treinador responsável.</p>
            </footer>
        </div>
    );
});

StrengthReport.displayName = "StrengthReport";
export default StrengthReport;
