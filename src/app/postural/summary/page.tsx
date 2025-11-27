'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, User, Camera, ArrowRight, Edit, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { usePosturalContext } from '../context';
import { muscleMappings } from '@/lib/postural-data';
import { clients, evaluations } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';


const viewTitles: { [key: string]: string } = {
    anterior: 'Visão Anterior',
    posterior: 'Visão Posterior',
    lateral_direita: 'Visão Lateral Direita',
    lateral_esquerda: 'Visão Lateral Esquerda',
};

type PhotoType = 'front' | 'back' | 'right' | 'left';

const photoViewMapping: { [key in PhotoType]: { title: string; viewKey: keyof typeof viewTitles } } = {
    front: { title: 'Visão Frontal', viewKey: 'anterior' },
    back: { title: 'Visão Posterior', viewKey: 'posterior' },
    right: { title: 'Visão Lateral Direita', viewKey: 'lateral_direita' },
    left: { title: 'Visão Lateral Esquerda', viewKey: 'lateral_esquerda' },
};


export default function PosturalSummaryPage() {
    const { photos, deviations, clearDeviations, isSaved, saveAnalysis } = usePosturalContext();
    const { toast } = useToast();
    const router = useRouter();
    
    // Mocking postural evaluations being linked to general evaluations
    const [selectedClientId, setSelectedClientId] = useState<string>(clients[0].id);
    const [selectedEvalIds, setSelectedEvalIds] = useState<string[]>([]);
    const [showSaveAlert, setShowSaveAlert] = useState(false);
    
    const clientEvaluations = useMemo(() => {
        return evaluations
            .filter(e => e.clientId === selectedClientId)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [selectedClientId]);

    const groupedMuscleAnalysis = useMemo(() => {
        const analysis: { [deviation: string]: { shortened: string[], lengthened: string[] } } = {};

        Object.keys(deviations).forEach(view => {
            deviations[view].forEach(deviationName => {
                const mapping = muscleMappings[deviationName];
                if (mapping) {
                    if (!analysis[deviationName]) {
                        analysis[deviationName] = { shortened: [], lengthened: [] };
                    }
                    analysis[deviationName].shortened.push(...mapping.shortened);
                    analysis[deviationName].lengthened.push(...mapping.lengthened);
                }
            });
        });

        // Remove duplicates
        for (const deviation in analysis) {
            analysis[deviation].shortened = [...new Set(analysis[deviation].shortened)];
            analysis[deviation].lengthened = [...new Set(analysis[deviation].lengthened)];
        }

        return analysis;
    }, [deviations]);

    
    const handleClientChange = (clientId: string) => {
        setSelectedClientId(clientId);
        setSelectedEvalIds([]);
    };
    
    const handleCompareSelection = (evalId: string) => {
        setSelectedEvalIds(prev => {
            if (prev.includes(evalId)) {
                return prev.filter(id => id !== evalId);
            }
            if (prev.length < 4) { // Allow up to 4 photos for comparison
                return [...prev, evalId].sort((a,b) => {
                    const evalA = clientEvaluations.find(e => e.id === a);
                    const evalB = clientEvaluations.find(e => e.id === b);
                    return new Date(evalA!.date).getTime() - new Date(evalB!.date).getTime();
                });
            }
            toast({variant: 'destructive', title: 'Aviso', description: 'Você pode selecionar no máximo 4 avaliações.'})
            return prev;
        });
    };

    const comparedEvaluations = useMemo(() => {
        return clientEvaluations
            .filter(e => selectedEvalIds.includes(e.id))
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [selectedEvalIds, clientEvaluations]);


    const handleFinish = () => {
        saveAnalysis();
        toast({ title: 'Análise Salva', description: 'A análise postural foi finalizada e salva.' });
        clearDeviations();
        router.push('/dashboard');
    };
    
    const handleBackToEvaluation = () => {
       router.push('/dashboard');
    };

    const handleSaveAndContinue = () => {
        saveAnalysis();
        toast({ title: 'Análise Salva', description: 'Suas alterações foram salvas.' });
        setShowSaveAlert(false);
        router.push('/dashboard');
    };

    const handleContinueWithoutSaving = () => {
        setShowSaveAlert(false);
        router.push('/dashboard');
    };


    return (
        <div className="min-h-screen bg-background text-foreground">
            <AlertDialog open={showSaveAlert} onOpenChange={setShowSaveAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem alterações não salvas!</AlertDialogTitle>
                        <AlertDialogDescription>
                            Deseja salvar as alterações feitas na avaliação postural antes de voltar?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                         <Button variant="outline" onClick={handleContinueWithoutSaving}>
                            Continuar sem Salvar
                        </Button>
                        <AlertDialogAction onClick={handleSaveAndContinue}>Salvar e Voltar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


            <header className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => router.push('/postural/analysis/left')}><ArrowLeft /></Button>
                    <User className="size-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Resumo da Avaliação Postural</h1>
                        <p className="text-muted-foreground">Compare avaliações e veja a evolução</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Button onClick={handleBackToEvaluation} variant="outline">
                        <ArrowLeft className="mr-2"/>
                        Voltar ao Dashboard
                    </Button>
                    <p className="text-sm font-semibold text-primary uppercase">UPLOAD / AVALIAÇÃO / RESUMO</p>
                </div>
            </header>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2">
                                <label htmlFor="name" className="text-sm font-medium">Nome</label>
                                <Select value={selectedClientId} onValueChange={handleClientChange}>
                                    <SelectTrigger id="name">
                                        <SelectValue placeholder="Selecione um cliente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex gap-4 overflow-x-auto pb-4">
                        {clientEvaluations.map((ev, index) => {
                            const isSelectedForCompare = selectedEvalIds.includes(ev.id);
                            return (
                                <Card 
                                    key={ev.id} 
                                    className={cn(
                                        "shrink-0 w-40 text-center cursor-pointer transition-colors shadow-xl rounded-2xl",
                                        isSelectedForCompare ? 'bg-primary text-primary-foreground border-transparent shadow-lg' : 'bg-card'
                                    )}
                                    onClick={() => handleCompareSelection(ev.id)}
                                >
                                    <CardHeader className="p-4 relative">
                                            <CardTitle className={cn("text-sm font-normal capitalize", isSelectedForCompare ? "text-primary-foreground" : "text-card-foreground")}>
                                            {new Date(ev.date).toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <p className={cn("text-4xl font-bold", isSelectedForCompare ? "text-primary-foreground" : "text-card-foreground")}>{index + 1}</p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </CardContent>
                    {selectedEvalIds.length > 0 && (
                        <CardFooter>
                                <p className="text-sm text-muted-foreground">
                                {selectedEvalIds.length}/{clientEvaluations.length} avaliações selecionadas para comparação.
                            </p>
                        </CardFooter>
                    )}
                </Card>

                {comparedEvaluations.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Camera /> Comparativo de Fotos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {Object.keys(photoViewMapping).map((photoType) => (
                                <div key={photoType}>
                                    <h3 className="font-semibold mb-2 text-lg">{photoViewMapping[photoType as PhotoType].title}</h3>
                                    <Carousel
                                        opts={{
                                            align: "start",
                                        }}
                                        className="w-full"
                                    >
                                        <CarouselContent>
                                            {comparedEvaluations.map((ev, index) => (
                                                <CarouselItem key={`${ev.id}-${photoType}`} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                                                    <div className="p-1">
                                                        <div className="flex flex-col items-center">
                                                            <p className="text-sm font-medium mb-2">{new Date(ev.date).toLocaleDateString('pt-BR')}</p>
                                                            <div className="w-full aspect-[3/4] bg-muted rounded-lg overflow-hidden relative">
                                                                {/* We use the currently uploaded photos as mock for all evaluations */}
                                                                {photos[photoType] ? (
                                                                    <Image src={photos[photoType]!} alt={`Foto para ${ev.date}`} layout="fill" objectFit="contain" />
                                                                ) : (
                                                                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Sem foto</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious className="ml-14" />
                                        <CarouselNext className="mr-14" />
                                    </Carousel>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}


                <Card>
                    <CardHeader>
                        <CardTitle>Resumo dos Desvios Encontrados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {Object.keys(deviations).map(viewKey => {
                            const selected = deviations[viewKey] || [];
                            if (selected.length === 0) return null;

                            return (
                                <div key={viewKey} className="mb-6">
                                    <h3 className="font-bold text-lg mb-2 border-b pb-1">{viewTitles[viewKey]}</h3>
                                    <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
                                        {selected.map(deviationName => (
                                            <li key={deviationName}>{deviationName}</li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}

                        {Object.values(deviations).flat().length === 0 && (
                            <p className="text-center text-muted-foreground">Nenhum desvio postural foi selecionado na avaliação atual.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Dumbbell /> Análise Muscular por Desvio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         {Object.keys(groupedMuscleAnalysis).length > 0 ? (
                            Object.entries(groupedMuscleAnalysis).map(([deviation, muscles]) => (
                                <Card key={deviation} className="bg-muted/30">
                                    <CardHeader className="pb-2 pt-4">
                                        <CardTitle className="text-base">{deviation}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                        <div>
                                            <h4 className="font-semibold text-red-600 mb-2">Músculos Encurtados/Superativos</h4>
                                            {muscles.shortened.length > 0 ? (
                                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                                    {muscles.shortened.map(muscle => <li key={muscle}>{muscle}</li>)}
                                                </ul>
                                            ) : <p className="text-sm text-muted-foreground">Nenhum</p>}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-blue-600 mb-2">Músculos Alongados/Inibidos</h4>
                                            {muscles.lengthened.length > 0 ? (
                                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                                    {muscles.lengthened.map(muscle => <li key={muscle}>{muscle}</li>)}
                                                </ul>
                                            ) : <p className="text-sm text-muted-foreground">Nenhum</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                             <p className="text-center text-muted-foreground py-4">Nenhuma análise muscular gerada. Selecione os desvios posturais para ver os resultados.</p>
                        )}
                    </CardContent>
                </Card>
                
            </div>

            <div className="flex justify-end gap-4 mt-8">
                <Button onClick={handleFinish} className="bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
                    <Check className="mr-2" />
                    Salvar e Finalizar
                </Button>
            </div>
        </div>
    );
}
