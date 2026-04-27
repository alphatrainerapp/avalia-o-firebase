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
import { Label } from '@/components/ui/label';
import { useEvaluationContext } from '@/context/EvaluationContext';
import { Badge } from '@/components/ui/badge';

type PhotoType = 'front' | 'back' | 'right' | 'left';

export default function PosturalPage() {
    const { photos, setPhoto, deviations, clearPosturalData, loadPosturalData, saveAnalysis, activeEvaluationId, setActiveEvaluationId } = usePosturalContext();
    const { clients, allEvaluations, addEvaluation, selectedClientId } = useEvaluationContext();

    const fileInputRefs = {
        front: useRef<HTMLInputElement>(null),
        back: useRef<HTMLInputElement>(null),
        right: useRef<HTMLInputElement>(null),
        left: useRef<HTMLInputElement>(null),
    };
    const { toast } = useToast();
    const [currentDate, setCurrentDate] = useState('');

    const client = useMemo(() => clients.find(c => c.id === selectedClientId), [selectedClientId, clients]);
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
    
    const handleSelectEvaluation = useCallback((evalId: string | null) => {
        setActiveEvaluationId(evalId);
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
    }, [allEvaluations, clearPosturalData, loadPosturalData, setActiveEvaluationId]);

    useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString('pt-BR'));
        
        // Selecionar a avaliação mais recente por padrão se nenhuma estiver ativa
        if (!activeEvaluationId && clientEvaluations.length > 0) {
            handleSelectEvaluation(clientEvaluations[clientEvaluations.length - 1].id);
        }
    }, [clientEvaluations, activeEvaluationId, handleSelectEvaluation]);

    const handleNewEvaluation = () => {
        if (client) {
            const newEvaluation = addEvaluation(client.id);
            handleSelectEvaluation(newEvaluation.id);
            toast({ title: "Nova Avaliação Postural", description: "Um novo registro de avaliação foi criado para hoje." });
        }
    };
    
    const handleSave = () => {
        if (activeEvaluationId) {
            saveAnalysis(activeEvaluationId);
            const evalObj = allEvaluations.find(e => e.id === activeEvaluationId);
            const formattedDate = evalObj ? new Date(evalObj.date.replace(/-/g, '/')).toLocaleDateString('pt-BR') : '';
            toast({
                title: 'Fotos e Dados Salvos',
                description: `A análise postural foi sincronizada com a avaliação de ${formattedDate}.`,
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
            <CardHeader className="p-4">
                <CardTitle className="text-center text-sm font-bold uppercase tracking-tight text-primary/80">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div
                    className={cn(
                        'w-full h-64 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all group overflow-hidden',
                        { 'border-primary/50 bg-primary/5': photos[type] }
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
                        <div className="relative w-full h-full">
                            <Image src={photos[type]!} alt={`${title} preview`} fill className="object-contain p-2" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <UploadCloud className="text-white size-8" />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-2">
                            <div className="p-3 bg-white rounded-full inline-block shadow-sm group-hover:scale-110 transition-transform">
                                <UploadCloud className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Clique para adicionar</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-background text-foreground pb-12">
            <header className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard"><Button variant="outline" size="icon"><ArrowLeft /></Button></Link>
                    <User className="size-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Avaliação Postural</h1>
                        <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest">Sincronização de Imagens</p>
                    </div>
                </div>
                 <p className="text-[10px] font-black text-primary uppercase bg-primary/10 px-3 py-1 rounded-full border border-primary/20">UPLOAD / AVALIAÇÃO / RESUMO</p>
            </header>

            <div className="space-y-8">
                <Card className="border-none shadow-sm bg-muted/10">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="grid gap-1">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground">Aluno em Análise</Label>
                                <div className="h-10 flex items-center px-4 rounded-xl border bg-white font-bold text-sm shadow-sm">
                                    {client?.name || 'Nenhum aluno selecionado'}
                                </div>
                            </div>
                            <Button onClick={handleNewEvaluation} variant="outline" className="w-full sm:w-auto h-11 px-6 rounded-xl border-primary/30 text-primary hover:bg-primary/5 font-bold">
                                <Plus className="mr-2 size-4" /> Nova Avaliação
                            </Button>
                        </div>
                    </CardHeader>
                     <CardContent>
                        <Label className="text-[10px] font-black uppercase text-muted-foreground mb-3 block">Histórico de Avaliações (Selecione para editar)</Label>
                        <div className="flex gap-6 overflow-x-auto pb-6 pt-4 px-4 scrollbar-hide">
                            {clientEvaluations.length > 0 ? (
                                clientEvaluations.map((ev, index) => {
                                    const isSelected = activeEvaluationId === ev.id;
                                    return (
                                        <div key={ev.id} className="relative shrink-0">
                                            {ev.id === activeEvaluationId && (
                                                <Badge className="absolute -top-2 -right-2 z-10 bg-yellow-400 text-black border-none font-black text-[8px] h-5 shadow-sm px-2">EDITANDO</Badge>
                                            )}
                                            <Card 
                                                className={cn(
                                                    "w-44 text-center cursor-pointer transition-all shadow-md rounded-2xl border-none relative overflow-hidden",
                                                    isSelected ? 'bg-primary text-primary-foreground scale-105 shadow-xl ring-4 ring-primary/10' : 'bg-white hover:bg-muted/50'
                                                )}
                                                onClick={() => handleSelectEvaluation(isSelected ? null : ev.id)}
                                            >
                                                <CardHeader className="p-4 pb-2">
                                                        <CardTitle className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isSelected ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                                        {new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR')}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-4 pt-0">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <div className={cn("h-10 w-[1px]", isSelected ? "bg-white/20" : "bg-muted")} />
                                                        <p className="text-5xl font-black leading-none">{index + 1}</p>
                                                        <div className={cn("h-10 w-[1px]", isSelected ? "bg-white/20" : "bg-muted")} />
                                                    </div>
                                                    <p className={cn("text-[9px] font-bold uppercase mt-2 tracking-widest", isSelected ? "text-primary-foreground/60" : "text-muted-foreground/50")}>Avaliação</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )
                                })
                            ) : (
                                <p className="text-sm text-muted-foreground italic p-4">Nenhuma avaliação encontrada. Clique em "Nova Avaliação" para começar.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {activeEvaluationId && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <UploadCloud className="size-5 text-primary" />
                                Fotos da Avaliação selecionada
                            </h3>
                            <div className="flex gap-2">
                                <Button onClick={handleSave} className="bg-primary text-primary-foreground shadow-lg h-11 px-6 rounded-xl font-bold">
                                    <Save className="mr-2 size-4" /> Salvar Fotos
                                </Button>
                                <Link href="/postural/analysis">
                                    <Button variant="outline" className="h-11 px-6 rounded-xl font-bold">
                                        Próximo <ArrowRight className="ml-2 size-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <PhotoUploadCard type="front" title="Frente" />
                            <PhotoUploadCard type="back" title="Costas" />
                            <PhotoUploadCard type="right" title="Lado Direito" />
                            <PhotoUploadCard type="left" title="Lado Esquerdo" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}