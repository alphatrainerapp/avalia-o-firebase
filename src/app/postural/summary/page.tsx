'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePosturalContext } from '../context';
import { muscleMappings } from '@/lib/postural-data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const viewTitles: { [key: string]: string } = {
    anterior: 'Visão Anterior',
    posterior: 'Visão Posterior',
    lateral_direita: 'Visão Lateral Direita',
    lateral_esquerda: 'Visão Lateral Esquerda',
};

export default function PosturalSummaryPage() {
    const { deviations, clearDeviations } = usePosturalContext();

    const handleFinish = () => {
        // Here you would typically save the full analysis
        console.log("Final Analysis:", deviations);
        clearDeviations();
    };

    const allSelectedDeviations = Object.values(deviations).flat();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/postural/analysis/left"><Button variant="outline" size="icon"><ArrowLeft /></Button></Link>
                    <User className="size-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Resumo da Avaliação Postural</h1>
                        <p className="text-muted-foreground">Músculos encurtados e alongados</p>
                    </div>
                </div>
                <p className="text-sm font-semibold text-primary uppercase">UPLOAD / AVALIAÇÃO / RESUMO</p>
            </header>

            <div className="space-y-6">
                {Object.keys(viewTitles).map(viewKey => {
                    const selected = deviations[viewKey] || [];
                    if (selected.length === 0) return null;

                    return (
                        <Card key={viewKey}>
                            <CardHeader>
                                <CardTitle>{viewTitles[viewKey]}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="multiple" className="w-full">
                                    {selected.map(deviationName => {
                                        const mapping = muscleMappings[deviationName];
                                        if (!mapping) return null;

                                        return (
                                            <AccordionItem value={deviationName} key={deviationName}>
                                                <AccordionTrigger className="text-base font-semibold">{deviationName}</AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                        <div>
                                                            <h4 className="font-medium text-red-600">Músculos Encurtados</h4>
                                                            <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
                                                                {mapping.encurtados.map(muscle => <li key={muscle}>{muscle}</li>)}
                                                            </ul>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-green-600">Músculos Alongados</h4>
                                                            <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
                                                                {mapping.alongados.map(muscle => <li key={muscle}>{muscle}</li>)}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        );
                                    })}
                                </Accordion>
                            </CardContent>
                        </Card>
                    );
                })}

                {allSelectedDeviations.length === 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-center text-muted-foreground">Nenhum desvio postural foi selecionado nas etapas anteriores.</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="flex justify-end gap-4 mt-8">
                <Link href="/dashboard">
                    <Button onClick={handleFinish} className="bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
                        <Check className="mr-2" />
                        Salvar e Finalizar
                    </Button>
                </Link>
            </div>
        </div>
    );
}
