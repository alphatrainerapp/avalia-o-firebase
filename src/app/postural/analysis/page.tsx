'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Save, ArrowRight, User, Maximize, Grid, ZoomIn, ZoomOut, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

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

    // Carousel API state
    const [api, setApi] = useState<CarouselApi>();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!api) return;
        setCount(api.scrollSnapList().length);
        setCurrentSlide(api.selectedScrollSnap() + 1);
        api.on("select", () => {
            setCurrentSlide(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    const viewKey = analysisOrder[viewIndex];
    const { photoKey, title } = viewConfig[viewKey];
    const imageToDisplay = photos[photoKey];
    const analysisSections = posturalDeviations[viewKey];

    const flattenedMobileItems = useMemo(() => {
        if (!analysisSections) return [];
        return analysisSections.flatMap(section => 
            section.items.map(item => ({
                sectionTitle: section.title,
                ...item
            }))
        );
    }, [analysisSections]);

    useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString('pt-BR'));
    }, []);

    const handleSave = () => {
        saveAnalysis();
        toast({ title: 'Análise Salva', description: 'A análise postural foi salva com sucesso.' });
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
        setPosition({ x: Math.max(Math.min(newX, max_X), -max_X), y: Math.max(Math.min(newY, max_Y), -max_Y) });
    };

    useEffect(() => {
        if (zoom <= 1) setPosition({ x: 0, y: 0 });
    }, [zoom]);
    
    useEffect(() => {
        setZoom(1);
        setPosition({x: 0, y: 0});
    }, [viewIndex]);

    const renderAnalysisContent = () => {
        if (!analysisSections) return null;

        if (isMobile) {
            return (
                <div className="w-full space-y-4">
                    {/* Custom Carousel Header */}
                    <Card className="border-none shadow-none bg-muted/20 py-4 px-2">
                        <div className="flex items-center justify-between">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="size-8"
                                onClick={() => api?.scrollPrev()}
                                disabled={currentSlide === 1}
                            >
                                <ChevronLeft className="size-5 text-muted-foreground" />
                            </Button>
                            
                            <div className="text-center">
                                <h3 className="text-primary font-semibold text-sm sm:text-base">
                                    {flattenedMobileItems[currentSlide - 1]?.sectionTitle}
                                </h3>
                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                                    {currentSlide} de {count}
                                </p>
                            </div>

                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="size-8"
                                onClick={() => api?.scrollNext()}
                                disabled={currentSlide === count}
                            >
                                <ChevronRight className="size-5 text-muted-foreground" />
                            </Button>
                        </div>

                        {/* Pagination Dots */}
                        <div className="flex justify-center gap-1.5 mt-4">
                            {Array.from({ length: count }).map((_, i) => (
                                <div 
                                    key={i} 
                                    className={cn(
                                        "h-1.5 rounded-full transition-all duration-300",
                                        i + 1 === currentSlide ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                                    )}
                                />
                            ))}
                        </div>
                    </Card>

                    <Carousel setApi={setApi} className="w-full">
                        <CarouselContent>
                            {flattenedMobileItems.map((item, index) => (
                                <CarouselItem key={index}>
                                    <div className="bg-muted/10 rounded-2xl p-4 sm:p-6 min-h-[220px] border border-muted/20">
                                        <div className="space-y-4">
                                            {item.subtitle && (
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                                    {item.subtitle}
                                                </p>
                                            )}
                                            <div className="grid gap-4">
                                                {item.options.map(option => (
                                                    <div key={option} className="flex items-center space-x-3">
                                                        <Checkbox 
                                                            id={`mobile-${index}-${option}`}
                                                            checked={deviations[viewKey]?.includes(option)}
                                                            onCheckedChange={() => toggleDeviation(viewKey, option)}
                                                            className="size-6 rounded-full border-primary"
                                                        />
                                                        <Label 
                                                            htmlFor={`mobile-${index}-${option}`} 
                                                            className="text-sm sm:text-base font-normal text-foreground cursor-pointer"
                                                        >
                                                            {option}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                </div>
            );
        }

        return (
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
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="flex flex-wrap items-center justify-between mb-4 gap-4 px-4 sm:px-0">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={handleBack}><ArrowLeft className="size-4" /></Button>
                    <User className="size-6 text-primary" />
                    <div>
                        <h1 className="text-lg sm:text-2xl font-bold">Avaliação Postural</h1>
                    </div>
                </div>
                <p className="hidden sm:block text-sm font-semibold text-primary uppercase">UPLOAD / AVALIAÇÃO / RESUMO</p>
            </header>

            <Card className="mx-2 sm:mx-0 shadow-none border-none sm:border sm:shadow-lg">
                <CardContent className="p-2 sm:p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                        <div className="space-y-4">
                             <div className="flex items-center gap-2 px-4 max-w-sm mx-auto">
                                <ZoomOut className="size-4 text-muted-foreground" />
                                <Slider
                                    value={[zoom]}
                                    onValueChange={(value) => setZoom(value[0])}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    className="flex-1"
                                />
                                <ZoomIn className="size-4 text-muted-foreground" />
                                <span className="text-[10px] font-mono text-muted-foreground ml-2">{(zoom * 100).toFixed(0)}%</span>
                            </div>
                             <div 
                                ref={imageContainerRef}
                                className="relative w-full max-w-sm mx-auto aspect-[3/4] bg-muted rounded-lg overflow-hidden border shadow-inner"
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
                                        {[...Array(9)].map((_, i) => (<div key={`v-${i}`} className="absolute bg-black/30" style={{ left: `${(i + 1) * 10}%`, top: 0, bottom: 0, width: '1px' }} />))}
                                        {[...Array(14)].map((_, i) => (<div key={`h-${i}`} className="absolute bg-black/30" style={{ top: `${(i + 1) * (100 / 15)}%`, left: 0, right: 0, height: '1px' }} />))}
                                    </div>
                                )}
                                <div className="absolute top-2 left-2 flex flex-col gap-2">
                                    <Button variant="secondary" size="icon" className="size-8 opacity-80" onClick={() => setShowGrid(!showGrid)}>
                                        <Grid className={cn("size-4", showGrid && "text-primary")} />
                                    </Button>
                                    <Button variant="secondary" size="icon" className="size-8 opacity-80" onClick={() => setZoom(1)}>
                                        <Maximize className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 px-2 sm:px-0">
                            {renderAnalysisContent()}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between sm:justify-end gap-4 mt-8 px-4 pb-12">
                <Button variant="outline" onClick={handleSave} className="flex-1 sm:flex-none h-11">
                    <Save className="mr-2 size-4" />
                    Salvar
                </Button>
                {viewIndex < analysisOrder.length - 1 ? (
                    <Button onClick={handleNext} className="flex-1 sm:flex-none h-11">
                        Próximo
                        <ArrowRight className="ml-2 size-4" />
                    </Button>
                ) : (
                    <Button onClick={handleNext} className="flex-1 sm:flex-none h-11">
                       Ver Resumo
                       <FileText className="ml-2 size-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
