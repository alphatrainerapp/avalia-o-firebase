'use client';
import React, { forwardRef, useMemo } from 'react';
import Image from 'next/image';
import type { Client, Evaluation } from '@/lib/data';
import { Deviations } from '@/app/postural/context';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { User, Camera, Dumbbell } from 'lucide-react';

type PosturalReportProps = {
    client: Client;
    photos: { [key: string]: string | undefined };
    deviations: Deviations;
    muscleAnalysis: { [key: string]: { shortened: string[], lengthened: string[] } };
    comparedEvaluations: Evaluation[];
    viewTitles: { [key: string]: string };
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

type PhotoType = 'front' | 'back' | 'right' | 'left';

const PosturalReport = forwardRef<HTMLDivElement, PosturalReportProps>(({ client, photos, deviations, muscleAnalysis, comparedEvaluations, viewTitles }, ref) => {
    
    const logo = getPlaceholderImage('alpha-trainer-logo');
    const hasDeviations = Object.values(deviations).some(d => d.length > 0);
    const hasMuscleAnalysis = Object.keys(muscleAnalysis).length > 0;

    return (
        <div ref={ref} className="p-6 font-sans bg-white text-gray-900 text-xs w-[800px]">
            <header className="flex items-start justify-between pb-3 border-b-2 border-gray-900">
                <div className="flex items-center gap-4">
                     {logo && <Image src={logo.imageUrl} alt="Logo" width={140} height={35} className="object-contain" />}
                </div>
                <div className="text-right">
                    <h1 className="text-lg font-bold text-gray-800">Relatório de Avaliação Postural</h1>
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
                         <div><strong className="block text-gray-500 text-xs">Data:</strong> {new Date().toLocaleDateString('pt-BR')}</div>
                    </div>
                </div>
            </Section>

            <Section title="Fotos da Avaliação" icon={<Camera size={14} className="text-gray-600"/>}>
                 <div className="grid grid-cols-4 gap-2 mt-2">
                    {(['front', 'back', 'right', 'left'] as PhotoType[]).map(type => (
                        <div key={type} className="flex flex-col items-center">
                            <h3 className="font-semibold text-xs mb-1 capitalize">{type === 'right' ? 'Dir.' : type === 'left' ? 'Esq.' : type}</h3>
                             <div className="w-full aspect-[3/4] bg-gray-100 rounded overflow-hidden relative">
                                {photos[type] ? (
                                    <Image src={photos[type]!} alt={`Foto ${type}`} layout="fill" objectFit="contain" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500 text-xs">Sem foto</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="Resumo dos Desvios Encontrados" icon={<Dumbbell size={14} className="text-gray-600"/>}>
                {!hasDeviations && <p className="text-center text-gray-500 mt-2">Nenhum desvio postural foi selecionado na avaliação atual.</p>}
                {Object.keys(deviations).map(viewKey => {
                    const selected = deviations[viewKey] || [];
                    if (selected.length === 0) return null;
                    return (
                        <div key={viewKey} className="mt-2">
                            <h3 className="font-bold text-gray-600 text-xs mb-1">{viewTitles[viewKey]}</h3>
                            <ul className="list-disc list-inside text-gray-800 text-xs space-y-0.5">
                                {selected.map(deviationName => (
                                    <li key={deviationName}>{deviationName}</li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </Section>
            
            <Section title="Análise Muscular por Desvio" icon={<Dumbbell size={14} className="text-gray-600"/>}>
                 {!hasMuscleAnalysis && <p className="text-center text-gray-500 mt-2">Nenhuma análise muscular gerada.</p>}
                {Object.entries(muscleAnalysis).map(([deviation, muscles]) => (
                    <div key={deviation} className="p-2 bg-gray-50 rounded-md mb-2 break-inside-avoid">
                        <h4 className="font-bold text-xs mb-1">{deviation}</h4>
                        <div className="grid grid-cols-2 gap-x-4">
                            <div>
                                <h5 className="font-semibold text-red-600 text-xs">Músculos Encurtados/Superativos</h5>
                                <ul className="list-disc list-inside text-xs mt-1 space-y-0.5">
                                    {muscles.shortened.map(muscle => <li key={muscle}>{muscle}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-semibold text-blue-600 text-xs">Músculos Alongados/Inibidos</h5>
                                <ul className="list-disc list-inside text-xs mt-1 space-y-0.5">
                                    {muscles.lengthened.map(muscle => <li key={muscle}>{muscle}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </Section>

            <footer className="mt-6 pt-3 border-t border-gray-300 text-center text-[10px] text-gray-500">
                <p>Este é um relatório gerado automaticamente. Os resultados devem ser interpretados por um profissional qualificado.</p>
                <p>Relatório gerado por Alpha Trainer &copy; {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
});

PosturalReport.displayName = "PosturalReport";
export default PosturalReport;

    