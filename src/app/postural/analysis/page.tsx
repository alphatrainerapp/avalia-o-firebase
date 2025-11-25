'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, ArrowRight, User, Maximize, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function PosturalAnalysisPage() {
    const { toast } = useToast();
    const [showGrid, setShowGrid] = useState(false);
    const [currentDate, setCurrentDate] = useState('');
    const [frontImage, setFrontImage] = useState<string | null>(null);

    useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString('pt-BR'));
        const storedImage = localStorage.getItem('postural-front-image');
        if (storedImage) {
            setFrontImage(storedImage);
        }
    }, []);

    const handleSave = () => {
        console.log('Saving postural analysis...');
        toast({
            title: 'Análise Salva',
            description: 'A análise postural foi salva com sucesso.',
        });
    };

    const analysisSections = [
        {
            title: 'Assimetria de Quadril',
            items: [
                {
                    subtitle: 'Obliquidade Pélvica',
                    options: ['Quadril direito mais alto', 'Quadril esquerdo mais alto']
                },
                {
                    subtitle: 'Rotação Pélvica',
                    options: ['Rotação pélvica à direita', 'Rotação pélvica à esquerda']
                },
                {
                    subtitle: 'Deslocamento lateral da pelve',
                    options: ['Pelve desviada para direita', 'Pelve desviada para esquerda']
                }
            ]
        },
        {
            title: 'Assimetria de Ombros',
            items: [
                {
                    subtitle: 'Ombro Elevado / Ombro Baixo',
                    options: ['Ombro direito mais alto', 'Ombro esquerdo mais alto']
                },
                {
                    subtitle: 'Desvio lateral da cintura escapular',
                    options: ['Cintura escapular desviada para direita', 'Cintura escapular desviada para esquerda']
                },
                {
                    subtitle: 'Rotação dos ombros',
                    options: ['Rotação interna predominante (braços viram para dentro)', 'Rotação externa predominante']
                }
            ]
        },
        {
            title: 'Tipos de Escoliose',
            items: [
                {
                    subtitle: 'Quanto à direção da convexidade',
                    options: ['Escoliose em “C” convexa à direita', 'Escoliose em “C” convexa à esquerda', 'Escoliose em “S” (dupla curva)']
                }
            ]
        }
    ];


    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/postural"><Button variant="outline" size="icon"><ArrowLeft /></Button></Link>
                    <User className="size-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Avaliação Postural</h1>
                        <p className="text-muted-foreground">Data: {currentDate}</p>
                    </div>
                </div>
                <p className="text-sm font-semibold text-primary uppercase">UPLOAD / AVALIAÇÃO / SALVAR</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Análise da Visão Frontal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="relative w-full max-w-sm mx-auto aspect-[3/4] bg-muted rounded-lg">
                            <Image
                                src={frontImage || "https://firebasestudio.ai/public-hosting/projects/2654/assets/4044/posture-front.png"}
                                alt="Visão Frontal"
                                layout="fill"
                                objectFit="contain"
                                className="rounded-lg"
                            />
                            {showGrid && (
                                <div className="absolute inset-0 grid grid-cols-5 grid-rows-10 gap-0 pointer-events-none">
                                    {[...Array(5)].map((_, i) => <div key={`v-${i}`} className="h-full border-r border-blue-500/30"></div>)}
                                    {[...Array(10)].map((_, i) => <div key={`h-${i}`} className="w-full border-t border-blue-500/30 col-span-5"></div>)}
                                </div>
                            )}
                            <div className="absolute top-2 left-2 flex flex-col gap-2">
                                <Button variant="outline" size="icon" onClick={() => setShowGrid(!showGrid)}>
                                    <Grid className={cn(showGrid && "text-primary")} />
                                </Button>
                                <Button variant="outline" size="icon">
                                    <Maximize />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                             <Accordion type="multiple" defaultValue={analysisSections.map(s => s.title)} className="w-full">
                                {analysisSections.map((section) => (
                                    <AccordionItem value={section.title} key={section.title}>
                                        <AccordionTrigger className="text-base font-semibold">{section.title}</AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4 pl-2">
                                                {section.items.map(item => (
                                                    <div key={item.subtitle}>
                                                        <Label className="font-medium text-sm">{item.subtitle}</Label>
                                                        <div className="grid gap-2 mt-2">
                                                            {item.options.map(option => (
                                                                <div key={option} className="flex items-center space-x-2">
                                                                    <Checkbox id={`${section.title}-${item.subtitle}-${option}`} />
                                                                    <Label htmlFor={`${section.title}-${item.subtitle}-${option}`} className="font-normal text-sm">{option}</Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </div>
                </CardContent>
            </Card>


            <div className="flex justify-end gap-4 mt-8">
                <Button onClick={handleSave} className="bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
                    <Save className="mr-2" />
                    Salvar
                </Button>
                <Button variant="outline">
                    Próximo
                    <ArrowRight className="ml-2" />
                </Button>
            </div>
        </div>
    );
}
