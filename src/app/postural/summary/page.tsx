'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, User, Camera, ArrowRight, Edit, Dumbbell, Download, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { usePosturalContext } from '../context';
import { muscleMappings } from '@/lib/postural-data';
import { useEvaluationContext } from '@/context/EvaluationContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import PosturalReport from '@/components/PosturalReport';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


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
    const { photos, deviations, clearPosturalData, isSaved, saveAnalysis } = usePosturalContext();
    const { clients, allEvaluations, selectedClientId, setSelectedClientId } = useEvaluationContext();
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

    // Pre-select evaluations that have postural data when client changes
    useEffect(() => {
        const evalsWithData = clientEvaluations
            .filter(e => e.posturalPhotos && Object.keys(e.posturalPhotos).length > 0)
            .map(e => e.id);
        
        setSelectedEvalIds(evalsWithData.slice(-4)); // Select last 4 for comparison
    }, [clientEvaluations]);

    const comparedEvaluations = useMemo(() => {
        return clientEvaluations
            .filter(e => selectedEvalIds.includes(e.id))
            .sort((a,b) => new Date(a.date.replace(/-/g, '/')).getTime() - new Date(b.date.replace(/-/g, '/')).getTime());
    }, [selectedEvalIds, clientEvaluations]);

    const analysisData = useMemo(() => {
      // If comparing exactly 1 historical evaluation, use its data
      if (comparedEvaluations.length === 1) {
          return {
              photos: comparedEvaluations[0].posturalPhotos || {},
              deviations: comparedEvaluations[0].posturalDeviations || {},
          }
      }
      // Otherwise use the current session data
      return { photos, deviations };
    }, [comparedEvaluations, photos, deviations]);


    const groupedMuscleAnalysis = useMemo(() => {
        const analysis: { [deviation: string]: { shortened: string[], lengthened: string[] } } = {};
        const sourceDeviations = analysisData.deviations;

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

        // Remove duplicates
        for (const deviation in analysis) {
            analysis[deviation].shortened = [...new Set(analysis[deviation].shortened)];
            analysis[deviation].lengthened = [...new Set(analysis[deviation].lengthened)];
        }

        return analysis;
    }, [analysisData.deviations]);

    
    const handleClientChange = (clientId: string) => {
        setSelectedClientId(clientId);
        setSelectedEvalIds([]);
    };
    
    const handleCompareSelection = (evalId: string) => {
        setSelectedEvalIds(prev => {
            if (prev.includes(evalId)) {
                return prev.filter(id => id !== evalId);
            }
            if (prev.length < 4) {
                return [...prev, evalId].sort((a,b) => {
                    const evalA = clientEvaluations.find(e => e.id === a);
                    const evalB = clientEvaluations.find(e => e.id === b);
                    return new Date(evalA!.date.replace(/-/g, '/')).getTime() - new Date(evalB!.date.replace(/-/g, '/')).getTime();
                });
            }
            toast({variant: 'destructive', title: 'Aviso', description: 'Você pode selecionar no máximo 4 avaliações.'})
            return prev;
        });
    };

    const handleFinish = () => {
        saveAnalysis();
        toast({ title: 'Análise Salva', description: 'A análise postural foi finalizada e salva.' });
        router.push('/dashboard');
    };
    
    const handleBackToEvaluation = () => {
       router.push('/dashboard');
    };

    const handleExportPdf = async () => {
        const reportElement = reportRef.current;
        if (!reportElement || !client) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Selecione um cliente para gerar o PDF.' });
            return;
        }

        toast({ title: 'Exportando PDF...', description: 'Aguarde enquanto o relatório é gerado.' });

        const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgRatio = canvas.width / canvas.height;
        let finalImgWidth, finalImgHeight;

        if (canvas.width / pdfWidth > canvas.height / pdfHeight) {
            finalImgWidth = pdfWidth;
            finalImgHeight = pdfWidth / imgRatio;
        } else {
            finalImgHeight = pdfHeight;
            finalImgWidth = pdfHeight * imgRatio;
        }

        let position = 0;
        let remainingHeight = canvas.height;
        const pageHeightOnCanvas = (pdfHeight * canvas.width) / finalImgWidth;

        while (remainingHeight > 0) {
            pdf.addImage(imgData, 'PNG', 0, -position, finalImgWidth, finalImgHeight);
            remainingHeight -= pageHeightOnCanvas;
            if (remainingHeight > 0) {
                pdf.addPage();
                position += pageHeightOnCanvas;
            }
        }
        
        pdf.save(`relatorio_postural_${client.name.replace(/ /g, '_')}_${new Date().toLocaleDateString('pt-BR')}.pdf`);
        toast({ title: 'PDF Exportado!', description: 'O relatório postural foi salvo com sucesso.' });
    };


    const renderMuscleAnalysisForView = (viewKey: keyof typeof viewTitles) => {
        const viewDeviations = analysisData.deviations[viewKey] || [];
        if (viewDeviations.length === 0) return null;

        return (
            <div className="mt-4 space-y-4">
                <Separator />
                <h4 className="font-semibold text-base">Análise Muscular</h4>
                {viewDeviations.map(deviationName => {
                    const analysis = groupedMuscleAnalysis[deviationName];
                    if (!analysis) return null;

                    return (
                        <div key={deviationName}>
                            <h5 className="font-medium text-primary mb-2">{deviationName}</h5>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-red-500 font-semibold mb-1">Encurtados:</p>
                                    <ul className="list-disc pl-5">
                                        {analysis.shortened.map(muscle => <li key={muscle}>{muscle}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-green-500 font-semibold mb-1">Alongados:</p>
                                    <ul className="list-disc pl-5">
                                        {analysis.lengthened.map(muscle => <li key={muscle}>{muscle}</li>)}
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
        <div className="min-h-screen bg-background text-foreground">
            <header className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => router.push('/postural/analysis')}><ArrowLeft /></Button>
                    <User className="size-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Resumo da Avaliação Postural</h1>
                        <p className="text-muted-foreground">{client?.name} - Histórico e Comparação</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Button onClick={handleExportPdf} variant="outline"><Download className="mr-2" /> Gerar Relatório PDF</Button>
                    <Button onClick={handleBackToEvaluation} variant="ghost">
                        Voltar ao Dashboard
                    </Button>
                </div>
            </header>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
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
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Selecione as avaliações para comparar (máx. 4)</p>
                        <div className="flex gap-4 overflow-x-auto pb-4">
                            {clientEvaluations.length > 0 ? (
                                clientEvaluations.map((ev, index) => {
                                    const isSelectedForCompare = selectedEvalIds.includes(ev.id);
                                    const hasPosturalData = ev.posturalPhotos && Object.keys(ev.posturalPhotos).length > 0;

                                    return (
                                        <Card 
                                            key={ev.id} 
                                            className={cn(
                                                "shrink-0 w-40 text-center cursor-pointer transition-colors shadow-sm rounded-2xl relative",
                                                isSelectedForCompare ? 'bg-primary text-primary-foreground border-transparent shadow-lg' : 'bg-card',
                                                !hasPosturalData && 'opacity-50 grayscale'
                                            )}
                                            onClick={() => handleCompareSelection(ev.id)}
                                        >
                                            {!hasPosturalData && (
                                                <div className="absolute top-2 right-2">
                                                    <Info className="size-4 text-muted-foreground" />
                                                </div>
                                            )}
                                            <CardHeader className="p-4 relative">
                                                    <CardTitle className={cn("text-xs font-normal capitalize", isSelectedForCompare ? "text-primary-foreground" : "text-card-foreground")}>
                                                    {new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                <p className={cn("text-3xl font-bold", isSelectedForCompare ? "text-primary-foreground" : "text-card-foreground")}>{index + 1}</p>
                                                <p className="text-[10px] mt-1 uppercase tracking-tighter opacity-70">Avaliação</p>
                                            </CardContent>
                                        </Card>
                                    )
                                })
                            ) : (
                                <div className="w-full text-center py-8 text-muted-foreground">
                                    Nenhuma avaliação encontrada para este cliente.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {comparedEvaluations.length > 1 ? (
                    <Card className="border-primary/20 shadow-xl">
                        <CardHeader className="bg-primary/5">
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <Camera className="size-5" />
                                Comparativo de Evolução Postural
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-10">
                            {Object.entries(photoViewMapping).map(([photoType, { title }]) => {
                                const hasPhotosForView = comparedEvaluations.some(ev => ev.posturalPhotos?.[photoType as PhotoType]);
                                if (!hasPhotosForView) return null;

                                return (
                                    <div key={photoType} className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-lg text-foreground border-l-4 border-primary pl-3">{title}</h3>
                                            <div className="h-px flex-1 bg-muted"></div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {comparedEvaluations.map(ev => {
                                                const photoSrc = ev.posturalPhotos?.[photoType as PhotoType];
                                                return (
                                                    <div key={ev.id} className="space-y-2">
                                                        <div className="bg-muted/30 p-1 rounded-lg">
                                                            <div className="w-full aspect-[3/4] bg-muted rounded-md flex items-center justify-center relative overflow-hidden shadow-inner">
                                                                {photoSrc ? (
                                                                    <Image src={photoSrc} alt={`${title} - ${ev.date}`} layout="fill" objectFit="contain" className="hover:scale-110 transition-transform duration-500" />
                                                                ) : (
                                                                    <div className="flex flex-col items-center text-muted-foreground/50">
                                                                        <Camera className="h-10 w-10 mb-2" />
                                                                        <p className="text-[10px] uppercase font-bold">Sem foto</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-xs font-bold text-center bg-muted text-muted-foreground py-1 rounded-full">
                                                            {new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR')}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                ) : comparedEvaluations.length === 1 || Object.keys(photos).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(photoViewMapping).map(([photoType, { title, viewKey }]) => {
                            const viewDeviations = analysisData.deviations[viewKey] || [];
                            const photoSrc = analysisData.photos[photoType as PhotoType];

                            if (viewDeviations.length === 0 && !photoSrc) return null;

                            return (
                                <Card key={viewKey} className="overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col sm:flex-row">
                                            <div className="w-full sm:w-40 bg-muted flex items-center justify-center relative aspect-[3/4] sm:aspect-auto">
                                                {photoSrc ? (
                                                    <Image src={photoSrc} alt={title} layout="fill" objectFit="contain" />
                                                ) : (
                                                    <Camera className="w-12 h-12 text-muted-foreground/30" />
                                                )}
                                            </div>
                                            <div className="flex-1 p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-bold text-lg">{title}</h3>
                                                    {comparedEvaluations.length === 1 && (
                                                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded">
                                                            {new Date(comparedEvaluations[0].date.replace(/-/g, '/')).toLocaleDateString('pt-BR')}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Desvios</p>
                                                        {viewDeviations.length > 0 ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {viewDeviations.map(d => (
                                                                    <span key={d} className="text-xs bg-muted px-2 py-1 rounded-md border border-muted-foreground/10">{d}</span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground italic">Nenhum desvio selecionado.</p>
                                                        )}
                                                    </div>
                                                    {renderMuscleAnalysisForView(viewKey as any)}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Alert className="bg-primary/5 border-primary/20">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Nenhuma análise selecionada</AlertTitle>
                        <AlertDescription>
                            Selecione uma ou mais avaliações acima para visualizar as fotos e os desvios posturais.
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            <div className="flex justify-end gap-4 mt-12 pb-12">
                <Button onClick={handleFinish} size="lg" className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/20 h-12 px-8 rounded-full">
                    <Check className="mr-2 size-5" />
                    Finalizar Avaliação
                </Button>
            </div>

            {/* Hidden Report for PDF Generation */}
            <div className="fixed -left-[9999px] -top-[9999px] w-[800px] bg-white">
                {client && (
                    <PosturalReport
                        ref={reportRef}
                        client={client}
                        photos={analysisData.photos}
                        deviations={analysisData.deviations}
                        muscleAnalysis={groupedMuscleAnalysis}
                        comparedEvaluations={comparedEvaluations}
                        viewTitles={viewTitles}
                    />
                )}
            </div>
        </div>
    );
}
