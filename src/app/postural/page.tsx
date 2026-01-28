'use client';

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, UploadCloud, Save, ArrowRight, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { usePosturalContext } from './context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { clients, evaluations as initialEvaluations, type Evaluation } from '@/lib/data';


type PhotoType = 'front' | 'back' | 'right' | 'left';

export default function PosturalPage() {
    const { photos, setPhoto, deviations, clearPosturalData, loadPosturalData } = usePosturalContext();
    const fileInputRefs = {
        front: useRef<HTMLInputElement>(null),
        back: useRef<HTMLInputElement>(null),
        right: useRef<HTMLInputElement>(null),
        left: useRef<HTMLInputElement>(null),
    };
    const { toast } = useToast();
    const [currentDate, setCurrentDate] = useState('');
    
    const [allEvaluations, setAllEvaluations] = useState<Evaluation[]>(initialEvaluations);
    const [selectedClientId, setSelectedClientId] = useState<string>(clients[0].id);
    const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);

    const client = useMemo(() => clients.find(c => c.id === selectedClientId), [selectedClientId]);
    const clientEvaluations = useMemo(() => allEvaluations.filter(e => e.clientId === selectedClientId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [selectedClientId, allEvaluations]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: PhotoType) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target?.result as string;
                setPhoto(type, imageUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = (type: PhotoType) => {
        fileInputRefs[type].current?.click();
    };
    
    const handleClientChange = (clientId: string) => {
        setSelectedClientId(clientId);
        // The useEffect will handle selecting the latest evaluation for the new client
    };
    
    const handleSelectEvaluation = useCallback((evalId: string | null) => {
        setSelectedEvaluationId(evalId);
        if (!evalId) {
            clearPosturalData();
            return;
        }
        const evaluation = allEvaluations.find(e => e.id === evalId);
        if (evaluation) {
            loadPosturalData({
                photos: evaluation.posturalPhotos || {},
                deviations: evaluation.posturalDeviations || {}
            });
        } else {
             clearPosturalData();
        }
    }, [allEvaluations, clearPosturalData, loadPosturalData]);

    const handleManualSelectEvaluation = (evalId: string) => {
        if (selectedEvaluationId === evalId) {
            handleSelectEvaluation(null); // Deselect
        } else {
            handleSelectEvaluation(evalId); // Select
        }
    }

    useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString('pt-BR'));
    }, []);

    useEffect(() => {
        const mostRecentEval = clientEvaluations.at(-1);
        if (mostRecentEval) {
            handleSelectEvaluation(mostRecentEval.id);
        } else {
            handleSelectEvaluation(null);
        }
    }, [clientEvaluations, handleSelectEvaluation]);

    const handleNewEvaluation = () => {
      if (client) {
            const newEvalId = `eval_${allEvaluations.length + 1}_${Date.now()}`;
            
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const localDateString = `${year}-${month}-${day}`;

            const todaysEval = clientEvaluations.find(e => e.date === localDateString);
            if (todaysEval) {
                handleSelectEvaluation(todaysEval.id);
                toast({ title: "Avaliação já existente", description: "Uma avaliação para a data de hoje já existe e foi selecionada." });
                return;
            }

            const newEvaluation: Evaluation = {
                id: newEvalId,
                clientId: client.id,
                clientName: client.name,
                date: localDateString,
                protocol: '',
                bodyMeasurements: { weight: 0, height: client.height, waistCircumference: 0, hipCircumference: 0 },
                bodyComposition: { bodyFatPercentage: 0 },
                bioimpedance: { scaleType: null },
                posturalPhotos: {},
                posturalDeviations: {}
            };
            
            setAllEvaluations(prevEvals => [...prevEvals, newEvaluation].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            handleSelectEvaluation(newEvalId);
            toast({ title: "Nova Avaliação Postural", description: "Um novo registro de avaliação foi criado para hoje." });
        }
    };
    
    const handleSave = () => {
        if (selectedEvaluationId) {
            setAllEvaluations(prevEvals =>
                prevEvals.map(ev =>
                    ev.id === selectedEvaluationId
                        ? { ...ev, posturalPhotos: photos, posturalDeviations: deviations }
                        : ev
                )
            );
            const evalDate = allEvaluations.find(e => e.id === selectedEvaluationId)!.date.replace(/-/g, '/');
            const formattedDate = new Date(evalDate).toLocaleDateString('pt-BR');
            toast({
                title: 'Análise Salva',
                description: `A análise postural foi salva na avaliação de ${formattedDate}.`,
            });
        } else {
             toast({
                variant: 'destructive',
                title: 'Nenhuma avaliação selecionada',
                description: 'Crie uma nova avaliação ou selecione uma existente para salvar.',
            });
        }
    };

    const PhotoUploadCard = ({ type, title }: { type: PhotoType, title: string }) => (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-center text-lg font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div
                    className={cn(
                        'w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors',
                        { 'border-primary': photos[type] }
                    )}
                    onClick={() => triggerFileInput(type)}
                >
                    <Input
                        type="file"
                        accept="image/*"
                        ref={fileInputRefs[type]}
                        onChange={(e) => handlePhotoUpload(e, type)}
                        className="hidden"
                    />
                    {photos[type] ? (
                        <Image src={photos[type]!} alt={`${title} preview`} width={200} height={256} className="h-full w-auto object-contain rounded-md" />
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <UploadCloud className="mx-auto h-12 w-12" />
                            <p>Clique para adicionar/modificar</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard"><Button variant="outline" size="icon"><ArrowLeft /></Button></Link>
                    <User className="size-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Avaliação Postural</h1>
                        <p className="text-muted-foreground">Data: {currentDate}</p>
                    </div>
                </div>
                 <p className="text-sm font-semibold text-primary uppercase">UPLOAD / AVALIAÇÃO / RESUMO</p>
            </header>

            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="grid gap-2 w-full sm:max-w-sm">
                                <Label htmlFor="name">Cliente</Label>
                                 <Select value={selectedClientId} onValueChange={handleClientChange}>
                                    <SelectTrigger id="name">
                                        <SelectValue placeholder="Selecione um cliente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleNewEvaluation} variant="outline" className="w-full sm:w-auto">
                                <Plus className="mr-2" /> Nova Avaliação
                            </Button>
                        </div>
                    </CardHeader>
                     <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Selecione uma avaliação física existente para vincular esta análise postural, ou crie uma nova.
                        </p>
                        <div className="flex gap-4 overflow-x-auto pb-4">
                            {clientEvaluations.map((ev, index) => {
                                const isSelected = selectedEvaluationId === ev.id;
                                return (
                                    <Card 
                                        key={ev.id} 
                                        className={cn(
                                            "shrink-0 w-36 text-center cursor-pointer transition-colors shadow-xl rounded-2xl",
                                            isSelected ? 'bg-primary text-primary-foreground border-transparent shadow-lg' : 'bg-card'
                                        )}
                                        onClick={() => handleManualSelectEvaluation(ev.id)}
                                    >
                                        <CardHeader className="p-4 relative">
                                                <CardTitle className={cn("text-sm font-normal capitalize", isSelected ? "text-primary-foreground" : "text-card-foreground")}>
                                                {new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0">
                                            <p className={cn("text-4xl font-bold", isSelected ? "text-primary-foreground" : "text-card-foreground")}>{index + 1}</p>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>


                <Card>
                    <CardHeader>
                        <CardTitle>Upload de Fotos</CardTitle>
                        <CardDescription>
                            {selectedEvaluationId ? `Anexando fotos à avaliação de ${clientEvaluations.find(e => e.id === selectedEvaluationId)?.date ? new Date(clientEvaluations.find(e => e.id === selectedEvaluationId)!.date.replace(/-/g, '/')).toLocaleDateString('pt-BR') : ''}.` : 'Nenhuma avaliação selecionada. Crie uma nova avaliação.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PhotoUploadCard type="front" title="Foto Frente" />
                        <PhotoUploadCard type="back" title="Foto Costas" />
                        <PhotoUploadCard type="right" title="Foto Lado Direito" />
                        <PhotoUploadCard type="left" title="Foto Lado Esquerdo" />
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button onClick={handleSave} className="bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
                        <Save className="mr-2" />
                        Salvar
                    </Button>
                    <Link href="/postural/analysis">
                        <Button variant="outline">
                            Próximo
                            <ArrowRight className="ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
