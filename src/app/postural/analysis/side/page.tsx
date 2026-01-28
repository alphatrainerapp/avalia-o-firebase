'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Save, ArrowRight, User, Maximize, Grid, ZoomIn, ZoomOut, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { usePosturalContext } from '../context';
import { Slider } from '@/components/ui/slider';
import { useIsMobile } from '@/hooks/use-mobile';
import { posturalDeviations } from '@/lib/postural-data';

// Configuration for the different analysis views
const analysisOrder = ['anterior', 'posterior', 'lateral_direita', 'lateral_esquerda'] as const;
type ViewKey = typeof analysisOrder[number];

const viewConfig: Record<ViewKey, { photoKey: 'front' | 'back' | 'right' | 'left'; title: string; }> = {
    anterior: { photoKey: 'front', title: 'Análise da Visão Frontal' },
    posterior: { photoKey: 'back', title: 'Análise da Visão Posterior' },
    lateral_direita: { photoKey: 'right', title: 'Análise da Visão Lateral Direita' },
    lateral_esquerda: { photoKey: 'left', title: 'Análise da Visão Lateral Esquerda' },
};


export default function PosturalAnalysisPage() {
    const { toast } = useToast();
    const router = useRouter();
    const { photos, deviations, toggleDeviation, saveAnalysis } = usePosturalContext();
    const [viewIndex, setViewIndex] = useState(0);

    const [showGrid, setShowGrid] = useState(false);
    const [currentDate, setCurrentDate] = useState('');
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const startPos = useRef({ x: 0, y: 0 });
    const isMobile = useIsMobile();

    // Dynamically set content based on the current view
    const viewKey = analysisOrder[viewIndex];
    const { photoKey, title } = viewConfig[viewKey];
    const imageToDisplay = photos[photoKey];
    const analysisSections = posturalDeviations[viewKey];

    useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString('pt-BR'));
    }, []);

    const handleSave = () => {
        saveAnalysis();
        toast({
            title: 'Análise Salva',
            description: 'A análise postural foi salva com sucesso.',
        });
    };

    const handleNext = () => {
        if (viewIndex < analysisOrder.length - 1) {
            setViewIndex(viewIndex + 1);
        } else {
            router.push('/postural/summary');
        }
    };

    const handleBack = () => {
        if (viewIndex > 0) {
            setViewIndex(viewIndex - 1);
        } else {
            router.push('/postural');
        }
    };

    // Image zoom and pan handlers
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (zoom <= 1) return;
        setIsDragging(true);
        startPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
        if (imageContainerRef.current) imageContainerRef.current.style.cursor = 'grabbing';
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (imageContainerRef.current) imageContainerRef.current.style.cursor = zoom > 1 ? 'grab' : 'default';
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !imageContainerRef.current) return;
        const newX = e.clientX - startPos.current.x;
        const newY = e.clientY - startPos.current.y;
        const containerRect = imageContainerRef.current.getBoundingClientRect();
        const imageWidth = containerRect.width * zoom;
        const imageHeight = containerRect.height * zoom;
        const max_X = (imageWidth - containerRect.width) / 2;
        const max_Y = (imageHeight - containerRect.height) / 2;
        const constrainedX = Math.max(Math.min(newX, max_X), -max_X);
        const constrainedY = Math.max(Math.min(newY, max_Y), -max_Y);
        setPosition({ x: constrainedX, y: constrainedY });
    };

    useEffect(() => {
        if (zoom <= 1) setPosition({ x: 0, y: 0 });
        if (imageContainerRef.current) imageContainerRef.current.style.cursor = zoom > 1 ? 'grab' : 'default';
    }, [zoom]);
    
    // Reset zoom and position when view changes
    useEffect(() => {
        setZoom(1);
        setPosition({x: 0, y: 0});
    }, [viewIndex]);

    const renderAnalysisContent = () => {
        if (!analysisSections) return null; // Or some fallback UI

        const content = (
            <Accordion type="multiple" defaultValue={analysisSections.map(s => s.title)} className="w-full space-y-4">
                {analysisSections.map((section) => (
                     <Card key={section.title} className="overflow-hidden">
                        <AccordionItem value={section.title} className="border-b-0">
                            <AccordionTrigger className="text-base font-semibold px-6 py-4 bg-muted/30 hover:bg-muted/50">
                                {section.title}
                            </AccordionTrigger>
                            <AccordionContent className="p-6 pt-2">
                                <div className="space-y-4 pl-2">
                                    {section.items.map((item, itemIndex) => (
                                        <div key={itemIndex}>
                                            {item.subtitle && <Label className="font-medium text-sm">{item.subtitle}</Label>}
                                            <div className="grid gap-2 mt-2">
                                                {item.options.map(option => (
                                                    <div key={option} className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id={`${section.title}-${itemIndex}-${option}`}
                                                            checked={deviations[viewKey]?.includes(option)}
                                                            onCheckedChange={() => toggleDeviation(viewKey, option)}
                                                        />
                                                        <Label htmlFor={`${section.title}-${itemIndex}-${option}`} className="font-normal text-sm">{option}</Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Card>
                ))}
            </Accordion>
        );
        
        if (isMobile) {
            // Mobile view will use the same accordion for now to ensure functionality.
            // A carousel could be re-implemented if requested.
            return content;
        }

        return content;
    };


    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={handleBack}><ArrowLeft /></Button>
                    <User className="size-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Avaliação Postural</h1>
                        <p className="text-muted-foreground">Data: {currentDate}</p>
                    </div>
                </div>
                <p className="text-sm font-semibold text-primary uppercase">UPLOAD / AVALIAÇÃO / RESUMO</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                             <div 
                                ref={imageContainerRef}
                                className="relative w-full max-w-sm mx-auto aspect-[3/4] bg-muted rounded-lg overflow-hidden"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                             >
                                {imageToDisplay && (
                                    <Image
                                        src={imageToDisplay}
                                        alt={title}
                                        layout="fill"
                                        objectFit="contain"
                                        className="rounded-lg transition-transform duration-200"
                                        style={{ transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)` }}
                                        draggable={false}
                                    />
                                )}
                                {showGrid && (
                                     <div className="absolute inset-0 pointer-events-none">
                                        {[...Array(9)].map((_, i) => (<div key={`v-${i}`} className="absolute bg-black/80" style={{ left: `${(i + 1) * 10}%`, top: 0, bottom: 0, width: '1px' }} />))}
                                        {[...Array(14)].map((_, i) => (<div key={`h-${i}`} className="absolute bg-black/80" style={{ top: `${(i + 1) * (100 / 15)}%`, left: 0, right: 0, height: '1px' }} />))}
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
                            <div className="flex items-center gap-2 px-4">
                               <ZoomOut className="size-5" />
                               <Slider
                                   value={[zoom]}
                                   onValueChange={(value) => setZoom(value[0])}
                                   min={1}
                                   max={3}
                                   step={0.1}
                               />
                               <ZoomIn className="size-5" />
                           </div>
                        </div>

                        <div className="space-y-4">
                            {renderAnalysisContent()}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4 mt-8">
                <Button onClick={handleSave} className="bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
                    <Save className="mr-2" />
                    Salvar
                </Button>
                {viewIndex < analysisOrder.length - 1 ? (
                    <Button variant="outline" onClick={handleNext}>
                        Próximo
                        <ArrowRight className="ml-2" />
                    </Button>
                ) : (
                    <Button variant="outline" onClick={handleNext}>
                       Ver Resumo
                       <FileText className="ml-2" />
                    </Button>
                )}
            </div>
        </div>
    );
}