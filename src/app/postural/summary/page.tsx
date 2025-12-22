'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, User, Camera, ArrowRight, Edit, Dumbbell, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { usePosturalContext } from '../context';
import { muscleMappings } from '@/lib/postural-data';
import { clients, evaluations } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
import PosturalReport from '@/components/PosturalReport';
import { Separator } from '@/components/ui/separator';


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
    const { photos, deviations, clearDeviations, isSaved, saveAnalysis } = usePosturalContext();
    const { toast } = useToast();
    const router = useRouter();
    const reportRef = useRef<HTMLDivElement>(null);
    
    // Mocking postural evaluations being linked to general evaluations
    const [selectedClientId, setSelectedClientId] = useState<string>(clients[0].id);
    const [selectedEvalIds, setSelectedEvalIds] = useState<string[]>([]);
    const [showSaveAlert, setShowSaveAlert] = useState(false);
    
    const client = useMemo(() => clients.find(c => c.id === selectedClientId), [selectedClientId]);

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
        const viewDeviations = deviations[viewKey] || [];
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
                    <Button onClick={handleExportPdf}><Download className="mr-2" /> Gerar Relatório PDF</Button>
                    <Button onClick={handleBackToEvaluation} variant="outline">
                        <ArrowLeft className="mr-2"/>
                        Voltar ao Dashboard
                    </Button>
                    <p className="text-sm font-semibold text-primary uppercase">UPLOAD / AVALIAÇÃO / RESUMO</p>
                </div>
            </header>

            <div className="space-y-6">
                <Card>
                    <CardContent className="pt-6 flex gap-4 overflow-x-auto pb-4">
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
                                            {new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <p className={cn("text-4xl font-bold", isSelectedForCompare ? "text-primary-foreground" : "text-card-foreground")}>{index + 1}</p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </CardContent>
                    {clientEvaluations.length > 0 && (
                        <CardFooter>
                                <p className="text-sm text-muted-foreground">
                                {selectedEvalIds.length}/{clientEvaluations.length} avaliações selecionadas para comparação.
                            </p>
                        </CardFooter>
                    )}
                </Card>

                {Object.entries(photoViewMapping).map(([photoType, { title, viewKey }]) => {
                    const viewDeviations = deviations[viewKey] || [];
                    const photoSrc = photos[photoType as PhotoType];

                    if (viewDeviations.length === 0 && !photoSrc) return null;

                    return (
                        <Card key={viewKey}>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                     <div className="w-24 shrink-0">
                                        <div className="w-24 h-32 bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
                                            {photoSrc ? (
                                                <Image src={photoSrc} alt={title} layout="fill" objectFit="contain" />
                                            ) : (
                                                <Camera className="w-8 h-8 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{title}</h3>
                                        {viewDeviations.length > 0 ? (
                                            <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
                                                {viewDeviations.map(d => <li key={d}>{d}</li>)}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-muted-foreground mt-1">Nenhum desvio selecionado para esta vista.</p>
                                        )}
                                    </div>
                                </div>
                                {renderMuscleAnalysisForView(viewKey)}
                            </CardContent>
                        </Card>
                    );
                })}

            </div>

            <div className="flex justify-end gap-4 mt-8">
                <Button onClick={handleFinish} className="bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
                    <Check className="mr-2" />
                    Salvar e Finalizar
                </Button>
            </div>
            <div className="fixed -left-[9999px] -top-[9999px] w-[800px] bg-white">
                {client && (
                    <PosturalReport
                        ref={reportRef}
                        client={client}
                        photos={photos}
                        deviations={deviations}
                        muscleAnalysis={groupedMuscleAnalysis}
                        comparedEvaluations={comparedEvaluations}
                        viewTitles={viewTitles}
                    />
                )}
            </div>
        </div>
    );
}
