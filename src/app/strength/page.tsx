
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
    PlusCircle,
    ArrowUpRight,
    ArrowDownRight,
    Equal,
    Gauge,
    Download,
    HelpCircle
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
import { Switch } from '@/components/ui/switch';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import StrengthReport from '@/components/StrengthReport';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    const reportRef = useRef<HTMLDivElement>(null);

    const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);
    const [isCompareMode, setCompareMode] = useState(false);
    const [selectedEvalIdsForCompare, setSelectedEvalIdsForCompare] = useState<string[]>([]);
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

    const comparedEvaluations = useMemo(() => {
        return clientEvaluations
            .filter(e => selectedEvalIdsForCompare.includes(e.id))
            .sort((a,b) => new Date(a.date.replace(/-/g, '/')).getTime() - new Date(b.date.replace(/-/g, '/')).getTime());
    }, [selectedEvalIdsForCompare, clientEvaluations]);

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
                    if (testData && typeof testData === 'object') {
                        loadedTests[key] = {
                            title: testData.title || isometricTests[key]?.title || key.toUpperCase(),
                            subtitle: testData.subtitle || isometricTests[key]?.subtitle || '',
                            attempts: testData.attempts?.map(String) || ['', '', ''],
                            isCustom: testData.isCustom || !isometricTests[key]
                        };
                    }
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

    const predictedLifts = useMemo(() => {
        if (!isometricAnalysis.imtp) return [];
        return [
            { exercise: 'Agachamento (Predito)', estimated1RM: predict1RMFromIsometric(isometricAnalysis.imtp.peak, 'imtp_squat') },
            { exercise: 'Levantamento Terra (Predito)', estimated1RM: predict1RMFromIsometric(isometricAnalysis.imtp.peak, 'imtp_deadlift') },
            { exercise: 'Supino (Predito)', estimated1RM: predict1RMFromIsometric(isometricAnalysis.bench?.peak || 0, 'bench') },
        ].filter(p => p.estimated1RM > 0);
    }, [isometricAnalysis]);

    const total1RM = useMemo(() => {
        return calculatedLifts.reduce((sum, l) => sum + l.estimated1RM, 0);
    }, [calculatedLifts]);

    const alphaForce = useMemo(() => {
        return calculateAlphaForceScore(calculatedLifts, isometricAnalysis, client?.bodyMeasurements?.weight || 0);
    }, [calculatedLifts, isometricAnalysis, client]);

    const evolutionStats = useMemo(() => {
        if (comparedEvaluations.length < 2) return null;
        const first = comparedEvaluations[0];
        const last = comparedEvaluations[comparedEvaluations.length - 1];

        const firstTotal = first.strengthData?.totalTonnage || 0;
        const lastTotal = last.strengthData?.totalTonnage || 0;
        const totalDiff = firstTotal > 0 ? ((lastTotal - firstTotal) / firstTotal) * 100 : 0;

        const firstScore = first.strengthData?.alphaForceScore || 0;
        const lastScore = last.strengthData?.alphaForceScore || 0;
        const scoreDiff = lastScore - firstScore;

        return {
            totalDiff: totalDiff.toFixed(1),
            scoreDiff,
            periodDays: Math.round((new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24))
        };
    }, [comparedEvaluations]);

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
            setCompareMode(false);
            setSelectedEvalIdsForCompare([]);
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

    const handleCompareToggle = (checked: boolean) => {
        setCompareMode(checked);
        if (!checked) setSelectedEvalIdsForCompare([]);
        else if (evaluation && !selectedEvalIdsForCompare.includes(evaluation.id)) setSelectedEvalIdsForCompare([evaluation.id]);
    }

    const handleCompareSelection = (evalId: string) => {
        setSelectedEvalIdsForCompare(prev => {
            if (prev.includes(evalId)) return prev.filter(id => id !== evalId);
            if (prev.length < 4) return [...prev, evalId].sort((a,b) => new Date(a.replace(/-/g, '/')).getTime() - new Date(b.replace(/-/g, '/')).getTime());
            toast({variant: 'destructive', title: 'Aviso', description: 'Máximo 4 avaliações.'})
            return prev;
        });
    }

    const handleExportPdf = async () => {
        const reportElement = reportRef.current;
        if (!reportElement || !client) return;

        toast({ title: 'Gerando Relatório PDF...', description: 'Aguarde um momento.' });

        const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
        pdf.save(`relatorio_forca_${client.name.replace(/\s+/g, '_')}.pdf`);
        
        toast({ title: 'Relatório Exportado!' });
    };

    const TrainingZoneTable = ({ oneRM, exercise, isPredicted }: { oneRM: number, exercise: string, isPredicted?: boolean }) => {
        const zones = calculateTrainingZones(oneRM);
        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("font-black bg-primary/10 text-primary border-primary/30 uppercase text-[9px] tracking-widest", isPredicted && "bg-cyan-500/10 text-cyan-500 border-cyan-500/30")}>
                            {exercise}
                        </Badge>
                        {isPredicted && <span className="text-[8px] font-bold text-cyan-500 uppercase">(Predito via Isometria)</span>}
                    </div>
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

    const EvolutionCard = ({ title, value, unit, diff, isScore }: { title: string, value: string | number, unit: string, diff?: string | number, isScore?: boolean }) => {
        const diffNum = typeof diff === 'string' ? parseFloat(diff) : (diff || 0);
        return (
            <div className="p-4 rounded-2xl bg-muted/10 border border-muted/50 flex flex-col justify-between">
                <div>
                    <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{title}</p>
                    <p className="text-2xl font-black mt-1">{value}<span className="text-[10px] font-bold ml-1 opacity-40">{unit}</span></p>
                </div>
                {diff !== undefined && (
                    <div className={cn("flex items-center gap-1 text-[10px] font-black mt-3", diffNum > 0 ? "text-green-500" : diffNum < 0 ? "text-red-500" : "text-muted-foreground")}>
                        {diffNum > 0 ? <ArrowUpRight size={14} /> : diffNum < 0 ? <ArrowDownRight size={14} /> : <Equal size={14} />}
                        {diffNum > 0 ? '+' : ''}{diff}{isScore ? ' pts' : '%'}
                    </div>
                )}
            </div>
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
                    <Button onClick={handleExportPdf} variant="outline" className="h-11 px-6 rounded-2xl font-black uppercase shadow-sm">
                        <Download className="mr-2 h-4 w-4" /> Gerar PDF
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Lateral: Perfil do Atleta e Histórico */}
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
                                <div className="flex items-center justify-center gap-1 mb-4">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Score Alpha Force</p>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="size-3 text-muted-foreground cursor-help hover:text-primary transition-colors" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-[220px] text-[10px] leading-tight p-3 bg-slate-900 text-white border-none shadow-xl">
                                                <p className="font-bold text-primary mb-1 uppercase tracking-widest">Como funciona o cálculo?</p>
                                                <p className="opacity-80">O Score (0-100) quantifica a potência global. Ele é baseado na <strong>Soma das Forças Relativas (Carga/Peso)</strong> de todos os exercícios dinâmicos e isométricos. Um score de 100 representa o <strong>Padrão Ouro de Elite</strong> (IFR total ≥ 5.0).</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
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
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/5 p-4 flex flex-col gap-2">
                            <div className="flex items-center justify-between w-full px-2">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground">Modo Comparação</Label>
                                <Switch checked={isCompareMode} onCheckedChange={handleCompareToggle} />
                            </div>
                            <Button onClick={handleNewEvaluation} variant="outline" className="w-full rounded-xl border-dashed border-muted-foreground/30 font-bold h-10 mt-2">
                                <Plus className="mr-2 size-4" /> Nova Avaliação
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Histórico Selecionável */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground px-4">Histórico de Avaliações</Label>
                        <div className="flex flex-col gap-3">
                            {clientEvaluations.length > 0 ? clientEvaluations.slice().reverse().map((ev, idx) => {
                                const isSelected = selectedEvaluationId === ev.id && !isCompareMode;
                                const isSelectedForCompare = selectedEvalIdsForCompare.includes(ev.id);
                                return (
                                    <div 
                                        key={ev.id} 
                                        className={cn(
                                            "p-3 rounded-2xl cursor-pointer transition-all border flex items-center justify-between group",
                                            isCompareMode 
                                                ? isSelectedForCompare ? 'bg-primary border-transparent text-white shadow-lg' : 'bg-muted/20 border-muted'
                                                : isSelected ? 'bg-card border-primary ring-2 ring-primary/10' : 'bg-muted/20 border-muted hover:bg-muted/30'
                                        )}
                                        onClick={() => isCompareMode ? handleCompareSelection(ev.id) : setSelectedEvaluationId(ev.id)}
                                    >
                                        <div>
                                            <p className={cn("text-[8px] font-black uppercase", isSelectedForCompare ? "text-white/60" : "text-muted-foreground")}>
                                                {new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR')}
                                            </p>
                                            <p className="font-black text-sm">{ev.strengthData?.totalTonnage?.toFixed(0) || '--'} kg Total</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn("text-[10px] font-black", isSelectedForCompare ? "text-white" : "text-primary")}>{ev.strengthData?.alphaForceScore || '--'}</p>
                                            <p className={cn("text-[7px] font-bold uppercase", isSelectedForCompare ? "text-white/40" : "opacity-40")}>Alpha Force</p>
                                        </div>
                                    </div>
                                );
                            }) : <p className="text-[10px] text-muted-foreground italic text-center py-4">Sem registros.</p>}
                        </div>
                    </div>
                </div>

                {/* Área Central: Tabs de Avaliação */}
                <div className="lg:col-span-3 space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-muted/20 h-14 p-1.5 rounded-2xl border border-muted/50">
                            <TabsTrigger value="profile" className="rounded-xl font-black uppercase text-[10px] tracking-widest text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all">
                                <Activity className="mr-2 size-4" /> Perfil de Força
                            </TabsTrigger>
                            <TabsTrigger value="isometric" className="rounded-xl font-black uppercase text-[10px] tracking-widest text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all">
                                <Zap className="mr-2 size-4" /> Isométricos
                            </TabsTrigger>
                            <TabsTrigger value="dynamic" className="rounded-xl font-black uppercase text-[10px] tracking-widest text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all">
                                <Dumbbell className="mr-2 size-4" /> Testes 1RM
                            </TabsTrigger>
                        </TabsList>

                        {/* TAB: PERFIL DE FORÇA */}
                        <TabsContent value="profile" className="mt-6 space-y-8">
                            {isCompareMode && comparedEvaluations.length >= 2 ? (
                                <div className="space-y-6">
                                    {/* Resumo de Evolução Comparada */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <EvolutionCard 
                                            title="Evolução Carga Total" 
                                            value={comparedEvaluations[comparedEvaluations.length-1].strengthData?.totalTonnage?.toFixed(0) || 0} 
                                            unit="kg" 
                                            diff={evolutionStats?.totalDiff}
                                        />
                                        <EvolutionCard 
                                            title="Evolução Alpha Score" 
                                            value={comparedEvaluations[comparedEvaluations.length-1].strengthData?.alphaForceScore || 0} 
                                            unit="pts" 
                                            diff={evolutionStats?.scoreDiff}
                                            isScore
                                        />
                                        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col justify-center">
                                            <p className="text-[8px] font-black uppercase text-primary tracking-widest">Período de Análise</p>
                                            <p className="text-2xl font-black mt-1">{evolutionStats?.periodDays}<span className="text-[10px] font-bold ml-1 opacity-50">Dias</span></p>
                                        </div>
                                    </div>

                                    {/* Tabela Comparativa Detalhada */}
                                    <Card className="rounded-3xl border-none shadow-xl bg-card overflow-hidden">
                                        <CardHeader className="bg-muted/10 p-6 border-b border-muted/50">
                                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                                <TrendingUp className="size-4 text-primary" /> Matriz Evolutiva de Força
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-muted/20 h-14 border-none">
                                                        <TableHead className="px-8 font-black text-[10px] uppercase text-muted-foreground">Parâmetro</TableHead>
                                                        {comparedEvaluations.map(ev => (
                                                            <TableHead key={ev.id} className="text-center font-black text-[10px] uppercase text-muted-foreground">
                                                                {new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR')}
                                                            </TableHead>
                                                        ))}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {/* Linhas de Força Isométrica */}
                                                    <TableRow className="bg-muted/5">
                                                        <TableCell colSpan={comparedEvaluations.length + 1} className="px-8 py-2 text-[9px] font-black text-primary uppercase">Isométricos (Pico KGF)</TableCell>
                                                    </TableRow>
                                                    {Object.keys(isometricTests).map(testKey => (
                                                        <TableRow key={testKey} className="h-16 border-muted/10">
                                                            <TableCell className="px-8 font-bold text-xs">{isometricTests[testKey].title}</TableCell>
                                                            {comparedEvaluations.map(ev => {
                                                                const iso = ev.strengthData?.isometric?.[testKey] as any;
                                                                return (
                                                                    <TableCell key={ev.id} className="text-center font-black text-sm">
                                                                        {iso?.peakForce || '--'}
                                                                    </TableCell>
                                                                );
                                                            })}
                                                        </TableRow>
                                                    ))}
                                                    {/* Linhas de 1RM Dinâmico */}
                                                    <TableRow className="bg-muted/5">
                                                        <TableCell colSpan={comparedEvaluations.length + 1} className="px-8 py-2 text-[9px] font-black text-primary uppercase">Dinâmicos (1RM kg)</TableCell>
                                                    </TableRow>
                                                    {lifts.map((lift, liftIdx) => (
                                                        <TableRow key={liftIdx} className="h-16 border-muted/10">
                                                            <TableCell className="px-8 font-bold text-xs">{lift.exercise}</TableCell>
                                                            {comparedEvaluations.map(ev => {
                                                                const dynamic = ev.strengthData?.dynamic?.find(d => d.exercise === lift.exercise);
                                                                return (
                                                                    <TableCell key={ev.id} className="text-center font-black text-sm">
                                                                        {dynamic?.estimated1RM?.toFixed(1) || '--'}
                                                                    </TableCell>
                                                                );
                                                            })}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card className="bg-slate-900 text-white border-none shadow-2xl rounded-3xl overflow-hidden relative group">
                                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                                <Trophy size={140} />
                                            </div>
                                            <CardContent className="p-8 relative z-10 space-y-8">
                                                <div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Carga Total Dinâmica (1RM)</span>
                                                    <div className="flex items-baseline gap-2 mt-2">
                                                        <span className="text-7xl font-black tracking-tighter leading-none">{total1RM.toFixed(0)}</span>
                                                        <span className="text-2xl font-bold opacity-50">kg</span>
                                                    </div>
                                                </div>

                                                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase opacity-60">IFR Relativo</p>
                                                        <p className="text-3xl font-black">{calculateRelativeStrength(total1RM, client?.bodyMeasurements?.weight || 0).toFixed(2)}x</p>
                                                    </div>
                                                    <Button onClick={() => toast({ title: "Periodização Atualizada", description: "Cargas sincronizadas." })} className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-12 px-6 font-black uppercase text-[10px] shadow-lg shadow-primary/30">
                                                        <RefreshCw className="mr-2 size-4" /> Atualizar Cargas
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Resumo Isométrico */}
                                        <Card className="rounded-3xl border-none shadow-xl bg-card overflow-hidden">
                                            <CardHeader className="bg-muted/10 p-6 border-b border-muted/50">
                                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                                    <Gauge className="size-4 text-primary" /> Performance Isométrica
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="space-y-4">
                                                    {Object.entries(isometricAnalysis).map(([key, data]: [string, any]) => (
                                                        <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-muted/5 border border-muted/30">
                                                            <div>
                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">{isometricTests[key].title}</p>
                                                                <p className="text-xl font-black">{data.peak} <span className="text-[10px] font-bold opacity-40">kgf</span></p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[9px] font-black text-primary uppercase">Relativo</p>
                                                                <p className="font-black text-sm">{data.rel}x</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {Object.keys(isometricAnalysis).length === 0 && <p className="text-xs text-muted-foreground italic text-center py-4">Nenhum teste isométrico realizado.</p>}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Predição e Zonas */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                        <p className="text-2xl font-black text-foreground">{predict1RMFromIsometric(isometricAnalysis.imtp?.peak || 0, 'imtp_squat')} <span className="text-xs opacity-40">kg</span></p>
                                                    </div>
                                                    <div className="p-3 bg-background rounded-xl border shadow-sm text-primary"><Activity size={20} /></div>
                                                </div>
                                                <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-muted/50">
                                                    <div>
                                                        <p className="text-[9px] font-black text-muted-foreground uppercase">Terra Predito</p>
                                                        <p className="text-2xl font-black text-foreground">{predict1RMFromIsometric(isometricAnalysis.imtp?.peak || 0, 'imtp_deadlift')} <span className="text-xs opacity-40">kg</span></p>
                                                    </div>
                                                    <div className="p-3 bg-background rounded-xl border shadow-sm text-primary"><Activity size={20} /></div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Zonas de Treinamento */}
                                        <Card className="rounded-3xl border-none shadow-xl bg-card overflow-hidden">
                                            <CardHeader className="bg-slate-900 p-6 text-white border-b border-white/5">
                                                <CardTitle className="text-lg font-black uppercase tracking-tight">Zonas de Intensidade (Cargas)</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-8">
                                                {/* Zonas Reais */}
                                                <div className="space-y-6">
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-primary/20 pb-2">Baseado em Testes Reais (1RM)</p>
                                                    {calculatedLifts.filter(l => l.estimated1RM > 0).map(lift => (
                                                        <TrainingZoneTable key={lift.exercise} exercise={lift.exercise} oneRM={lift.estimated1RM} />
                                                    ))}
                                                </div>
                                                
                                                {/* Zonas Preditas */}
                                                <div className="space-y-6 pt-4">
                                                    <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest border-b border-cyan-500/20 pb-2">Baseado em Predição Isométrica</p>
                                                    {predictedLifts.map(lift => (
                                                        <TrainingZoneTable key={lift.exercise} exercise={lift.exercise} oneRM={lift.estimated1RM} isPredicted />
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            )}
                            
                            {isCompareMode && comparedEvaluations.length < 2 && (
                                <div className="py-20 text-center space-y-4 border-2 border-dashed rounded-3xl border-muted">
                                    <div className="p-4 bg-muted/20 rounded-full inline-block text-muted-foreground opacity-30"><LineChart size={48} /></div>
                                    <h3 className="text-lg font-bold text-muted-foreground">Modo Comparação Ativo</h3>
                                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">Selecione pelo menos duas avaliações no histórico lateral para ver a análise evolutiva.</p>
                                </div>
                            )}
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
            
            {/* Hidden Report for PDF Capture */}
            <div className="fixed -left-[9999px] -top-[9999px] bg-white">
                {client && (
                    <StrengthReport 
                        ref={reportRef}
                        client={client}
                        evaluations={isCompareMode ? comparedEvaluations : (evaluation ? [evaluation] : [])}
                        isCompareMode={isCompareMode}
                    />
                )}
            </div>
        </div>
    );
}
