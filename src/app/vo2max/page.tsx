'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Wind, 
  Activity, 
  Timer, 
  Calculator, 
  Plus, 
  Save, 
  Download, 
  Trash2, 
  TrendingUp, 
  Info, 
  ChevronDown, 
  X, 
  Target,
  Trophy,
  Settings2,
  Check,
  Heart,
  Bike,
  Zap,
  Lock,
  Unlock,
  HeartPulse,
  Scale,
  Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEvaluationContext } from '@/context/EvaluationContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  type VO2Protocol, 
  type VO2Stage, 
  type ZoneConfig,
  DEFAULT_ZONES,
  calculateVO2, 
  getVO2Classification, 
  calculateTrainingZones, 
  detectThresholdConconi, 
  velocityToPace,
  getBPClassification,
  calculateTanakaFCMax
} from '@/lib/vo2-logic';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import VO2Report from '@/components/VO2Report';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export default function VO2MaxPage() {
    const { clients, selectedClientId, allEvaluations, setAllEvaluations, addEvaluation } = useEvaluationContext();
    const { toast } = useToast();
    const reportRef = useRef<HTMLDivElement>(null);

    const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);
    const [isCompareMode, setCompareMode] = useState(false);
    const [selectedEvalIdsForCompare, setSelectedEvalIdsForCompare] = useState<string[]>([]);

    const [protocol, setProtocol] = useState<VO2Protocol>('cooper');
    const [distance, setDistance] = useState<string>('');
    const [timeMinutes, setTimeMinutes] = useState<string>('');
    const [timeSeconds, setTimeSeconds] = useState<string>('');
    
    const [hrMax, setHrMax] = useState<string>('');
    const [isManualHRMax, setIsManualHRMax] = useState(false);
    const [hrRest, setHrRest] = useState<string>('60');
    
    const [pas, setPas] = useState<string>('120');
    const [pad, setPad] = useState<string>('80');
    
    const [recoveryHR, setRecoveryHR] = useState<string>('');
    const [powerWatts, setPowerWatts] = useState<string>('');
    const [conconiStages, setConconiStages] = useState<VO2Stage[]>([
        { velocity: 8, hr: 120 },
        { velocity: 9, hr: 132 },
        { velocity: 10, hr: 145 },
        { velocity: 11, hr: 158 },
        { velocity: 12, hr: 168 },
        { velocity: 13, hr: 175 },
        { velocity: 14, hr: 180 },
    ]);

    const [zoneConfigs, setZoneConfigs] = useState<ZoneConfig[]>(DEFAULT_ZONES);
    const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);

    const client = useMemo(() => clients.find(c => c.id === selectedClientId), [selectedClientId, clients]);
    
    const calculatedFCMax = useMemo(() => {
        if (!client) return 190;
        return calculateTanakaFCMax(client.age);
    }, [client]);

    const effectiveFCMax = useMemo(() => {
        if (isManualHRMax) return parseInt(hrMax) || calculatedFCMax;
        return calculatedFCMax;
    }, [isManualHRMax, hrMax, calculatedFCMax]);

    const hrReserve = useMemo(() => {
        const rest = parseInt(hrRest) || 60;
        return Math.max(0, effectiveFCMax - rest);
    }, [effectiveFCMax, hrRest]);

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
        if (evaluation?.vo2MaxData) {
            const data = evaluation.vo2MaxData;
            setProtocol(data.protocol as VO2Protocol || 'cooper');
            setHrMax(data.hrMax?.toString() || '');
            setIsManualHRMax(data.isManualHRMax || false);
            setHrRest(data.hrRest?.toString() || '60');
            setPas(data.bloodPressureSystolic?.toString() || '120');
            setPad(data.bloodPressureDiastolic?.toString() || '80');
            setDistance(data.distance?.toString() || '');
            setRecoveryHR(data.recoveryHR?.toString() || '');
            setPowerWatts(data.powerWatts?.toString() || '');
            if (data.totalTimeSeconds) {
                setTimeMinutes(Math.floor(data.totalTimeSeconds / 60).toString());
                setTimeSeconds((data.totalTimeSeconds % 60).toString());
            } else {
                setTimeMinutes('');
                setTimeSeconds('');
            }
            if (data.stages) setConconiStages(data.stages);
            if (data.zoneConfig) setZoneConfigs(data.zoneConfig);
            else setZoneConfigs(DEFAULT_ZONES);
        }
    }, [evaluation]);

    const totalSeconds = useMemo(() => {
        return (parseInt(timeMinutes) || 0) * 60 + (parseInt(timeSeconds) || 0);
    }, [timeMinutes, timeSeconds]);

    const bpClass = useMemo(() => {
        return getBPClassification(parseInt(pas) || 0, parseInt(pad) || 0);
    }, [pas, pad]);

    const testResults = useMemo(() => {
        if (!client) return null;

        const data = {
            protocol,
            date: new Date().toISOString(),
            weight: client.bodyMeasurements?.weight || 70, 
            age: client.age,
            gender: client.gender,
            hrMax: effectiveFCMax,
            hrRest: parseInt(hrRest) || 60,
            distance: parseFloat(distance) || 0,
            totalTimeSeconds: totalSeconds,
            stages: conconiStages,
            recoveryHR: parseFloat(recoveryHR) || 0,
            powerWatts: parseFloat(powerWatts) || 0
        };

        const vo2 = calculateVO2(data);
        const classification = getVO2Classification(vo2, client.age, client.gender);
        
        let vAM = 0;
        if (protocol === 'cooper' && data.distance) vAM = (data.distance / 12) * 60 / 1000;
        else if (protocol === 'conconi' && conconiStages.length > 0) vAM = Math.max(...conconiStages.map(s => s.velocity));
        else if (totalSeconds > 0) {
            const dist = protocol === 'five_km' ? 5 : (protocol === 'three_km' ? 3 : 0);
            if (dist > 0) vAM = (dist / (totalSeconds / 3600));
        }

        const zones = calculateTrainingZones(vo2, data.hrMax, data.hrRest, vAM, zoneConfigs);
        const conconiThreshold = protocol === 'conconi' ? detectThresholdConconi(conconiStages) : null;

        return { vo2, classification, zones, conconiThreshold, vAM };
    }, [client, protocol, distance, totalSeconds, conconiStages, effectiveFCMax, hrRest, recoveryHR, powerWatts, zoneConfigs]);

    const handleNewEvaluation = () => {
        if (client) {
            const newEval = addEvaluation(client.id);
            setSelectedEvaluationId(newEval.id);
            setCompareMode(false);
            setSelectedEvalIdsForCompare([]);
            setZoneConfigs(DEFAULT_ZONES);
            toast({ title: "Nova Avaliação", description: "Iniciando registro de VO2max para hoje." });
        }
    };

    const handleSave = () => {
        const currentId = selectedEvaluationId || evaluation?.id;
        if (!currentId) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Selecione ou crie uma avaliação primeiro.' });
            return;
        }

        const updatedData = {
            protocol,
            vo2: testResults?.vo2,
            vAM: testResults?.vAM,
            classification: testResults?.classification,
            hrMax: effectiveFCMax,
            isManualHRMax,
            hrRest: parseInt(hrRest),
            bloodPressureSystolic: parseInt(pas),
            bloodPressureDiastolic: parseInt(pad),
            distance: parseFloat(distance),
            totalTimeSeconds: totalSeconds,
            recoveryHR: parseFloat(recoveryHR),
            powerWatts: parseFloat(powerWatts),
            stages: conconiStages,
            zoneConfig: zoneConfigs
        };

        setAllEvaluations(prev => prev.map(ev => 
            ev.id === currentId ? { ...ev, vo2MaxData: updatedData } : ev
        ));

        toast({ title: 'Salvo!', description: 'Dados de performance registrados com sucesso.' });
    };

    const handleCompareToggle = (checked: boolean) => {
        setCompareMode(checked);
        if (!checked) {
            setSelectedEvalIdsForCompare([]);
        } else if (evaluation && !selectedEvalIdsForCompare.includes(evaluation.id)) {
            setSelectedEvalIdsForCompare([evaluation.id]);
        }
    }

    const handleCompareSelection = (evalId: string) => {
        setSelectedEvalIdsForCompare(prev => {
            if (prev.includes(evalId)) return prev.filter(id => id !== evalId);
            if (prev.length < 4) {
                return [...prev, evalId].sort((a,b) => {
                    const evalA = clientEvaluations.find(e => e.id === a);
                    const evalB = clientEvaluations.find(e => e.id === b);
                    return new Date(evalA!.date.replace(/-/g, '/')).getTime() - new Date(evalB!.date.replace(/-/g, '/')).getTime();
                });
            }
            toast({ variant: 'destructive', title: 'Limite atingido', description: 'Selecione no máximo 4 avaliações.' });
            return prev;
        });
    }

    const handleExportPdf = async () => {
        const reportElement = reportRef.current;
        if (!reportElement || !client) return;
        toast({ title: 'Gerando PDF...' });
        const canvas = await html2canvas(reportElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`vo2max_${client.name.replace(/\s+/g, '_')}.pdf`);
        toast({ title: 'PDF Exportado!' });
    };

    const handleAddStage = () => {
        const lastStage = conconiStages[conconiStages.length - 1];
        setConconiStages([...conconiStages, { velocity: (lastStage?.velocity || 8) + 1, hr: (lastStage?.hr || 120) + 10 }]);
    };

    const handleUpdateStage = (index: number, field: keyof VO2Stage, value: string) => {
        const newStages = [...conconiStages];
        newStages[index] = { ...newStages[index], [field]: parseFloat(value) || 0 };
        setConconiStages(newStages);
    };

    const handleRemoveStage = (index: number) => {
        setConconiStages(conconiStages.filter((_, i) => i !== index));
    };

    const handleAddZone = () => {
        const lastZone = zoneConfigs[zoneConfigs.length - 1];
        const newZone: ZoneConfig = {
            zone: `Z${zoneConfigs.length + 1}`,
            desc: 'Nova Zona',
            hrPerc: [lastZone?.hrPerc[1] || 0.90, (lastZone?.hrPerc[1] || 0.90) + 0.05],
            vAMperc: [lastZone?.vAMperc[1] || 0.90, (lastZone?.vAMperc[1] || 0.90) + 0.10],
            color: '#000000'
        };
        setZoneConfigs([...zoneConfigs, newZone]);
    };

    const handleUpdateZone = (index: number, updates: Partial<ZoneConfig>) => {
        const newConfigs = [...zoneConfigs];
        newConfigs[index] = { ...newConfigs[index], ...updates };
        setZoneConfigs(newConfigs);
    };

    const handleRemoveZone = (index: number) => {
        setZoneConfigs(zoneConfigs.filter((_, i) => i !== index));
    };

    const EvalCard = ({ ev, index }: { ev: any; index: number }) => {
        const isSelected = selectedEvaluationId === ev.id && !isCompareMode;
        const isSelectedForCompare = selectedEvalIdsForCompare.includes(ev.id);
        const vo2 = ev.vo2MaxData?.vo2;

        return (
            <Card 
                key={ev.id}
                className={cn(
                    "shrink-0 w-44 text-center cursor-pointer transition-all shadow-md rounded-2xl",
                    isCompareMode 
                        ? isSelectedForCompare ? 'bg-primary text-primary-foreground border-transparent scale-105' : 'bg-card'
                        : isSelected ? 'ring-2 ring-primary border-transparent' : 'bg-card',
                    !isCompareMode && 'hover:bg-accent'
                )}
                onClick={() => isCompareMode ? handleCompareSelection(ev.id) : setSelectedEvaluationId(ev.id)}
            >
                <CardHeader className="p-4 pb-1">
                    <CardTitle className={cn("text-sm font-normal", isSelectedForCompare ? "text-primary-foreground" : "opacity-70")}>
                        {new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <p className="text-3xl font-black">{vo2 ? vo2.toFixed(1) : '--'}</p>
                    <p className="text-[10px] uppercase font-bold tracking-tighter opacity-60">VO2 Máximo</p>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <header className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard"><Button variant="outline" size="icon"><ArrowLeft className="size-4" /></Button></Link>
                    <Wind className="size-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Avaliação VO2max</h1>
                        <p className="text-muted-foreground">Performance Cardiorrespiratória</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleSave} className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"><Save className="mr-2 h-4 w-4" /> Salvar</Button>
                    <Button onClick={handleExportPdf} variant="outline" className="shadow-sm"><Download className="mr-2 h-4 w-4" /> PDF</Button>
                </div>
            </header>

            <div className="space-y-6">
                {/* Perfil do Aluno */}
                <Card className="border-none shadow-sm bg-card">
                    <CardContent className="p-4 flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/20">
                            <AvatarImage src={client?.avatarUrl} alt={client?.name} />
                            <AvatarFallback>{client?.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-xl font-bold">{client?.name}</h2>
                            <p className="text-sm text-muted-foreground">
                                {client?.age} anos • {client?.gender} • {client?.height}cm
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-none bg-muted/10">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="grid gap-1">
                                <CardTitle className="text-lg">Histórico de Performance</CardTitle>
                                <CardDescription>Selecione avaliações para comparar a evolução do atleta.</CardDescription>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-background p-2 rounded-lg border">
                                    <Label htmlFor="compare-mode" className="text-xs font-bold uppercase cursor-pointer">Comparar</Label>
                                    <Switch id="compare-mode" checked={isCompareMode} onCheckedChange={handleCompareToggle} />
                                </div>
                                <Button onClick={handleNewEvaluation} size="sm" className="bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
                                    <Plus className="mr-2 h-4 w-4" /> Nova Avaliação
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex gap-4 overflow-x-auto pb-6 px-6 scrollbar-hide">
                        {clientEvaluations.map((ev, idx) => <EvalCard key={ev.id} ev={ev} index={idx} />)}
                    </CardContent>
                </Card>

                {isCompareMode && comparedEvaluations.length > 0 ? (
                    <Card className="border-primary/20 shadow-xl overflow-hidden">
                        <CardHeader className="bg-primary/5 border-b">
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <TrendingUp className="size-5" />
                                Tabela de Evolução Fisiológica
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent bg-muted/30">
                                        <TableHead className="font-bold uppercase text-[10px] w-[200px]">Métrica</TableHead>
                                        {comparedEvaluations.map(ev => (
                                            <TableHead key={ev.id} className="text-center font-bold text-xs">
                                                {new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR')}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[
                                        { label: 'VO2 Máximo (ml/kg/min)', key: 'vo2' },
                                        { label: 'vAM (km/h)', key: 'vAM' },
                                        { label: 'Ritmo vAM (min/km)', key: 'pace' },
                                        { label: 'FC Máxima (bpm)', key: 'hrMax' },
                                        { label: 'P.A. Repouso (mmHg)', key: 'bp' },
                                        { label: 'Classificação', key: 'classification' },
                                        { label: 'Protocolo', key: 'protocol' }
                                    ].map((row) => (
                                        <TableRow key={row.label} className="hover:bg-muted/10 h-12">
                                            <TableCell className="font-bold text-xs text-muted-foreground">{row.label}</TableCell>
                                            {comparedEvaluations.map(ev => {
                                                const data = ev.vo2MaxData;
                                                let value = data ? (data as any)[row.key] : '--';
                                                
                                                if (row.key === 'pace' && data?.vAM) value = velocityToPace(data.vAM);
                                                if (row.key === 'bp') value = data?.bloodPressureSystolic ? `${data.bloodPressureSystolic}/${data.bloodPressureDiastolic}` : '--';
                                                if (typeof value === 'number') value = value.toFixed(1);
                                                if (row.key === 'protocol') {
                                                    const names: Record<string, string> = {
                                                        cooper: 'Cooper', conconi: 'Conconi', cycling_power: 'Bike (Watts)',
                                                        three_km: '3km', five_km: '5km', balke: 'Balke', step_test: 'Step'
                                                    };
                                                    value = names[value] || value || '--';
                                                }

                                                return (
                                                    <TableCell key={ev.id} className="text-center font-black text-sm">
                                                        {value || '--'}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* CÁLCULO DE FREQUÊNCIA CARDÍACA */}
                        <Card className="shadow-lg border-primary/20 bg-card overflow-hidden">
                            <CardHeader className="pb-4 border-b border-muted/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20 text-primary">
                                            <HeartPulse className="size-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold">Cálculo de Frequência Cardíaca</CardTitle>
                                            <CardDescription className="text-xs">FC Máxima e Reserva baseadas no protocolo de Tanaka (2001).</CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-muted/20 px-4 py-2 rounded-full border border-muted">
                                        <span className="text-[10px] font-black uppercase text-primary tracking-widest">Manual</span>
                                        <Switch 
                                            checked={isManualHRMax} 
                                            onCheckedChange={setIsManualHRMax}
                                            className="data-[state=checked]:bg-primary"
                                        />
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-6 space-y-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Timer className="size-4 text-primary" />
                                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Método de Avaliação</span>
                                    </div>
                                    <div className="flex flex-col md:flex-row items-center gap-4">
                                        <Select value={protocol} onValueChange={(v) => setProtocol(v as VO2Protocol)}>
                                            <SelectTrigger className="h-11 w-full md:w-[280px] text-base font-bold bg-muted/10 border-muted">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cooper">Teste de Cooper (12 min)</SelectItem>
                                                <SelectItem value="three_km">Teste de 3km</SelectItem>
                                                <SelectItem value="five_km">Teste de 5km</SelectItem>
                                                <SelectItem value="balke">Teste de Balke (Tempo)</SelectItem>
                                                <SelectItem value="conconi">Teste de Conconi (Progressivo)</SelectItem>
                                                <SelectItem value="cycling_power">Teste de Potência (Bike - Watts)</SelectItem>
                                                <SelectItem value="step_test">Step Test (Banco)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <div className="flex items-center gap-2 text-muted-foreground bg-muted/5 px-3 py-2 rounded-lg border border-dashed border-muted/50">
                                            <Info className="size-4 shrink-0" />
                                            <p className="text-[11px] font-medium leading-none">Selecione o método.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* FC Máxima */}
                                    <div className="p-5 rounded-2xl bg-muted/5 border border-muted/30 relative">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Activity className="size-3 text-primary" />
                                                    <span className="text-[10px] font-black uppercase text-muted-foreground">FC Máxima (BPM)</span>
                                                </div>
                                                <div className="text-5xl font-black tabular-nums">
                                                    {isManualHRMax ? (
                                                        <Input 
                                                            type="number" 
                                                            className="h-12 w-32 border-none p-0 text-5xl font-black bg-transparent focus-visible:ring-0"
                                                            value={hrMax} 
                                                            onChange={(e) => setHrMax(e.target.value)} 
                                                            autoFocus
                                                        />
                                                    ) : calculatedFCMax}
                                                </div>
                                            </div>
                                            <div className="p-2.5 bg-background border border-muted/50 rounded-lg text-primary shadow-sm">
                                                <HeartPulse className="size-6" />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground italic flex items-center gap-1.5">
                                            <Info className="size-3" />
                                            {!isManualHRMax ? "Calculada: 208 - (0,7 × idade)" : "Valor manual"}
                                        </p>
                                    </div>

                                    {/* FC Repouso */}
                                    <div className="p-5 rounded-2xl bg-muted/5 border border-muted/30 relative">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Heart className="size-3 text-cyan-500" />
                                                    <span className="text-[10px] font-black uppercase text-muted-foreground">FC Repouso (BPM)</span>
                                                </div>
                                                <Input 
                                                    type="number" 
                                                    className="h-12 w-32 border-none p-0 text-5xl font-black bg-transparent focus-visible:ring-0"
                                                    value={hrRest} 
                                                    onChange={(e) => setHrRest(e.target.value)} 
                                                />
                                            </div>
                                            <div className="p-2.5 bg-background border border-muted/50 rounded-lg text-cyan-500 shadow-sm">
                                                <Heart className="size-6" />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground italic">Mínimo basal.</p>
                                    </div>

                                    {/* Hemodinâmica */}
                                    <div className="p-5 rounded-2xl bg-muted/5 border border-muted/30 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Zap className="size-3 text-primary" />
                                            <span className="text-[10px] font-black uppercase text-primary tracking-widest">Hemodinâmica</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-[9px] font-bold text-muted-foreground uppercase">PAS</Label>
                                                <div className="flex items-baseline gap-1.5">
                                                    <Input type="number" value={pas} onChange={(e) => setPas(e.target.value)} className="h-10 font-black text-xl bg-background" />
                                                    <span className="text-[9px] font-bold text-muted-foreground">mmHg</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[9px] font-bold text-muted-foreground uppercase">PAD</Label>
                                                <div className="flex items-baseline gap-1.5">
                                                    <Input type="number" value={pad} onChange={(e) => setPad(e.target.value)} className="h-10 font-black text-xl bg-background" />
                                                    <span className="text-[9px] font-bold text-muted-foreground">mmHg</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center bg-background p-2 rounded-lg border border-muted/30">
                                            <span className="text-[9px] font-black uppercase text-muted-foreground">Classe:</span>
                                            <Badge className={cn("text-[9px] font-black uppercase px-2 h-5", 
                                                bpClass.includes('Normal') ? 'bg-green-500/20 text-green-500 border-green-500/50' : 
                                                bpClass.includes('Pré') ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' : 'bg-red-500/20 text-red-500 border-red-500/50'
                                            )} variant="outline">
                                                {bpClass}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col md:flex-row items-center gap-6 shadow-inner relative overflow-hidden">
                                    <div className="absolute top-0 left-0 h-full w-1 bg-primary"></div>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-background rounded-full border border-primary/30 text-primary shadow-sm">
                                            <Target className="size-8" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black uppercase text-primary tracking-widest">FC de Reserva</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-5xl font-black text-primary">{hrReserve}</span>
                                                <span className="text-xs font-bold text-primary opacity-70">bpm</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 text-center md:text-left md:border-l md:border-primary/20 md:pl-6">
                                        <p className="text-sm font-medium leading-relaxed italic opacity-80 max-w-xs">
                                            "Representa a capacidade de adaptação cardiovascular do indivíduo."
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-background/50 p-3 rounded-xl border border-primary/20">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black uppercase text-muted-foreground">Capacidade</p>
                                            <p className="text-sm font-black text-primary uppercase">Boa</p>
                                        </div>
                                        <div className="bg-primary/20 p-2 rounded-full text-primary">
                                            <Check className="size-5" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 space-y-6">
                                    <div className="flex items-center gap-2">
                                        <Scale className="size-4 text-primary" />
                                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Protocolo de Teste</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-4">
                                            <Label className="text-xs font-bold">
                                                {protocol === 'cooper' ? "Distância Total Percorrida (metros)" : 
                                                 protocol === 'cycling_power' ? "Potência Aeróbica Máxima (Watts)" : "Tempo de Execução"}
                                            </Label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform">
                                                    {protocol === 'cycling_power' ? <Bike className="size-6" /> : <Activity className="size-6" />}
                                                </div>
                                                <Input 
                                                    type="number" 
                                                    placeholder="0" 
                                                    value={protocol === 'cycling_power' ? powerWatts : distance}
                                                    onChange={(e) => protocol === 'cycling_power' ? setPowerWatts(e.target.value) : setDistance(e.target.value)}
                                                    className="h-16 pl-14 pr-10 text-3xl font-black bg-muted/5 border-muted focus:border-primary shadow-sm" 
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground/50">
                                                    {protocol === 'cycling_power' ? 'W' : 'm'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="md:col-span-1 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Desempenho</span>
                                                <Badge className="bg-primary/20 text-primary border-primary/50 text-[10px] font-black h-5">
                                                    {testResults?.classification || '—'}
                                                </Badge>
                                            </div>
                                            <div className="pt-4 space-y-4">
                                                <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden relative border border-muted">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-700" 
                                                        style={{ width: testResults?.vo2 ? `${Math.min(100, (testResults.vo2 / 60) * 100)}%` : '0%' }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between text-[8px] font-black uppercase text-muted-foreground px-0.5">
                                                    <span>Muito abaixo</span>
                                                    <span>Abaixo</span>
                                                    <span>Média</span>
                                                    <span>Acima</span>
                                                    <span className="text-primary">Excelente</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-5 rounded-2xl bg-muted/10 border border-muted/30 flex flex-col justify-center items-center text-center gap-3">
                                            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 text-primary">
                                                <Trophy className="size-8" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Classificação</p>
                                                <p className="text-xl font-black text-primary uppercase">{testResults?.classification || '—'}</p>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[200px]">
                                                {testResults?.classification === 'Excelente' ? 
                                                    "Seu desempenho está acima da média para sua idade." :
                                                    "Resultado atual do condicionamento cardiorrespiratório."
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/5 py-3 border-t border-muted/30 flex flex-wrap items-center gap-6 px-6">
                                <div className="flex items-center gap-2 text-muted-foreground/60">
                                    <Info className="size-3.5" />
                                    <p className="text-[9px] font-medium tracking-wide">
                                        Fórmula de Tanaka (2001): FCmáx = 208 - (0,7 × idade)
                                    </p>
                                </div>
                                <div className="h-4 w-px bg-muted/30"></div>
                                <p className="text-[9px] font-medium text-muted-foreground/60">
                                    Uso educacional e esportivo.
                                </p>
                            </CardFooter>
                        </Card>

                        {/* REGISTRO DOS ESTÁGIOS - TESTE DE CONCONI */}
                        {protocol === 'conconi' && (
                            <Card className="shadow-lg border-primary/10 bg-card overflow-hidden">
                                <CardHeader className="pb-4 border-b border-muted/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                <Gauge className="size-6" />
                                            </div>
                                            <CardTitle className="text-lg font-bold">Estágios do Teste (Velocidade x FC)</CardTitle>
                                        </div>
                                        <Button onClick={handleAddStage} variant="outline" size="sm" className="h-9 px-4 font-bold border-muted">
                                            <Plus className="mr-2 h-4 w-4" /> Adicionar Estágio
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {conconiStages.map((stage, index) => (
                                            <div key={index} className="p-4 rounded-xl border border-primary/20 bg-muted/5 group relative">
                                                <button 
                                                    onClick={() => handleRemoveStage(index)}
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white items-center justify-center hidden group-hover:flex shadow-md transition-all"
                                                >
                                                    <X size={12} />
                                                </button>
                                                <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-3">Estágio {index + 1}</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center bg-background border border-muted rounded-lg px-2 shadow-sm focus-within:ring-1 focus-within:ring-primary/30 transition-all">
                                                            <Input 
                                                                type="number" 
                                                                value={stage.velocity} 
                                                                onChange={(e) => handleUpdateStage(index, 'velocity', e.target.value)}
                                                                className="h-10 border-none bg-transparent p-0 text-center font-bold text-base focus-visible:ring-0"
                                                            />
                                                        </div>
                                                        <p className="text-[9px] text-center font-bold text-muted-foreground uppercase">km/h</p>
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center bg-background border border-muted rounded-lg px-2 shadow-sm focus-within:ring-1 focus-within:ring-primary/30 transition-all">
                                                            <Input 
                                                                type="number" 
                                                                value={stage.hr} 
                                                                onChange={(e) => handleUpdateStage(index, 'hr', e.target.value)}
                                                                className="h-10 border-none bg-transparent p-0 text-center font-bold text-base focus-visible:ring-0"
                                                            />
                                                        </div>
                                                        <p className="text-[9px] text-center font-bold text-muted-foreground uppercase">bpm</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {conconiStages.length === 0 && (
                                        <div className="py-12 text-center border-2 border-dashed border-muted rounded-2xl bg-muted/5">
                                            <p className="text-muted-foreground font-medium italic">Nenhum estágio registrado. Clique em adicionar para começar.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                {protocol === 'conconi' && conconiStages.length > 1 && (
                                    <Card className="shadow-lg border-primary/10 overflow-hidden">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg font-bold">Análise Visual</CardTitle>
                                            <p className="text-[10px] uppercase font-black text-primary tracking-widest flex items-center gap-2">
                                                <Activity className="size-3" /> Curva de Frequência Cardíaca
                                            </p>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <div className="h-[300px] w-full bg-slate-900/5 rounded-2xl p-4 border shadow-inner">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={conconiStages} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                                        <XAxis 
                                                            dataKey="velocity" 
                                                            type="number" 
                                                            domain={['dataMin', 'dataMax']} 
                                                            label={{ value: 'Velocidade (km/h)', position: 'bottom', offset: 0, fontSize: 10, fontWeight: 'bold' }}
                                                            tick={{ fontSize: 10 }}
                                                        />
                                                        <YAxis 
                                                            label={{ value: 'FC (bpm)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fontWeight: 'bold' }}
                                                            tick={{ fontSize: 10 }}
                                                        />
                                                        <Tooltip 
                                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                            formatter={(value: any) => [`${value} bpm`, 'FC']}
                                                            labelFormatter={(label) => `${label} km/h`}
                                                        />
                                                        <Line 
                                                            type="monotone" 
                                                            dataKey="hr" 
                                                            stroke="#01baba" 
                                                            strokeWidth={4} 
                                                            dot={{ r: 6, fill: '#fff', stroke: '#01baba', strokeWidth: 3 }} 
                                                            activeDot={{ r: 10 }} 
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>

                                            {testResults?.conconiThreshold && (
                                                <div className="mt-6 p-5 bg-slate-900 text-white rounded-2xl flex items-center gap-5 shadow-xl border-l-8 border-primary">
                                                    <div className="h-12 w-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-lg">
                                                        <TrendingUp size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase font-black text-primary tracking-widest mb-1">Limiar Anaeróbico Identificado</p>
                                                        <div className="text-2xl font-black flex items-baseline gap-2">
                                                            {testResults.conconiThreshold.velocity} <span className="text-xs opacity-60">km/h</span> 
                                                            <span className="text-primary font-bold text-sm">({velocityToPace(testResults.conconiThreshold.velocity)})</span> 
                                                            <span className="text-white/40 font-normal">@</span> 
                                                            {testResults.conconiThreshold.hr} <span className="text-xs opacity-60">bpm</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                <Card className="shadow-lg border-primary/5">
                                    <CardHeader>
                                        <CardTitle>Zonas de Treinamento (Karvonen)</CardTitle>
                                        <CardDescription>Cálculo: (FC Reserva × intensidade) + FC Repouso</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="hover:bg-transparent bg-muted/30">
                                                    <TableHead className="text-[10px] h-10 font-black">ZONA</TableHead>
                                                    <TableHead className="text-[10px] h-10 font-black">INTENSIDADE</TableHead>
                                                    <TableHead className="text-[10px] h-10 font-black">INTERVALO (BPM)</TableHead>
                                                    <TableHead className="text-[10px] h-10 font-black">OBJETIVO</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {testResults?.zones.map((zone, idx) => (
                                                    <TableRow key={zone.zone} className="hover:bg-muted/10 h-14 border-b last:border-0">
                                                        <TableCell className="py-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: zone.color }} />
                                                                <span className="text-xs font-black">{zone.zone}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-2">
                                                            <span className="text-[10px] font-bold bg-muted px-2 py-1 rounded">
                                                                {(zoneConfigs[idx]?.hrPerc[0] * 100).toFixed(0)}-{(zoneConfigs[idx]?.hrPerc[1] * 100).toFixed(0)}%
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-sm font-black py-2 text-primary">
                                                            {zone.minHR} - {zone.maxHR} <span className="text-[9px] opacity-70">bpm</span>
                                                        </TableCell>
                                                        <TableCell className="py-2">
                                                            <div className="flex flex-col">
                                                                <p className="text-xs font-bold leading-none">{zone.description}</p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                    <CardFooter className="pt-4 border-t flex justify-between items-center">
                                         <p className="text-[10px] text-muted-foreground italic font-medium">Karvonen + Metodologia Alpha</p>
                                         <Dialog open={isZoneDialogOpen} onOpenChange={setIsZoneDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 text-primary hover:text-primary hover:bg-primary/5">
                                                    <Settings2 className="mr-2 h-3.5 w-3.5" /> Ajustar Percentuais
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
                                                <DialogHeader>
                                                    <DialogTitle>Configurar Metodologia de Zonas</DialogTitle>
                                                    <DialogDescription>Personalize as zonas.</DialogDescription>
                                                </DialogHeader>
                                                <ScrollArea className="h-[50vh] pr-4">
                                                    <div className="space-y-6">
                                                        {zoneConfigs.map((zone, idx) => (
                                                            <div key={idx} className="p-4 border rounded-xl bg-muted/10 relative group">
                                                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleRemoveZone(idx)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <div className="space-y-2">
                                                                        <Label className="text-[10px] font-bold uppercase">Zona</Label>
                                                                        <Input value={zone.zone} onChange={(e) => handleUpdateZone(idx, { zone: e.target.value })} className="h-9 font-bold" />
                                                                    </div>
                                                                    <div className="md:col-span-2 space-y-2">
                                                                        <Label className="text-[10px] font-bold uppercase">Descrição</Label>
                                                                        <Input value={zone.desc} onChange={(e) => handleUpdateZone(idx, { desc: e.target.value })} className="h-9" />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-[10px] font-bold uppercase">% FC Reserva</Label>
                                                                        <div className="flex items-center gap-2">
                                                                            <Input type="number" step="0.01" value={zone.hrPerc[0]} onChange={(e) => handleUpdateZone(idx, { hrPerc: [parseFloat(e.target.value), zone.hrPerc[1]] })} className="h-9" />
                                                                            <Input type="number" step="0.01" value={zone.hrPerc[1]} onChange={(e) => handleUpdateZone(idx, { hrPerc: [zone.hrPerc[0], parseFloat(e.target.value)] })} className="h-9" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={handleAddZone}><Plus className="mr-2 h-4 w-4" /> Nova Zona</Button>
                                                    <Button onClick={() => setIsZoneDialogOpen(false)}><Check className="mr-2 h-4 w-4" /> Aplicar</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                         </Dialog>
                                    </CardFooter>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card className="bg-primary text-primary-foreground shadow-2xl overflow-hidden relative border-none">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Activity size={120} />
                                    </div>
                                    <CardHeader className="pb-2 relative z-10">
                                        <CardTitle className="text-[10px] uppercase font-black tracking-widest opacity-80">VO2 Máximo Estimado</CardTitle>
                                    </CardHeader>
                                    <CardContent className="relative z-10">
                                        <div className="text-6xl font-black">{testResults?.vo2 || '0.0'}</div>
                                        <p className="text-xs font-bold mt-1">ml/kg/min</p>
                                        <div className="mt-6 px-4 py-1.5 bg-white/20 rounded-full inline-flex items-center gap-2 text-xs font-black uppercase shadow-inner">
                                            <Target size={14} /> Classe: {testResults?.classification}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-lg border-primary/5">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-black uppercase">{protocol === 'cycling_power' ? 'Potência' : 'Aeróbico Máximo'}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-end border-b pb-4">
                                            {protocol === 'cycling_power' ? (
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">Carga Máxima</p>
                                                    <p className="text-3xl font-black text-primary">{powerWatts || '--'} <span className="text-xs text-muted-foreground uppercase">Watts</span></p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">vAM</p>
                                                        <p className="text-3xl font-black text-primary">{testResults?.vAM?.toFixed(1) || '--'} <span className="text-xs text-muted-foreground uppercase">km/h</span></p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">Pace Máx</p>
                                                        <p className="text-2xl font-black">{testResults ? velocityToPace(testResults.vAM) : '--:--'}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-lg border-primary/5">
                                    <CardHeader className="pb-4 border-b">
                                        <CardTitle className="text-xs font-black uppercase text-primary">Zonas (Pace)</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableBody>
                                                {testResults?.zones.map((zone) => (
                                                    <TableRow key={`pace-${zone.zone}`} className="hover:bg-muted/5 h-10 border-b last:border-0">
                                                        <TableCell className="py-1 font-bold text-[10px] text-muted-foreground">{zone.zone}</TableCell>
                                                        <TableCell className="py-1 text-right font-black text-xs">
                                                            {protocol === 'cycling_power' ? zone.minPace : `${zone.maxPace}-${zone.minPace} min/km`}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="fixed -left-[9999px] -top-[9999px] w-[800px] bg-white">
                {client && testResults && (
                    <VO2Report 
                        ref={reportRef}
                        client={client}
                        protocol={protocol}
                        results={testResults}
                        hrMax={effectiveFCMax}
                        hrRest={parseInt(hrRest) || 60}
                        bloodPressure={`${pas}/${pad}`}
                        bpClassification={bpClass}
                        stages={conconiStages}
                        powerWatts={parseFloat(powerWatts)}
                    />
                )}
            </div>
        </div>
    );
}
