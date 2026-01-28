'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
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

    useEffect(() => {
        // This effect runs only on the client
        setCurrentDate(new Date().toLocaleDateString('pt-BR'));
        clearPosturalData();
    }, [clearPosturalData]);

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

    const handleSave = () => {
        if (selectedEvaluationId) {
            setAllEvaluations(prevEvals =>
                prevEvals.map(ev =>
                    ev.id === selectedEvaluationId
                        ? { ...ev, posturalPhotos: photos, posturalDeviations: deviations }
                        : ev
                )
            );
            const evalDate = new Date(allEvaluations.find(e => e.id === selectedEvaluationId)!.date.replace(/-/g, '/')).toLocaleDateString('pt-BR');
            toast({
                title: 'Análise Salva',
                description: `A análise postural foi salva na avaliação de ${evalDate}.`,
            });
        } else {
             toast({
                title: 'Análise Salva (Avulsa)',
                description: 'A análise postural avulsa foi salva localmente.',
            });
        }
        console.log('Saving analysis:', { photos, deviations }, 'for eval:', selectedEvaluationId);
    };
    
    const handleClientChange = (clientId: string) => {
        setSelectedClientId(clientId);
        setSelectedEvaluationId(null);
        clearPosturalData();
    };

    const handleNewEvaluation = () => {
      setSelectedEvaluationId(null);
      clearPosturalData();
      toast({ title: "Nova Avaliação Postural", description: "As fotos enviadas não serão associadas a uma avaliação física existente." });
    }

    const handleSelectEvaluation = (evalId: string) => {
      if (selectedEvaluationId === evalId) {
        setSelectedEvaluationId(null);
        clearPosturalData();
      } else {
        const evaluation = allEvaluations.find(e => e.id === evalId);
        if (evaluation) {
            loadPosturalData({
                photos: evaluation.posturalPhotos || {},
                deviations: evaluation.posturalDeviations || {}
            });
            setSelectedEvaluationId(evalId);
        }
      }
    }

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
                                <Plus className="mr-2" /> Avaliação Avulsa
                            </Button>
                        </div>
                    </CardHeader>
                     <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Selecione uma avaliação física existente para vincular esta análise postural, ou crie uma avaliação avulsa.
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
                                        onClick={() => handleSelectEvaluation(ev.id)}
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
                            {selectedEvaluationId ? `Anexando fotos à avaliação de ${clientEvaluations.find(e => e.id === selectedEvaluationId)?.date ? new Date(clientEvaluations.find(e => e.id === selectedEvaluationId)!.date.replace(/-/g, '/')).toLocaleDateString('pt-BR') : ''}.` : 'Criando uma nova avaliação postural avulsa.'}
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
