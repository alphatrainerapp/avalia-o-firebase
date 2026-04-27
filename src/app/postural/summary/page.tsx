'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Camera, Download, Info, TrendingUp, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePosturalContext } from '../context';
import { muscleMappings } from '@/lib/postural-data';
import { useEvaluationContext } from '@/context/EvaluationContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Label } from '@/components/ui/label';
import PosturalReport from '@/components/PosturalReport';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';

const viewTitles: { [key: string]: string } = {
    anterior: 'Foto Frente',
    posterior: 'Foto Costas',
    lateral_direita: 'Foto Lado Direito',
    lateral_esquerda: 'Foto Lado Esquerdo',
};

type PhotoType = 'front' | 'back' | 'right' | 'left';

const photoViewMapping: { [key in PhotoType]: { title: string; viewKey: keyof typeof viewTitles } } = {
    front: { title: 'Foto Frente', viewKey: 'anterior' },
    back: { title: 'Foto Costas', viewKey: 'posterior' },
    right: { title: 'Foto Lado Direito', viewKey: 'lateral_direita' },
    left: { title: 'Foto Lado Esquerdo', viewKey: 'lateral_esquerda' },
};

export default function PosturalSummaryPage() {
    const { photos, deviations, saveAnalysis, activeEvaluationId } = usePosturalContext();
    const { clients, allEvaluations, selectedClientId } = useEvaluationContext();
    const { toast } = useToast();
    const router = useRouter();
    const reportRef = useRef<HTMLDivElement>(null);
    
    const [selectedEvalIds, setSelectedEvalIds] = useState<string[]>([]);
    
    const client = useMemo(() => clients.find(c => c.id === selectedClientId), [selectedClientId, clients]);

    const clientEvaluations = useMemo(() => {
        return allEvaluations
            .filter(e => e.clientId === selectedClientId)
            .sort((a, b) => new Date(a.date.replace(/-/g, '/')).getTime() - new Date(b.date.replace(/-/g, '/')).getTime());
    }, [selectedClientId, allEvaluations]);

    // Lógica para carregar as fotos e desvios:
    // Se estivermos vendo apenas uma avaliação e for a avaliação ativa (em edição), 
    // priorizamos o estado do PosturalContext (fotos/deviations).
    // Caso contrário, usamos o que está salvo em comparedEvaluations.
    const comparedEvaluations = useMemo(() => {
        return clientEvaluations
            .filter(e => selectedEvalIds.includes(e.id))
            .sort((a,b) => new Date(a.date.replace(/-/g, '/')).getTime() - new Date(b.date.replace(/-/g, '/')).getTime());
    }, [selectedEvalIds, clientEvaluations]);

    useEffect(() => {
        if (selectedEvalIds.length === 0 && activeEvaluationId) {
            setSelectedEvalIds([activeEvaluationId]);
        } else if (selectedEvalIds.length === 0 && clientEvaluations.length > 0) {
            const lastWithData = [...clientEvaluations].reverse().find(e => e.posturalPhotos && Object.keys(e.posturalPhotos).length > 0);
            if (lastWithData) setSelectedEvalIds([lastWithData.id]);
        }
    }, [clientEvaluations, activeEvaluationId, selectedEvalIds.length]);

    const displayData = useMemo(() => {
        // Se a avaliação selecionada for a ativa, use os dados do context para refletir mudanças em tempo real
        if (selectedEvalIds.length === 1 && selectedEvalIds[0] === activeEvaluationId) {
            return { photos, deviations };
        }
        // Se houver apenas uma avaliação selecionada (mas não for a ativa), pegue os dados dela
        if (selectedEvalIds.length === 1) {
            const ev = clientEvaluations.find(e => e.id === selectedEvalIds[0]);
            return {
                photos: ev?.posturalPhotos || {},
                deviations: ev?.posturalDeviations || {},
            };
        }
        // Para múltiplos ou nenhum, retorne context como fallback ou vazio
        return { photos, deviations };
    }, [selectedEvalIds, activeEvaluationId, photos, deviations, clientEvaluations]);

    const groupedMuscleAnalysis = useMemo(() => {
        const analysis: { [deviation: string]: { shortened: string[], lengthened: string[] } } = {};
        const sourceDeviations = displayData.deviations;

        Object.keys(sourceDeviations).forEach(view => {
            const viewDevs = sourceDeviations[view] || [];
            viewDevs.forEach(deviationName => {
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

        // Unique values
        for (const deviation in analysis) {
            analysis[deviation].shortened = Array.from(new Set(analysis[deviation].shortened));
            analysis[deviation].lengthened = Array.from(new Set(analysis[deviation].lengthened));
        }

        return analysis;
    }, [displayData.deviations]);
    
    const handleCompareSelection = (evalId: string) => {
        setSelectedEvalIds(prev => {
            if (prev.includes(evalId)) return prev.filter(id => id !== evalId);
            if (prev.length < 4) return [...prev].sort((a,b) => {
                const evA = clientEvaluations.find(e => e.id === a);
                const evB = clientEvaluations.find(e => e.id === b);
                return new Date(evA!.date).getTime() - new Date(evB!.date).getTime();
            });
            toast({variant: 'destructive', title: 'Aviso', description: 'Máximo 4 avaliações.'});
            return prev;
        });
    };

    const handleFinish = () => {
        saveAnalysis(activeEvaluationId);
        toast({ title: 'Análise Finalizada', description: 'O laudo postural foi salvo com sucesso.' });
        router.push('/dashboard');
    };

    const handleExportPdf = async () => {
        const reportElement = reportRef.current;
        if (!reportElement || !client) return;

        toast({ title: 'Gerando PDF...', description: 'Aguarde um momento.' });

        const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgRatio = canvas.width / canvas.height;
        const finalImgWidth = pdfWidth;
        const finalImgHeight = pdfWidth / imgRatio;

        let yPosition = 0;
        let remainingHeight = canvas.height;
        const pageHeightOnCanvas = (pdfHeight * canvas.width) / finalImgWidth;

        while (remainingHeight > 0) {
            pdf.addImage(imgData, 'PNG', 0, -yPosition, finalImgWidth, finalImgHeight);
            remainingHeight -= pageHeightOnCanvas;
            if (remainingHeight > 0) {
                pdf.addPage();
                yPosition += pageHeightOnCanvas;
            }
        }
        
        pdf.save(`laudo_postural_${client.name.replace(/\s+/g, '_')}.pdf`);
        toast({ title: 'PDF Exportado!' });
    };

    const renderMuscleAnalysisForView = (viewKey: keyof typeof viewTitles) => {
        const viewDeviations = displayData.deviations[viewKey] || [];
        if (viewDeviations.length === 0) return null;

        return (
            <div className="mt-4 space-y-4">
                <Separator className="bg-primary/10" />
                <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                    <TrendingUp className="size-3" /> Análise Muscular
                </h4>
                {viewDeviations.map(deviationName => {
                    const analysis = groupedMuscleAnalysis[deviationName];
                    if (!analysis) return null;

                    return (
                        <div key={deviationName} className="bg-muted/30 p-4 rounded-xl border border-muted/50">
                            <h5 className="font-black text-sm text-foreground mb-3 uppercase tracking-tighter">{deviationName}</h5>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <p className="text-[9px] font-black text-red-500 uppercase flex items-center gap-1">
                                        <span className="size-1.5 rounded-full bg-red-500" /> Encurtados:
                                    </p>
                                    <ul className="space-y-0.5">
                                        {analysis.shortened.map(muscle => (
                                            <li key={muscle} className="text-[11px] font-medium text-muted-foreground flex items-start gap-1.5">
                                                <span className="mt-1.5 size-1 shrink-0 bg-red-400 rounded-full" /> {muscle}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[9px] font-black text-green-500 uppercase flex items-center gap-1">
                                        <span className="size-1.5 rounded-full bg-green-500" /> Alongados:
                                    </p>
                                    <ul className="space-y-0.5">
                                        {analysis.lengthened.map(muscle => (
                                            <li key={muscle} className="text-[11px] font-medium text-muted-foreground flex items-start gap-1.5">
                                                <span className="mt-1.5 size-1 shrink-0 bg-green-400 rounded-full" /> {muscle}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <header className="flex flex-wrap items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => router.push('/postural/analysis')}><ArrowLeft className="size-4" /></Button>
                    <Camera className="size-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Resumo e Laudo Postural</h1>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">{client?.name}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Button onClick={handleExportPdf} variant="outline" className="h-11 px-6 rounded-xl font-bold"><Download className="mr-2 size-4" /> Exportar PDF</Button>
                    <Button onClick={handleFinish} className="bg-primary text-primary-foreground shadow-lg h-11 px-6 rounded-xl font-bold">
                        <Check className="mr-2 size-4" /> Finalizar e Salvar
                    </Button>
                </div>
            </header>

            <div className="space-y-8">
                <Card className="border-none shadow-sm bg-muted/10">
                    <CardHeader className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Histórico de Imagens (Selecione para ver o laudo)</Label>
                            {selectedEvalIds.length > 1 && (
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-bold px-3">Modo Comparação Ativo</Badge>
                            )}
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {clientEvaluations.map((ev, index) => {
                                const isSelected = selectedEvalIds.includes(ev.id);
                                const hasData = (ev.posturalPhotos && Object.keys(ev.posturalPhotos).length > 0) || ev.id === activeEvaluationId;

                                return (
                                    <Card 
                                        key={ev.id} 
                                        className={cn(
                                            "shrink-0 w-44 text-center cursor-pointer transition-all shadow-md rounded-2xl border-none relative group",
                                            isSelected ? 'bg-primary text-primary-foreground scale-105 shadow-lg' : 'bg-white hover:bg-muted/50',
                                            !hasData && 'opacity-40 grayscale pointer-events-none'
                                        )}
                                        onClick={() => handleCompareSelection(ev.id)}
                                    >
                                        <CardHeader className="p-4 pb-1">
                                            <CardTitle className={cn("text-[10px] font-black uppercase tracking-widest", isSelected ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                                {new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR')}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0">
                                            <p className="text-4xl font-black">{index + 1}</p>
                                            <p className={cn("text-[9px] font-bold uppercase mt-1", isSelected ? "text-primary-foreground/60" : "text-muted-foreground/50")}>Avaliação</p>
                                            {ev.id === activeEvaluationId && (
                                                <Badge className="absolute -top-2 -right-2 bg-yellow-400 text-black border-none font-black text-[8px] h-5">EDITANDO</Badge>
                                            )}
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </CardHeader>
                </Card>

                {selectedEvalIds.length > 1 ? (
                    <Card className="border-none shadow-xl bg-card overflow-hidden rounded-3xl">
                        <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
                            <CardTitle className="flex items-center gap-3 text-primary font-black text-xl uppercase tracking-tighter">
                                <TrendingUp className="size-6" /> Evolução Postural Comparada
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-12">
                            {Object.entries(photoViewMapping).map(([photoType, { title }]) => (
                                <div key={photoType} className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <h3 className="font-black text-lg text-foreground uppercase tracking-tight">{title}</h3>
                                        <div className="h-px flex-1 bg-gradient-to-r from-muted to-transparent"></div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {comparedEvaluations.map(ev => {
                                            const isCurrent = ev.id === activeEvaluationId;
                                            const photoSrc = isCurrent ? photos[photoType as PhotoType] : ev.posturalPhotos?.[photoType as PhotoType];
                                            return (
                                                <div key={ev.id} className="space-y-3 group">
                                                    <div className="relative aspect-[3/4] bg-muted/30 rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-primary/30 transition-all shadow-inner">
                                                        {photoSrc ? (
                                                            <Image src={photoSrc} alt={title} fill className="object-contain hover:scale-110 transition-transform duration-700" />
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30">
                                                                <Camera className="size-10 mb-2 opacity-20" />
                                                                <span className="text-[9px] font-black uppercase">Sem foto</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-black text-muted-foreground bg-muted/50 py-1.5 rounded-full px-4 inline-block">
                                                            {new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR')}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ) : selectedEvalIds.length === 1 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {Object.entries(photoViewMapping).map(([photoType, { title, viewKey }]) => {
                            const viewDeviations = displayData.deviations[viewKey] || [];
                            const photoSrc = displayData.photos[photoType as PhotoType];

                            if (viewDeviations.length === 0 && !photoSrc) return null;

                            return (
                                <Card key={viewKey} className="overflow-hidden border-none shadow-lg bg-card rounded-3xl group">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col sm:flex-row h-full">
                                            <div className="w-full sm:w-52 bg-muted/30 flex items-center justify-center relative aspect-[3/4] sm:aspect-auto border-r border-muted/50 overflow-hidden shadow-inner">
                                                {photoSrc ? (
                                                    <Image src={photoSrc} alt={title} fill className="object-contain p-2 group-hover:scale-110 transition-transform duration-700" />
                                                ) : (
                                                    <Camera className="size-12 text-muted-foreground/20" />
                                                )}
                                            </div>
                                            <div className="flex-1 p-8 flex flex-col justify-between">
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="font-black text-xl uppercase tracking-tighter text-primary">{title}</h3>
                                                        <Badge variant="outline" className="text-[9px] font-black px-2 py-0 border-muted">VISTA {viewKey.split('_')[0].toUpperCase()}</Badge>
                                                    </div>
                                                    
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-[9px] font-black text-muted-foreground uppercase mb-3 tracking-widest">Desvios Identificados</p>
                                                            {viewDeviations.length > 0 ? (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {viewDeviations.map(d => (
                                                                        <span key={d} className="text-[11px] font-bold bg-primary/5 text-primary px-3 py-1.5 rounded-xl border border-primary/10 flex items-center gap-1.5">
                                                                            <Check className="size-3" /> {d}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-muted-foreground italic flex items-center gap-2">
                                                                    <Info className="size-4 opacity-30" /> Nenhum desvio registrado.
                                                                </p>
                                                            )}
                                                        </div>
                                                        {renderMuscleAnalysisForView(viewKey as any)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Alert className="bg-primary/5 border-primary/20 rounded-3xl p-8">
                        <Info className="size-6 text-primary mb-4" />
                        <AlertTitle className="text-lg font-black uppercase tracking-tight">Nenhuma análise selecionada</AlertTitle>
                        <AlertDescription className="text-muted-foreground font-medium">
                            Selecione um registro no histórico acima para visualizar o laudo muscular e as fotos posturais do aluno.
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Hidden Report for PDF */}
            <div className="fixed -left-[9999px] -top-[9999px] w-[800px] bg-white">
                {client && (
                    <PosturalReport
                        ref={reportRef}
                        client={client}
                        photos={displayData.photos}
                        deviations={displayData.deviations}
                        muscleAnalysis={groupedMuscleAnalysis}
                        comparedEvaluations={comparedEvaluations}
                        viewTitles={viewTitles}
                    />
                )}
            </div>
        </div>
    );
}
