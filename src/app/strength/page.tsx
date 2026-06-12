'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
    Dumbbell, 
    ArrowLeft, 
    Plus, 
    Save, 
    Trash2, 
    TrendingUp, 
    Trophy, 
    Info, 
    Target,
    Zap,
    Scale
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEvaluationContext } from '@/context/EvaluationContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { calculate1RM, calculateRelativeStrength, getStrengthClassification } from '@/lib/strength-logic';
import { Badge } from '@/components/ui/badge';

interface LocalLift {
    exercise: string;
    weight: string;
    reps: string;
}

export default function StrengthPage() {
    const { clients, selectedClientId, allEvaluations, setAllEvaluations, addEvaluation } = useEvaluationContext();
    const { toast } = useToast();

    const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);
    const [lifts, setLifts] = useState<LocalLift[]>([
        { exercise: 'Supino Reto', weight: '', reps: '' },
        { exercise: 'Agachamento', weight: '', reps: '' },
        { exercise: 'Levantamento Terra', weight: '', reps: '' }
    ]);

    const client = useMemo(() => clients.find(c => c.id === selectedClientId), [selectedClientId, clients]);
    const clientEvaluations = useMemo(() => {
        return allEvaluations
            .filter(e => e.clientId === selectedClientId)
            .sort((a, b) => new Date(a.date.replace(/-/g, '/')).getTime() - new Date(b.date.replace(/-/g, '/')).getTime());
    }, [selectedClientId, allEvaluations]);

    const evaluation = useMemo(() => {
        if (selectedEvaluationId) {
            return clientEvaluations.find(e => e.id === selectedEvaluationId);
        }
        return clientEvaluations[clientEvaluations.length - 1];
    }, [clientEvaluations, selectedEvaluationId]);

    useEffect(() => {
        if (evaluation?.strengthData?.lifts) {
            setLifts(evaluation.strengthData.lifts.map(l => ({
                exercise: l.exercise,
                weight: l.weight.toString(),
                reps: l.reps.toString()
            })));
        }
    }, [evaluation]);

    const calculatedLifts = useMemo(() => {
        return lifts.map(lift => {
            const w = parseFloat(lift.weight) || 0;
            const r = parseInt(lift.reps) || 0;
            const rm = calculate1RM(w, r);
            return { ...lift, estimated1RM: rm };
        });
    }, [lifts]);

    const total1RM = useMemo(() => {
        return calculatedLifts.reduce((sum, l) => sum + l.estimated1RM, 0);
    }, [calculatedLifts]);

    const relativeStrength = useMemo(() => {
        if (!client || !client.bodyMeasurements?.weight) return 0;
        return calculateRelativeStrength(total1RM, client.bodyMeasurements.weight);
    }, [total1RM, client]);

    const classification = useMemo(() => {
        if (!client) return { label: 'N/A', color: 'text-muted-foreground' };
        return getStrengthClassification(relativeStrength, client.gender);
    }, [relativeStrength, client]);

    const handleAddLift = () => {
        setLifts([...lifts, { exercise: '', weight: '', reps: '' }]);
    };

    const handleUpdateLift = (index: number, field: keyof LocalLift, value: string) => {
        const newLifts = [...lifts];
        newLifts[index] = { ...newLifts[index], [field]: value };
        setLifts(newLifts);
    };

    const handleRemoveLift = (index: number) => {
        setLifts(lifts.filter((_, i) => i !== index));
    };

    const handleNewEvaluation = () => {
        if (client) {
            const newEval = addEvaluation(client.id);
            setSelectedEvaluationId(newEval.id);
            setLifts([
                { exercise: 'Supino Reto', weight: '', reps: '' },
                { exercise: 'Agachamento', weight: '', reps: '' },
                { exercise: 'Levantamento Terra', weight: '', reps: '' }
            ]);
            toast({ title: "Nova Avaliação de Força", description: "Iniciando registro de testes de RM para hoje." });
        }
    };

    const handleSave = () => {
        const currentId = selectedEvaluationId || evaluation?.id;
        if (!currentId) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Selecione ou crie uma avaliação primeiro.' });
            return;
        }

        const strengthData = {
            lifts: calculatedLifts.map(l => ({
                exercise: l.exercise,
                weight: parseFloat(l.weight) || 0,
                reps: parseInt(l.reps) || 0,
                estimated1RM: l.estimated1RM
            })),
            totalTonnage: total1RM,
            relativeStrengthIndex: relativeStrength
        };

        setAllEvaluations(prev => prev.map(ev => 
            ev.id === currentId ? { ...ev, strengthData } : ev
        ));

        toast({ title: 'Salvo!', description: 'Dados de força registrados com sucesso.' });
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <header className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard"><Button variant="outline" size="icon"><ArrowLeft className="size-4" /></Button></Link>
                    <Dumbbell className="size-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Avaliação de Força</h1>
                        <p className="text-muted-foreground">Testes de 1RM e Força Relativa</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleSave} className="bg-primary text-primary-foreground shadow-lg"><Save className="mr-2 h-4 w-4" /> Salvar</Button>
                </div>
            </header>

            <div className="space-y-6">
                <Card className="border-none shadow-sm bg-card">
                    <CardContent className="p-4 flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/20">
                            <AvatarImage src={client?.avatarUrl} alt={client?.name} />
                            <AvatarFallback>{client?.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-xl font-bold">{client?.name}</h2>
                            <p className="text-sm text-muted-foreground">
                                {client?.age} anos • {client?.gender} • Peso: {client?.bodyMeasurements?.weight || '--'} kg
                            </p>
                        </div>
                        <div className="ml-auto">
                            <Button onClick={handleNewEvaluation} variant="outline" size="sm">
                                <Plus className="mr-2 h-4 w-4" /> Nova Avaliação
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Painel de Resultados */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="bg-primary text-white border-none shadow-xl rounded-2xl overflow-hidden relative">
                             <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Trophy size={140} />
                            </div>
                            <CardContent className="p-8 relative z-10 space-y-6">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total de Carga (1RM)</span>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-6xl font-black tabular-nums">{total1RM.toFixed(0)}</span>
                                        <span className="text-xl font-bold opacity-70">kg</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Força Relativa (IFR)</span>
                                        <Badge variant="secondary" className="bg-white/20 text-white border-none font-bold">
                                            {classification.label}
                                        </Badge>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black">{relativeStrength.toFixed(2)}</span>
                                        <span className="text-xs font-bold opacity-60">x Peso Corp.</span>
                                    </div>
                                    <p className="text-[9px] mt-2 opacity-70 italic leading-tight">
                                        "O IFR indica quantas vezes o atleta consegue levantar o próprio peso."
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <TrendingUp className="size-4 text-primary" />
                                    Evolução Recente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {clientEvaluations.length > 0 ? clientEvaluations.slice(-3).reverse().map(ev => (
                                    <div key={ev.id} className="flex justify-between items-center p-3 rounded-xl bg-muted/30 border border-muted">
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR')}</p>
                                            <p className="font-black text-lg">{ev.strengthData?.totalTonnage?.toFixed(0) || '--'} kg</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">IFR</p>
                                            <p className="font-bold text-primary">{ev.strengthData?.relativeStrengthIndex?.toFixed(2) || '--'}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-xs text-muted-foreground italic text-center py-4">Sem histórico registrado.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Registro de Exercícios */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-lg border-primary/10">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-muted/50 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <Zap className="size-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-bold">Registro de Testes de RM</CardTitle>
                                        <CardDescription className="text-xs">Insira a carga e repetições para estimar o 1RM.</CardDescription>
                                    </div>
                                </div>
                                <Button onClick={handleAddLift} variant="outline" size="sm" className="h-8 rounded-full">
                                    <Plus className="mr-1 h-3 w-3" /> Add Exercício
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/30 h-12">
                                            <TableHead className="px-6 font-bold text-[10px] uppercase">Exercício</TableHead>
                                            <TableHead className="text-center font-bold text-[10px] uppercase">Carga (kg)</TableHead>
                                            <TableHead className="text-center font-bold text-[10px] uppercase">Reps</TableHead>
                                            <TableHead className="text-center font-bold text-[10px] uppercase text-primary">1RM Estimado</TableHead>
                                            <TableHead className="w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {lifts.map((lift, index) => (
                                            <TableRow key={index} className="h-16 border-muted/10 group">
                                                <TableCell className="px-6">
                                                    <Input 
                                                        value={lift.exercise} 
                                                        onChange={(e) => handleUpdateLift(index, 'exercise', e.target.value)}
                                                        className="h-10 font-bold border-muted group-hover:border-primary/50 transition-colors"
                                                        placeholder="Ex: Supino Reto"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input 
                                                        type="number"
                                                        value={lift.weight} 
                                                        onChange={(e) => handleUpdateLift(index, 'weight', e.target.value)}
                                                        className="h-10 text-center font-bold border-muted"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input 
                                                        type="number"
                                                        value={lift.reps} 
                                                        onChange={(e) => handleUpdateLift(index, 'reps', e.target.value)}
                                                        className="h-10 text-center font-bold border-muted"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xl font-black text-primary">
                                                            {calculate1RM(parseFloat(lift.weight) || 0, parseInt(lift.reps) || 0).toFixed(1)}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-muted-foreground uppercase">kg</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleRemoveLift(index)}
                                                        className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-all"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Info Metodológica */}
                        <div className="p-6 bg-muted/20 rounded-2xl border border-muted/50 flex items-start gap-4 shadow-inner">
                            <div className="p-2 bg-background rounded-full border shadow-sm text-primary">
                                <Info className="size-5" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xs font-bold uppercase tracking-wider">Metodologia Brzycki & Epley</h4>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    O sistema utiliza a fórmula de Brzycki para testes de até 10 repetições e a fórmula de Epley para séries mais longas. 
                                    A estimativa é uma ferramenta segura para prescrever intensidades sem a necessidade de testes de carga máxima reais, que possuem maior risco de lesão.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
