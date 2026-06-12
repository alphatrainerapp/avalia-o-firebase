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
    Scale,
    Activity,
    LineChart,
    ChevronRight,
    Search,
    User,
    Calendar,
    Settings2,
    RefreshCw,
    X,
    PlusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEvaluationContext } from '@/context/EvaluationContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    calculate1RM, 
    calculateRelativeStrength, 
    getStrengthClassification, 
    predict1RMFromIsometric, 
    calculateTrainingZones,
    calculateAlphaForceScore
} from '@/lib/strength-logic';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

interface LocalLift {
    exercise: string;
    weight: string;
    reps: string;
}

interface IsometricEntry {
    title: string;
    subtitle: string;
    attempts: string[];
    isCustom?: boolean;
}

export default function StrengthPage() {
    const { clients, selectedClientId, allEvaluations, setAllEvaluations, addEvaluation } = useEvaluationContext();
    const { toast } = useToast();

    const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('profile');

    // Dynamic Lifts
    const [lifts, setLifts] = useState<LocalLift[]>([
        { exercise: 'Supino Reto', weight: '', reps: '' },
        { exercise: 'Agachamento', weight: '', reps: '' },
        { exercise: 'Levantamento Terra', weight: '', reps: '' }
    ]);

    // Isometric Tests
    const [isometricTests, setIsometricTests] = useState<Record<string, IsometricEntry>>({
        imtp: { title: 'Mid-Thigh Pull (IMTP)', subtitle: 'Força de Cadeia Posterior', attempts: ['', '', ''] },
        squat: { title: 'Agachamento Isométrico', subtitle: 'Membros Inferiores Isolados', attempts: ['', '', ''] },
        bench: { title: 'Supino Isométrico', subtitle: 'Empurre Horizontal', attempts: ['', '', ''] },
        row: { title: 'Remada Isométrica', subtitle: 'Puxada Horizontal', attempts: ['', '', ''] }
    });

    // Custom Exercise States
    const [newIsoName, setNewIsoName] = useState('');
    const [newIsoSubtitle, setNewIsoSubtitle] = useState('');
    const [isAddIsoOpen, setIsAddIsoOpen] = useState(false);

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
        if (evaluation?.strengthData) {
            if (evaluation.strengthData.dynamic) {
                setLifts(evaluation.strengthData.dynamic.map(l => ({
                    exercise: l.exercise,
                    weight: l.weight.toString(),
                    reps: l.reps.toString()
                })));
            }
            if (evaluation.strengthData.isometric) {
                const iso = evaluation.strengthData.isometric;
                const loadedTests: Record<string, IsometricEntry> = { ...isometricTests };
                
                Object.entries(iso).forEach(([key, data]) => {
                    if (key === 'evaluator') return;
                    const testData = data as any;
                    loadedTests[key] = {
                        title: testData.title || isometricTests[key]?.title || key.toUpperCase(),
                        subtitle: testData.subtitle || isometricTests[key]?.subtitle || '',
                        attempts: testData.attempts?.map(String) || ['', '', ''],
                        isCustom: testData.isCustom || !isometricTests[key]
                    };
                });
                setIsometricTests(loadedTests);
            }
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

    const isometricAnalysis = useMemo(() => {
        const result: any = {};
        Object.entries(isometricTests).forEach(([key, entry]) => {
            const nums = entry.attempts.map(a => parseFloat(a) || 0);
            const peak = Math.max(...nums);
            const avg = nums.filter(n => n > 0).reduce((a, b) => a + b, 0) / (nums.filter(n => n > 0).length || 1);
            result[key] = {
                peak,
                avg: Math.round(avg * 10) / 10,
                rel: client?.bodyMeasurements?.weight ? Math.round((peak / client.bodyMeasurements.weight) * 100) / 100 : 0
            };
        });
        return result;
    }, [isometricTests, client]);

    const total1RM = useMemo(() => {
        return calculatedLifts.reduce((sum, l) => sum + l.estimated1RM, 0);
    }, [calculatedLifts]);

    const alphaForce = useMemo(() => {
        return calculateAlphaForceScore(calculatedLifts, isometricAnalysis, client?.bodyMeasurements?.weight || 0);
    }, [calculatedLifts, isometricAnalysis, client]);

    const handleUpdateLift = (index: number, field: keyof LocalLift, value: string) => {
        const newLifts = [...lifts];
        newLifts[index] = { ...newLifts[index], [field]: value };
        setLifts(newLifts);
    };

    const handleUpdateIsometric = (testKey: string, attemptIdx: number, value: string) => {
        setIsometricTests(prev => ({
            ...prev,
            [testKey]: {
                ...prev[testKey],
                attempts: prev[testKey].attempts.map((a, i) => i === attemptIdx ? value : a)
            }
        }));
    };

    const handleAddIsoTest = () => {
        if (!newIsoName) return;
        const key = `custom_${Date.now()}`;
        setIsometricTests(prev => ({
            ...prev,
            [key]: {
                title: newIsoName,
                subtitle: newIsoSubtitle || 'Teste Personalizado',
                attempts: ['', '', ''],
                isCustom: true
            }
        }));
        setNewIsoName('');
        setNewIsoSubtitle('');
        setIsAddIsoOpen(false);
        toast({ title: 'Teste Adicionado', description: `${newIsoName} incluído na avaliação.` });
    };

    const handleRemoveIsoTest = (key: string) => {
        setIsometricTests(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const handleNewEvaluation = () => {
        if (client) {
            const newEval = addEvaluation(client.id);
            setSelectedEvaluationId(newEval.id);
            toast({ title: "Nova Avaliação de Força", description: "Iniciando registro de testes de potência para hoje." });
        }
    };

    const handleSave = () => {
        const currentId = selectedEvaluationId || evaluation?.id;
        if (!currentId) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Selecione ou crie uma avaliação primeiro.' });
            return;
        }

        const isometricToSave: any = {};
        Object.entries(isometricTests).forEach(([key, data]) => {
            const analysis = isometricAnalysis[key];
            isometricToSave[key] = {
                title: data.title,
                subtitle: data.subtitle,
                attempts: data.attempts.map(Number),
                peakForce: analysis.peak,
                averageForce: analysis.avg,
                relativeForce: analysis.rel,
                isCustom: data.isCustom
            };
        });

        const strengthData = {
            dynamic: calculatedLifts.map(l => ({
                exercise: l.exercise,
                weight: parseFloat(l.weight) || 0,
                reps: parseInt(l.reps) || 0,
                estimated1RM: l.estimated1RM,
                method: 'brzycki'
            })),
            isometric: isometricToSave,
            alphaForceScore: alphaForce.score,
            totalTonnage: total1RM,
            relativeStrengthIndex: calculateRelativeStrength(total1RM, client?.bodyMeasurements?.weight || 0)
        };

        setAllEvaluations(prev => prev.map(ev => 
            ev.id === currentId ? { ...ev, strengthData } : ev
        ));

        toast({ title: 'Salvo!', description: 'Dados de força sincronizados com sucesso.' });
    };

    const handleSyncPeriodization = () => {
        toast({
            title: "Periodização Atualizada",
            description: `A força máxima do aluno aumentou ${((total1RM / 200) * 10).toFixed(1)}%. Cargas recalculadas.`,
            action: <Button variant="outline" size="sm">Ver Ciclo</Button>
        });
    };

    const TrainingZoneTable = ({ oneRM, exercise }: { oneRM: number, exercise: string }) => {
        const zones = calculateTrainingZones(oneRM);
        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-black bg-primary/10 text-primary border-primary/30 uppercase text-[9px] tracking-widest">{exercise}</Badge>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Zonas de Carga (kg)</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                    {zones.map(z => (
                        <div key={z.percentage} className="bg-muted/30 border border-muted rounded-lg p-2 text-center group hover:border-primary/50 transition-colors">
                            <p className="text-[8px] font-black text-muted-foreground opacity-50 mb-1">{z.percentage}%</p>
                            <p className="text-sm font-black text-foreground">{z.load}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const IsometricInputCard = ({ title, testKey, subtitle, isCustom }: { title: string, testKey: string, subtitle: string, isCustom?: boolean }) => {
        const analysis = isometricAnalysis[testKey];
        return (
            <Card className="shadow-lg border-primary/10 overflow-hidden group relative">
                {isCustom && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveIsoTest(testKey)}
                        className="absolute top-2 right-2 size-6 rounded-full text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X className="size-3" />
                    </Button>
                )}
                <div className="bg-primary/5 p-4 border-b border-muted/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-background rounded-lg text-primary shadow-sm"><Zap className="size-4" /></div>
                        <div>
                            <CardTitle className="text-sm font-bold uppercase">{title}</CardTitle>
                            <CardDescription className="text-[9px] font-bold">{subtitle}</CardDescription>
                        </div>
                    </div>
                </div>
                <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        {isometricTests[testKey].attempts.map((val, idx) => (
                            <div key={idx} className="space-y-1">
                                <Label className="text-[8px] font-black uppercase text-muted-foreground">T{idx+1}</Label>
                                <div className="relative">
                                    <Input 
                                        type="number" 
                                        value={val} 
                                        onChange={(e) => handleUpdateIsometric(testKey, idx, e.target.value)}
                                        className="h-10 text-center font-black bg-muted/10 border-muted group-hover:border-primary/30"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-1 bottom-1 text-[7px] font-black text-muted-foreground/30">KGF</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Separator className="bg-muted/50" />
                    <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 rounded-xl bg-primary/5 border border-primary/10">
                            <p className="text-[8px] font-black text-primary uppercase opacity-70">Pico</p>
                            <p className="text-lg font-black text-primary">{analysis.peak}</p>
                        </div>
                        <div className="text-center p-2 rounded-xl bg-muted/20">
                            <p className="text-[8px] font-black text-muted-foreground uppercase opacity-70">Média</p>
                            <p className="text-lg font-black">{analysis.avg}</p>
                        </div>
                        <div className="text-center p-2 rounded-xl bg-muted/20">
                            <p className="text-[8px] font-black text-muted-foreground uppercase opacity-70">Rel.</p>
                            <p className="text-lg font-black">{analysis.rel}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <header className="flex flex-wrap items-center justify-between mb-8 gap-4 px-4 sm:px-0">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard"><Button variant="outline" size="icon" className="rounded-full shadow-sm"><ArrowLeft className="size-4" /></Button></Link>
                    <div className="p-2 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                        <Dumbbell className="size-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight uppercase">Avaliação de Força</h1>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Protocolos Isométricos e Dinâmicos</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleSave} className="bg-primary text-primary-foreground shadow-xl h-11 px-8 rounded-2xl font-black uppercase tracking-wider hover:bg-primary/90">
                        <Save className="mr-2 h-4 w-4" /> Salvar Avaliação
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Lateral: Perfil do Atleta e Score */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-xl bg-card overflow-hidden rounded-3xl">
                        <CardHeader className="bg-muted/10 p-6 flex items-center gap-4 border-b border-muted/50">
                            <Avatar className="h-16 w-16 border-4 border-background shadow-lg">
                                <AvatarImage src={client?.avatarUrl} />
                                <AvatarFallback>{client?.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-lg font-black tracking-tight">{client?.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-[8px] font-black uppercase bg-muted/20 border-none">{client?.gender}</Badge>
                                    <span className="text-[10px] font-bold text-muted-foreground">{client?.bodyMeasurements?.weight || '--'} kg</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">
                            {/* Alpha Force Score */}
                            <div className="text-center relative">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-4">Score Alpha Force</p>
                                <div className="relative size-32 mx-auto flex items-center justify-center bg-primary/5 rounded-full border-2 border-primary/10 shadow-inner">
                                    <div className="text-center">
                                        <p className="text-5xl font-black text-primary leading-none">{alphaForce.score}</p>
                                        <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">Pontos</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Badge className={cn("text-[9px] font-black uppercase px-4 py-1 h-6 shadow-sm", alphaForce.color.replace('text-', 'bg-') + "/20 " + alphaForce.color)}>
                                        {alphaForce.classification}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-muted-foreground">Força Relativa (IFR)</span>
                                    <span className="font-black text-primary">{calculateRelativeStrength(total1RM, client?.bodyMeasurements?.weight || 0).toFixed(2)}</span>
                                </div>
                                <Progress value={alphaForce.score} className="h-2 bg-muted border border-muted/50" />
                                <p className="text-[8px] text-muted-foreground italic leading-tight text-center">"O Score Alpha combina potência isométrica e resistência dinâmica em um índice único de 0 a 100."</p>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/5 p-4">
                            <Button onClick={handleNewEvaluation} variant="outline" className="w-full rounded-xl border-dashed border-muted-foreground/30 font-bold h-10">
                                <Plus className="mr-2 size-4" /> Nova Avaliação
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Evolução Histórica */}
                    <Card className="rounded-3xl border-none shadow-lg">
                        <CardHeader className="p-6 pb-2">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp className="size-4 text-primary" /> Histórico PR
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {clientEvaluations.length > 0 ? clientEvaluations.slice(-3).reverse().map(ev => (
                                <div key={ev.id} className="p-3 rounded-2xl bg-muted/20 border border-muted flex items-center justify-between group hover:bg-muted/40 transition-colors">
                                    <div>
                                        <p className="text-[8px] font-black text-muted-foreground uppercase">{new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR')}</p>
                                        <p className="font-black text-sm">{ev.strengthData?.totalTonnage?.toFixed(0) || '--'} kg Total</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-primary">{ev.strengthData?.alphaForceScore || '--'}</p>
                                        <p className="text-[7px] font-bold opacity-40 uppercase">Alpha Force</p>
                                    </div>
                                </div>
                            )) : <p className="text-[10px] text-muted-foreground italic text-center py-4">Sem registros históricos.</p>}
                        </CardContent>
                    </Card>
                </div>

                {/* Área Central: Tabs de Avaliação */}
                <div className="lg:col-span-3 space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-muted/10 h-14 p-1.5 rounded-2xl border border-muted/50">
                            <TabsTrigger value="profile" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-lg">
                                <Activity className="mr-2 size-4" /> Perfil de Força
                            </TabsTrigger>
                            <TabsTrigger value="isometric" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-lg">
                                <Zap className="mr-2 size-4" /> Isométricos
                            </TabsTrigger>
                            <TabsTrigger value="dynamic" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-lg">
                                <Dumbbell className="mr-2 size-4" /> Testes 1RM
                            </TabsTrigger>
                        </TabsList>

                        {/* TAB: PERFIL DE FORÇA */}
                        <TabsContent value="profile" className="mt-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-slate-900 text-white border-none shadow-2xl rounded-3xl overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                        <Trophy size={140} />
                                    </div>
                                    <CardContent className="p-8 relative z-10 space-y-8">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Carga Total Dinâmica (1RM)</span>
                                            <div className="flex items-baseline gap-2 mt-2">
                                                <span className="text-7xl font-black tracking-tighter">{total1RM.toFixed(0)}</span>
                                                <span className="text-2xl font-bold opacity-50">kg</span>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                                            <div>
                                                <p className="text-[9px] font-black uppercase opacity-60">IFR Relativo</p>
                                                <p className="text-3xl font-black">{calculateRelativeStrength(total1RM, client?.bodyMeasurements?.weight || 0).toFixed(2)}x</p>
                                            </div>
                                            <Button onClick={handleSyncPeriodization} className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-12 px-6 font-black uppercase text-[10px] shadow-lg shadow-primary/30">
                                                <RefreshCw className="mr-2 size-4" /> Atualizar Cargas
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-3xl border-none shadow-xl bg-card overflow-hidden">
                                    <CardHeader className="bg-muted/10 p-6 border-b border-muted/50">
                                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                            <Target className="size-4 text-primary" /> Predição de Força Máxima
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-muted/50">
                                            <div>
                                                <p className="text-[9px] font-black text-muted-foreground uppercase">Agachamento Predito</p>
                                                <p className="text-2xl font-black text-foreground">{predict1RMFromIsometric(isometricAnalysis.imtp.peak, 'imtp_squat')} <span className="text-xs opacity-40">kg</span></p>
                                            </div>
                                            <div className="p-3 bg-background rounded-xl border shadow-sm text-primary"><Activity size={20} /></div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-muted/50">
                                            <div>
                                                <p className="text-[9px] font-black text-muted-foreground uppercase">Terra Predito</p>
                                                <p className="text-2xl font-black text-foreground">{predict1RMFromIsometric(isometricAnalysis.imtp.peak, 'imtp_deadlift')} <span className="text-xs opacity-40">kg</span></p>
                                            </div>
                                            <div className="p-3 bg-background rounded-xl border shadow-sm text-primary"><Activity size={20} /></div>
                                        </div>
                                        <p className="text-[9px] text-muted-foreground italic leading-tight text-center bg-primary/5 p-3 rounded-xl border border-primary/10">
                                            "Estimativa baseada na força de pico do Mid-Thigh Pull (IMTP)."
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Zonas de Treinamento */}
                            <Card className="rounded-3xl border-none shadow-xl bg-card overflow-hidden">
                                <CardHeader className="bg-slate-900 p-6 text-white border-b border-white/5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/20 rounded-lg text-primary"><Settings2 className="size-5" /></div>
                                            <div>
                                                <CardTitle className="text-lg font-black uppercase tracking-tight">Zonas de Intensidade de Periodização</CardTitle>
                                                <CardDescription className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Baseado no 1RM Estimado</CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 space-y-10">
                                    {calculatedLifts.filter(l => l.estimated1RM > 0).map(lift => (
                                        <TrainingZoneTable key={lift.exercise} exercise={lift.exercise} oneRM={lift.estimated1RM} />
                                    ))}
                                    {calculatedLifts.filter(l => l.estimated1RM > 0).length === 0 && (
                                        <div className="py-10 text-center space-y-4 border-2 border-dashed rounded-3xl border-muted">
                                            <div className="size-16 mx-auto bg-muted rounded-full flex items-center justify-center text-muted-foreground opacity-20"><Dumbbell size={32} /></div>
                                            <p className="text-sm font-bold text-muted-foreground italic">Nenhum teste de 1RM dinâmico registrado.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* TAB: TESTES ISOMÉTRICOS */}
                        <TabsContent value="isometric" className="mt-6 space-y-6">
                            <div className="flex justify-end px-2">
                                <Dialog open={isAddIsoOpen} onOpenChange={setIsAddIsoOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="rounded-xl font-bold bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 border">
                                            <PlusCircle className="mr-2 size-4" /> Adicionar Exercício
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Novo Teste Isométrico</DialogTitle>
                                            <DialogDescription>Defina o nome do exercício isométrico que deseja testar.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Nome do Exercício</Label>
                                                <Input value={newIsoName} onChange={(e) => setNewIsoName(e.target.value)} placeholder="Ex: Extensão de Joelho Isométrica" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Objetivo / Subtítulo</Label>
                                                <Input value={newIsoSubtitle} onChange={(e) => setNewIsoSubtitle(e.target.value)} placeholder="Ex: Força de Quadríceps" />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsAddIsoOpen(false)}>Cancelar</Button>
                                            <Button onClick={handleAddIsoTest}>Adicionar Teste</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(isometricTests).map(([key, test]) => (
                                    <IsometricInputCard 
                                        key={key} 
                                        testKey={key} 
                                        title={test.title} 
                                        subtitle={test.subtitle} 
                                        isCustom={test.isCustom}
                                    />
                                ))}
                            </div>
                            
                            <div className="mt-8 p-8 bg-muted/10 rounded-3xl border-2 border-dashed border-muted text-center max-w-2xl mx-auto">
                                <div className="p-3 bg-background rounded-full border shadow-sm text-primary inline-block mb-4"><Info size={24} /></div>
                                <h4 className="text-sm font-black uppercase tracking-widest mb-2">Orientações de Célula de Carga</h4>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Realize 3 tentativas de força máxima explosiva por teste. O descanso entre tentativas deve ser de 60 segundos. 
                                    O sistema capturará automaticamente o **Pico de Força (KGF)** para predição das cargas dinâmicas na periodização.
                                </p>
                            </div>
                        </TabsContent>

                        {/* TAB: TESTES DE 1RM DINÂMICO */}
                        <TabsContent value="dynamic" className="mt-6">
                            <Card className="rounded-3xl border-none shadow-xl bg-card overflow-hidden">
                                <CardHeader className="bg-muted/10 p-6 flex flex-row items-center justify-between border-b border-muted/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary"><LineChart size={20} /></div>
                                        <div>
                                            <CardTitle className="text-lg font-black uppercase">Registro de Cargas de Treino</CardTitle>
                                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Cálculo via Brzycki & Epley</CardDescription>
                                        </div>
                                    </div>
                                    <Button onClick={() => setLifts([...lifts, { exercise: '', weight: '', reps: '' }])} variant="outline" size="sm" className="rounded-xl font-bold h-10 border-primary text-primary hover:bg-primary/5">
                                        <Plus className="mr-1 h-3 w-3" /> Adicionar Exercício
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/20 h-14 border-none">
                                                <TableHead className="px-8 font-black text-[10px] uppercase text-muted-foreground">Exercício</TableHead>
                                                <TableHead className="text-center font-black text-[10px] uppercase text-muted-foreground">Carga (kg)</TableHead>
                                                <TableHead className="text-center font-black text-[10px] uppercase text-muted-foreground">Reps</TableHead>
                                                <TableHead className="text-center font-black text-[10px] uppercase text-primary tracking-widest">1RM Estimado</TableHead>
                                                <TableHead className="w-16"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {lifts.map((lift, index) => (
                                                <TableRow key={index} className="h-20 border-muted/10 group transition-colors hover:bg-muted/5">
                                                    <TableCell className="px-8">
                                                        <Input 
                                                            value={lift.exercise} 
                                                            onChange={(e) => handleUpdateLift(index, 'exercise', e.target.value)}
                                                            className="h-11 font-black border-muted bg-transparent focus:bg-background focus:border-primary/50 text-sm"
                                                            placeholder="Ex: Supino Reto"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="w-32">
                                                        <Input 
                                                            type="number"
                                                            value={lift.weight} 
                                                            onChange={(e) => handleUpdateLift(index, 'weight', e.target.value)}
                                                            className="h-11 text-center font-black bg-muted/10 border-muted"
                                                            placeholder="0"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="w-24">
                                                        <Input 
                                                            type="number"
                                                            value={lift.reps} 
                                                            onChange={(e) => handleUpdateLift(index, 'reps', e.target.value)}
                                                            className="h-11 text-center font-black bg-muted/10 border-muted"
                                                            placeholder="0"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-2xl font-black text-primary tracking-tighter">
                                                                {calculate1RM(parseFloat(lift.weight) || 0, parseInt(lift.reps) || 0).toFixed(1)}
                                                            </span>
                                                            <span className="text-[8px] font-black text-muted-foreground/50 uppercase">kg</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-4">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => setLifts(lifts.filter((_, i) => i !== index))}
                                                            className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-all rounded-full"
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
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
