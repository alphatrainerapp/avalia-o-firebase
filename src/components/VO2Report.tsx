'use client';
import React, { forwardRef } from 'react';
import Image from 'next/image';
import type { Client } from '@/lib/data';
import { type VO2Protocol, type VO2Stage, type TrainingZone, velocityToPace } from '@/lib/vo2-logic';
import { User, Wind, Activity, TrendingUp, Target, Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getPlaceholderImage } from '@/lib/placeholder-images';

type VO2ReportProps = {
    client: Client;
    protocol: VO2Protocol;
    results: {
        vo2: number;
        classification: string;
        zones: TrainingZone[];
        vAM: number;
        conconiThreshold?: { velocity: number, hr: number } | null;
    };
    hrMax: number;
    hrRest: number;
    stages: VO2Stage[];
};

const Section = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <section className="mt-6 break-inside-avoid">
        <div className="flex items-center gap-2 mb-3 pb-1 border-b-2 border-gray-200">
            {icon}
            <h2 className="font-bold text-gray-800 uppercase tracking-widest text-xs">{title}</h2>
        </div>
        {children}
    </section>
);

const VO2Report = forwardRef<HTMLDivElement, VO2ReportProps>(({ client, protocol, results, hrMax, hrRest, stages }, ref) => {
    const logo = getPlaceholderImage('alpha-trainer-logo');
    const protocolNames: Record<VO2Protocol, string> = {
        cooper: 'Teste de Cooper (12 min)',
        three_km: 'Teste de 3km',
        five_km: 'Teste de 5km',
        balke: 'Teste de Balke',
        conconi: 'Teste de Conconi',
        step_test: 'Step Test (Banco)'
    };

    return (
        <div ref={ref} className="p-10 font-sans bg-white text-gray-900 text-xs w-[800px]">
            {/* Header */}
            <header className="flex items-start justify-between pb-4 border-b-2 border-gray-900">
                <div className="flex items-center gap-4">
                     {logo && <Image src={logo.imageUrl} alt="Logo" width={160} height={40} className="object-contain" />}
                </div>
                <div className="text-right">
                    <h1 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Relatório de Fisiologia do Exercício</h1>
                    <p className="text-xs text-gray-500 font-bold uppercase">{protocolNames[protocol]}</p>
                </div>
            </header>

            {/* Client Info */}
            <div className="flex items-center gap-6 mt-6 p-4 bg-gray-50 rounded-xl">
                <Avatar className="h-16 w-16 border-2 border-primary">
                    <AvatarImage src={client.avatarUrl} alt={client.name} />
                    <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid grid-cols-4 gap-x-8 gap-y-2 flex-1">
                    <div><strong className="block text-gray-400 text-[10px] uppercase">Atleta:</strong> <span className="font-bold text-sm">{client.name}</span></div>
                    <div><strong className="block text-gray-400 text-[10px] uppercase">Idade:</strong> <span className="font-bold text-sm">{client.age} anos</span></div>
                    <div><strong className="block text-gray-400 text-[10px] uppercase">FC Máxima:</strong> <span className="font-bold text-sm">{hrMax} bpm</span></div>
                    <div><strong className="block text-gray-400 text-[10px] uppercase">Data:</strong> <span className="font-bold text-sm">{new Date().toLocaleDateString('pt-BR')}</span></div>
                </div>
            </div>

            {/* Main Results */}
            <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="bg-primary p-6 rounded-2xl text-white text-center shadow-lg">
                    <p className="text-[10px] uppercase font-black opacity-80 mb-1">VO2 Máximo</p>
                    <div className="text-4xl font-black">{results.vo2}</div>
                    <p className="text-[9px] font-bold">ml/kg/min</p>
                    <div className="mt-3 text-xs font-bold uppercase bg-white/20 py-1 rounded-full">{results.classification}</div>
                </div>
                <div className="bg-gray-800 p-6 rounded-2xl text-white text-center shadow-lg">
                    <p className="text-[10px] uppercase font-black opacity-80 mb-1">Vel. Aeróbica Máx (vAM)</p>
                    <div className="text-4xl font-black">{results.vAM.toFixed(1)}</div>
                    <p className="text-[9px] font-bold">km/h</p>
                    <div className="mt-3 text-xs font-bold uppercase bg-white/10 py-1 rounded-full">Pace: {velocityToPace(results.vAM)}</div>
                </div>
                <div className="bg-gray-100 p-6 rounded-2xl text-gray-800 text-center border-2 border-gray-200">
                    <p className="text-[10px] uppercase font-black text-gray-400 mb-1">Limiar Anaeróbico</p>
                    {results.conconiThreshold ? (
                        <>
                            <div className="text-4xl font-black">{results.conconiThreshold.velocity}</div>
                            <p className="text-[9px] font-bold">km/h ({velocityToPace(results.conconiThreshold.velocity)})</p>
                            <div className="mt-3 text-xs font-bold uppercase text-primary">@ {results.conconiThreshold.hr} bpm</div>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 italic">Protocolo sem detecção automática</div>
                    )}
                </div>
            </div>

            {/* Training Zones */}
            <Section title="Zonas de Treinamento Personalizadas" icon={<Target size={16} className="text-primary"/>}>
                <table className="w-full text-xs border-collapse">
                    <thead>
                        <tr className="bg-gray-800 text-white uppercase text-[10px]">
                            <th className="p-3 text-left rounded-tl-lg">Zona</th>
                            <th className="p-3 text-left">Intensidade / Objetivo</th>
                            <th className="p-3 text-center">Frequência Cardíaca</th>
                            <th className="p-3 text-right rounded-tr-lg">Pace Sugerido (min/km)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-50">
                        {results.zones.map((zone, idx) => (
                            <tr key={zone.zone} className="border-b border-gray-200">
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }} />
                                        <span className="font-black text-sm">{zone.zone}</span>
                                    </div>
                                </td>
                                <td className="p-3 font-bold text-gray-600">{zone.description}</td>
                                <td className="p-3 text-center font-mono font-bold text-sm">{zone.minHR} - {zone.maxHR} bpm</td>
                                <td className="p-3 text-right font-mono font-bold text-sm text-primary">{zone.maxPace} - {zone.minPace}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>

            {/* Recommendations */}
            <Section title="Recomendações Práticas" icon={<Activity size={16} className="text-primary"/>}>
                <div className="grid grid-cols-2 gap-6 mt-2">
                    <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl">
                        <h4 className="font-black text-primary uppercase mb-2 text-[10px]">Foco em vAM</h4>
                        <p className="leading-relaxed text-gray-600">
                            Para atletas com vAM de {results.vAM.toFixed(1)} km/h, sugere-se sessões de intervalos de 400m a 800m no pace de {results.zones.length > 0 ? results.zones[results.zones.length - 1].maxPace : '--:--'} min/km para maximizar a economia de corrida e o tempo sob VO2max.
                        </p>
                    </div>
                    <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl">
                        <h4 className="font-black text-primary uppercase mb-2 text-[10px]">Controle de Carga</h4>
                        <p className="leading-relaxed text-gray-600">
                            Utilize as zonas aeróbicas de base para 80% do seu volume semanal. O limiar anaeróbico foi identificado em {results.conconiThreshold?.hr || 'nível alto'}, indicando que treinos de alta intensidade devem ser limitados a 1-2 vezes por semana.
                        </p>
                    </div>
                </div>
            </Section>

            <footer className="mt-12 pt-4 border-t border-gray-200 text-center">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Relatório Técnico gerado por Alpha Trainer Engine &copy; {new Date().getFullYear()}</p>
                <p className="text-[8px] text-gray-300 mt-1">Este documento é uma estimativa fisiológica e não substitui exames laboratoriais como a Ergoespirometria.</p>
            </footer>
        </div>
    );
});

VO2Report.displayName = "VO2Report";
export default VO2Report;