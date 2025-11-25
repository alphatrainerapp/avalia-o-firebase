'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, ArrowRight, User, Maximize, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function PosturalAnalysisPage() {
    const { toast } = useToast();
    const [showGrid, setShowGrid] = useState(false);

    const handleSave = () => {
        console.log('Saving postural analysis...');
        toast({
            title: 'Análise Salva',
            description: 'A análise postural foi salva com sucesso.',
        });
    };

    const frontalAnalysisFields = [
        {
            id: 'ombro',
            label: 'Ombro',
            options: ['Alinhado', 'Deprimido Esq.', 'Deprimido Dir.'],
        },
        {
            id: 'joelho',
            label: 'Joelho',
            options: ['Alinhado', 'Valgo', 'Varo'],
        },
        {
            id: 'patela',
            label: 'Patela',
            options: ['Alinhada', 'Lateralizada', 'Medializada'],
        },
        {
            id: 'eias',
            label: 'EIAS',
            options: ['Alianhada', 'Deprimida Esq.', 'Deprimida Dir.'],
        },
        {
            id: 'eips',
            label: 'EIPS',
            options: ['Alinhada', 'Deprimida Esq.', 'Deprimida Dir.'],
        },
    ];

    const selectFields = [
        { id: 'assimetriaQuadril', label: 'Assimetria de Quadril', options: ['Nenhuma'] },
        { id: 'tiposEscoliose', label: 'Tipos de Escoliose', options: ['Nenhuma'] },
        { id: 'ombrosAssimetricos', label: 'Ombros Assimétricos', options: ['Nenhum'] },
        { id: 'direcaoEmicorpo', label: 'Direção do Emicorpo', options: ['Nenhuma'] },
    ];


    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/postural"><Button variant="outline" size="icon"><ArrowLeft /></Button></Link>
                    <User className="size-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Avaliação Postural</h1>
                        <p className="text-muted-foreground">Data: {new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>
                <p className="text-sm font-semibold text-primary uppercase">UPLOAD / AVALIAÇÃO / SALVAR</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Visão Frontal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="relative w-full max-w-sm mx-auto aspect-[3/4] bg-muted rounded-lg">
                        <Image
                            src="https://firebasestudio.ai/public-hosting/projects/2654/assets/4044/posture-front.png"
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

                    <div className="space-y-4 pt-6">
                        {frontalAnalysisFields.map(field => (
                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                                <Label className="md:text-right font-semibold">{field.label}</Label>
                                <div className="col-span-3 flex flex-wrap gap-x-6 gap-y-2">
                                    {field.options.map(option => (
                                        <div key={option} className="flex items-center space-x-2">
                                            <Checkbox id={`${field.id}-${option}`} />
                                            <Label htmlFor={`${field.id}-${option}`} className="font-normal">{option}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        {selectFields.map(field => (
                             <div key={field.id}>
                                <Label htmlFor={field.id}>{field.label}</Label>
                                <Select>
                                    <SelectTrigger id={field.id}>
                                        <SelectValue placeholder={field.options[0]} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {field.options.map(option => (
                                            <SelectItem key={option} value={option.toLowerCase()}>{option}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
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
