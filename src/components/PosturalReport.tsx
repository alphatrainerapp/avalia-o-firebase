'use client';
import React, { forwardRef } from 'react';
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

const PosturalReport = forwardRef<HTMLDivElement, PosturalReportProps>(({ client, photos, deviations, muscleAnalysis, viewTitles }, ref) => {
    
    const logo = getPlaceholderImage('alpha-trainer-logo');
    
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

            {Object.entries(viewTitles).map(([viewKey, viewTitle]) => {
                const viewDeviations = deviations[viewKey] || [];
                const photoKey = Object.keys(photos).find(k => k === viewKey.split('_')[0] || (k === 'right' && viewKey.includes('direita')) || (k === 'left' && viewKey.includes('esquerda')));
                const photoSrc = photoKey ? photos[photoKey] : undefined;

                if (viewDeviations.length === 0 && !photoSrc) return null;

                return (
                    <Section key={viewKey} title={viewTitle} icon={<Camera size={14} className="text-gray-600"/>}>
                        <div className="flex gap-4 mt-2">
                            {photoSrc && (
                                <div className="w-32 shrink-0">
                                    <div className="w-full aspect-[3/4] bg-gray-100 rounded overflow-hidden relative">
                                        <Image src={photoSrc} alt={viewTitle} layout="fill" objectFit="contain" />
                                    </div>
                                </div>
                            )}
                            <div className="flex-1">
                                {viewDeviations.length > 0 ? (
                                    <>
                                        <h4 className="font-bold text-gray-600 text-xs mb-1">Desvios Encontrados:</h4>
                                        <ul className="list-disc list-inside text-gray-800 text-xs space-y-0.5">
                                            {viewDeviations.map(d => <li key={d}>{d}</li>)}
                                        </ul>
                                    </>
                                ) : (
                                    <p className="text-center text-gray-500 mt-2">Nenhum desvio postural foi selecionado nesta vista.</p>
                                )}
                            </div>
                        </div>
                        
                        <div className="mt-3 space-y-2 break-inside-avoid">
                             {viewDeviations.map(deviationName => {
                                const analysis = muscleAnalysis[deviationName];
                                if (!analysis) return null;

                                return (
                                     <div key={deviationName} className="p-2 bg-gray-50 rounded-md break-inside-avoid">
                                        <h4 className="font-bold text-xs mb-1">{deviationName}</h4>
                                        <div className="grid grid-cols-2 gap-x-4">
                                            <div>
                                                <h5 className="font-semibold text-red-600 text-xs">Músculos Encurtados/Superativos</h5>
                                                <ul className="list-disc list-inside text-xs mt-1 space-y-0.5">
                                                    {analysis.shortened.map(muscle => <li key={muscle}>{muscle}</li>)}
                                                </ul>
                                            </div>
                                            <div>
                                                <h5 className="font-semibold text-blue-600 text-xs">Músculos Alongados/Inibidos</h5>
                                                <ul className="list-disc list-inside text-xs mt-1 space-y-0.5">
                                                    {analysis.lengthened.map(muscle => <li key={muscle}>{muscle}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )
                             })}
                        </div>
                    </Section>
                )
            })}
           

            <footer className="mt-6 pt-3 border-t border-gray-300 text-center text-[10px] text-gray-500">
                <p>Este é um relatório gerado automaticamente. Os resultados devem ser interpretados por um profissional qualificado.</p>
                <p>Relatório gerado por Alpha Trainer &copy; {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
});

PosturalReport.displayName = "PosturalReport";
export default PosturalReport;
