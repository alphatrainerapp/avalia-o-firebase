'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wind, Activity, Timer, Calculator, Plus, Save, Download, Trash2, TrendingUp, Info, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEvaluationContext } from '@/context/EvaluationContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { 
  type VO2Protocol, 
  type VO2Stage, 
  calculateVO2, 
  getVO2Classification, 
  calculateTrainingZones, 
  detectThresholdConconi, 
  velocityToPace 
} from '@/lib/vo2-logic';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell } from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import VO2Report from '@/components/VO2Report';

export default function VO2MaxPage() {
    const { clients, selectedClientId, setSelectedClientId, allEvaluations, setAllEvaluations, addEvaluation } = useEvaluationContext();
    const { toast } = useToast();
    const reportRef = useRef<HTMLDivElement>(null);

    // Estado de Seleção e Comparação
    const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);
    const [isCompareMode, setCompareMode] = useState(false);
    const [selectedEvalIdsForCompare, setSelectedEvalIdsForCompare] = useState<string[]>([]);

    // Estados do Formulário (Sincronizados com a avaliação selecionada)
    const [protocol, setProtocol] = useState<VO2Protocol>('cooper');
    const [distance, setDistance] = useState<string>('');
    const [timeMinutes, setTimeMinutes] = useState<string>('');
    const [timeSeconds, setTimeSeconds] = useState<string>('');
    const [hrMax, setHrMax] = useState<string>('190');
    const [hrRest, setHrRest] = useState<string>('60');
    const [recoveryHR, setRecoveryHR] = useState<string>('');
    const [conconiStages, setConconiStages] = useState<VO2Stage[]>([
        { velocity: 8, hr: 120 },
        { velocity: 9, hr: 132 },
        { velocity: 10, hr: 145 },
        { velocity: 11, hr: 158 },
        { velocity: 12, hr: 168 },
        { velocity: 13, hr: 175 },
        { velocity: 14, hr: 180 },
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

    const comparedEvaluations = useMemo(() => {
        return clientEvaluations
            .filter(e => selectedEvalIdsForCompare.includes(e.id))
            .sort((a,b) => new Date(a.date.replace(/-/g, '/')).getTime() - new Date(b.date.replace(/-/g, '/')).getTime());
    }, [selectedEvalIdsForCompare, clientEvaluations]);

    // Carregar dados da avaliação selecionada
    useEffect(() => {
        if (evaluation?.vo2MaxData) {
            const data = evaluation.vo2MaxData;
            setProtocol(data.protocol as VO2Protocol || 'cooper');
            setHrMax(data.hrMax?.toString() || '190');
            setHrRest(data.hrRest?.toString() || '60');
            setDistance(data.distance?.toString() || '');
            setRecoveryHR(data.recoveryHR?.toString() || '');
            if (data.totalTimeSeconds) {
                setTimeMinutes(Math.floor(data.totalTimeSeconds / 60).toString());
                setTimeSeconds((data.totalTimeSeconds % 60).toString());
            } else {
                setTimeMinutes('');
                setTimeSeconds('');
            }
            if (data.stages) setConconiStages(data.stages);
        } else {
            // Reset se não houver dados
            setDistance('');
            setTimeMinutes('');
            setTimeSeconds('');
            setRecoveryHR('');
        }
    }, [evaluation]);

    const totalSeconds = useMemo(() => {
        return (parseInt(timeMinutes) || 0) * 60 + (parseInt(timeSeconds) || 0);
    }, [timeMinutes, timeSeconds]);

    const testResults = useMemo(() => {
        if (!client) return null;

        const data = {
            protocol,
            date: new Date().toISOString(),
            weight: 70, 
            age: client.age,
            gender: client.gender,
            hrMax: parseInt(hrMax) || 190,
            hrRest: parseInt(hrRest) || 60,
            distance: parseFloat(distance) || 0,
            totalTimeSeconds: totalSeconds,
            stages: conconiStages,
            recoveryHR: parseFloat(recoveryHR) || 0
        };

        const vo2 = calculateVO2(data);
        const classification = getVO2Classification(vo2, client.age, client.gender);
        
        let vAM = 0;
        if (protocol === 'cooper' && data.distance) vAM = (data.distance / 12) * 60 / 1000;
        else if (protocol === 'conconi') vAM = Math.max(...conconiStages.map(s => s.velocity));
        else if (totalSeconds > 0) {
            const dist = protocol === 'five_km' ? 5 : (protocol === 'three_km' ? 3 : 0);
            if (dist > 0) vAM = (dist / (totalSeconds / 3600));
        }

        const zones = calculateTrainingZones(vo2, data.hrMax, data.hrRest, vAM);
        const conconiThreshold = protocol === 'conconi' ? detectThresholdConconi(conconiStages) : null;

        return { vo2, classification, zones, conconiThreshold, vAM };
    }, [client, protocol, distance, totalSeconds, conconiStages, hrMax, hrRest, recoveryHR]);

    const handleNewEvaluation = () => {
        if (client) {
            const newEval = addEvaluation(client.id);
            setSelectedEvaluationId(newEval.id);
            setCompareMode(false);
            setSelectedEvalIdsForCompare([]);
            toast({ title: "Nova Avaliação", description: "Iniciando registro de VO2max para hoje." });
        }
    };

    const handleSave = () => {
        if (!selectedEvaluationId && !evaluation) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Selecione ou crie uma avaliação primeiro.' });
            return;
        }

        const currentId = selectedEvaluationId || evaluation?.id;

        const updatedData = {
            protocol,
            vo2: testResults?.vo2,
            vAM: testResults?.vAM,
            classification: testResults?.classification,
            hrMax: parseInt(hrMax),
            hrRest: parseInt(hrRest),
            distance: parseFloat(distance),
            totalTimeSeconds: totalSeconds,
            recoveryHR: parseFloat(recoveryHR),
            stages: conconiStages
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
                return [...prev].sort((a,b) => {
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
        setConconiStages([...conconiStages, { velocity: lastStage.velocity + 0.5, hr: lastStage.hr + 5 }]);
    };

    const handleUpdateStage = (index: number, field: keyof VO2Stage, value: string) => {
        const newStages = [...conconiStages];
        newStages[index] = { ...newStages[index], [field]: parseFloat(value) || 0 };
        setConconiStages(newStages);
    };

    const handleRemoveStage = (index: number) => {
        setConconiStages(conconiStages.filter((_, i) => i !== index));
    };

    const EvalCard = ({ ev, index }: { ev: any; index: number }) => {
        const isSelected = selectedEvaluationId === ev.id && !isCompareMode;
        const isSelectedForCompare = selectedEvalIdsForCompare.includes(ev.id);
        const vo2 = ev.vo2MaxData?.vo2;

        return (
            <Card 
                className={cn(
                    "shrink-0 w-40 text-center cursor-pointer transition-all shadow-md rounded-2xl",
                    isCompareMode 
                        ? isSelectedForCompare ? 'bg-primary text-primary-foreground border-transparent scale-105' : 'bg-card'
                        : isSelected ? 'ring-2 ring-primary border-transparent' : 'bg-card',
                    !isCompareMode && 'hover:bg-accent'
                )}
                onClick={() => isCompareMode ? handleCompareSelection(ev.id) : setSelectedEvaluationId(ev.id)}
            >
                <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-xs font-normal opacity-70">
                        {new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-black">{vo2 ? vo2.toFixed(1) : '--'}</p>
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
                    <Button onClick={handleSave} className="shadow-lg"><Save className="mr-2 h-4 w-4" /> Salvar</Button>
                    <Button onClick={handleExportPdf} variant="outline" className="shadow-sm"><Download className="mr-2 h-4 w-4" /> PDF</Button>
                </div>
            </header>

            <div className="space-y-6">
                {/* Cabeçalho de Seleção de Avaliações */}
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
                                <Button onClick={handleNewEvaluation} size="sm" variant="outline" className="bg-background">
                                    <Plus className="mr-2 h-4 w-4" /> Nova Avaliação
                                </Button>
                            </div>
                        </div>
                        {isCompareMode && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {comparedEvaluations.map(ev => (
                                    <div key={ev.id} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                        {new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR')}
                                        <X className="size-3 cursor-pointer hover:opacity-70" onClick={() => handleCompareSelection(ev.id)} />
                                    </div>
                                ))}
                                {selectedEvalIdsForCompare.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic">Selecione até 4 avaliações nos cards abaixo...</p>
                                )}
                            </div>
                        )}
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
                                        { label: 'Classificação', key: 'classification' },
                                        { label: 'Protocolo', key: 'protocol' }
                                    ].map((row) => (
                                        <TableRow key={row.label} className="hover:bg-muted/10 h-12">
                                            <TableCell className="font-bold text-xs text-muted-foreground">{row.label}</TableCell>
                                            {comparedEvaluations.map(ev => {
                                                const data = ev.vo2MaxData;
                                                let value = data ? (data as any)[row.key] : '--';
                                                
                                                if (row.key === 'pace' && data?.vAM) value = velocityToPace(data.vAM);
                                                if (typeof value === 'number') value = value.toFixed(1);
                                                if (row.key === 'protocol') value = value === 'cooper' ? 'Cooper' : value === 'conconi' ? 'Conconi' : value || '--';

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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Configuração do Teste */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="shadow-lg border-primary/10">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Dados de Campo</CardTitle>
                                            <CardDescription>Insira os resultados do teste realizado em {evaluation ? new Date(evaluation.date.replace(/-/g, '/')).toLocaleDateString('pt-BR') : 'hoje'}.</CardDescription>
                                        </div>
                                        <div className="p-2 bg-primary/10 rounded-full">
                                            <Wind className="text-primary size-6" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Protocolo de Teste</Label>
                                            <Select value={protocol} onValueChange={(v) => setProtocol(v as VO2Protocol)}>
                                                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cooper">Teste de Cooper (12 min)</SelectItem>
                                                    <SelectItem value="three_km">Teste de 3km</SelectItem>
                                                    <SelectItem value="five_km">Teste de 5km</SelectItem>
                                                    <SelectItem value="balke">Teste de Balke (Tempo)</SelectItem>
                                                    <SelectItem value="conconi">Teste de Conconi (Progressivo)</SelectItem>
                                                    <SelectItem value="step_test">Step Test (Banco)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-xs uppercase font-bold text-muted-foreground">FC Máxima (bpm)</Label>
                                                <Input type="number" className="h-11 font-black" value={hrMax} onChange={(e) => setHrMax(e.target.value)} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs uppercase font-bold text-muted-foreground">FC Repouso (bpm)</Label>
                                                <Input type="number" className="h-11 font-black" value={hrRest} onChange={(e) => setHrRest(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t space-y-4">
                                        {protocol === 'cooper' && (
                                            <div className="space-y-2 max-w-xs">
                                                <Label className="font-bold">Distância Total Percorrida (metros)</Label>
                                                <div className="relative">
                                                    <Input type="number" placeholder="Ex: 2800" value={distance} onChange={(e) => setDistance(e.target.value)} className="h-12 text-xl font-black pr-12" />
                                                    <span className="absolute right-4 top-3 text-muted-foreground font-black">m</span>
                                                </div>
                                            </div>
                                        )}

                                        {(protocol === 'three_km' || protocol === 'five_km' || protocol === 'balke') && (
                                            <div className="space-y-4">
                                                <Label className="font-bold">Tempo Total de Execução</Label>
                                                <div className="flex items-center gap-3">
                                                    <div className="space-y-1 w-24">
                                                        <Input type="number" placeholder="Min" value={timeMinutes} onChange={(e) => setTimeMinutes(e.target.value)} className="h-12 text-center text-xl font-black" />
                                                        <p className="text-[10px] text-center text-muted-foreground uppercase font-bold">Minutos</p>
                                                    </div>
                                                    <span className="mb-4 font-black text-2xl">:</span>
                                                    <div className="space-y-1 w-24">
                                                        <Input type="number" placeholder="Seg" value={timeSeconds} onChange={(e) => setTimeSeconds(e.target.value)} className="h-12 text-center text-xl font-black" />
                                                        <p className="text-[10px] text-center text-muted-foreground uppercase font-bold">Segundos</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {protocol === 'step_test' && (
                                            <div className="space-y-2 max-w-xs">
                                                <Label className="font-bold">FC de Recuperação (após 1 min)</Label>
                                                <Input type="number" placeholder="bpm" value={recoveryHR} onChange={(e) => setRecoveryHR(e.target.value)} className="h-12 text-xl font-black" />
                                            </div>
                                        )}

                                        {protocol === 'conconi' && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label className="font-bold">Estágios do Teste (Velocidade x FC)</Label>
                                                    <Button size="sm" variant="outline" onClick={handleAddStage} className="h-8"><Plus className="mr-2 h-4" /> Adicionar Estágio</Button>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                    {conconiStages.map((stage, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 p-2 border rounded-xl bg-muted/20 relative group transition-colors hover:bg-muted/40">
                                                            <div className="w-full space-y-1">
                                                                <p className="text-[10px] font-black text-primary uppercase">Estágio {idx + 1}</p>
                                                                <div className="flex gap-2">
                                                                    <div className="flex-1">
                                                                        <Input type="number" value={stage.velocity} onChange={(e) => handleUpdateStage(idx, 'velocity', e.target.value)} step="0.5" className="h-9 font-bold" />
                                                                        <p className="text-[9px] text-center text-muted-foreground font-bold">km/h</p>
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <Input type="number" value={stage.hr} onChange={(e) => handleUpdateStage(idx, 'hr', e.target.value)} className="h-9 font-bold" />
                                                                        <p className="text-[9px] text-center text-muted-foreground font-bold">bpm</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveStage(idx)}>
                                                                <Trash2 className="h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-primary/5">
                                <CardHeader>
                                    <CardTitle>Análise Visual</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    {protocol === 'conconi' && (
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-black uppercase text-primary tracking-widest border-l-4 border-primary pl-3">Curva de Frequência Cardíaca</h3>
                                            <div className="h-[300px] w-full">
                                                <ResponsiveContainer>
                                                    <LineChart data={conconiStages}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                                                        <XAxis dataKey="velocity" stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: 'Velocidade (km/h)', position: 'insideBottom', offset: -5 }} />
                                                        <YAxis domain={['auto', 'auto']} stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: 'FC (bpm)', angle: -90, position: 'insideLeft' }} />
                                                        <Tooltip />
                                                        <Line type="monotone" dataKey="hr" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ r: 6, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 8 }} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                            {testResults?.conconiThreshold && (
                                                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-4 shadow-sm">
                                                    <div className="p-2 bg-primary rounded-full">
                                                        <TrendingUp className="text-white size-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs uppercase font-black text-primary leading-none mb-1">Limiar Anaeróbico Identificado</p>
                                                        <p className="text-lg font-black">{testResults.conconiThreshold.velocity} <span className="text-xs">km/h</span> @ {testResults.conconiThreshold.hr} <span className="text-xs">bpm</span></p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black uppercase text-primary tracking-widest border-l-4 border-primary pl-3">Intensidade por Zona</h3>
                                        <div className="h-[250px] w-full">
                                            <ResponsiveContainer>
                                                <BarChart data={testResults?.zones || []}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                                                    <XAxis dataKey="zone" stroke="hsl(var(--muted-foreground))" />
                                                    <YAxis stroke="hsl(var(--muted-foreground))" />
                                                    <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.2)' }} />
                                                    <Bar dataKey="maxHR" radius={[6, 6, 0, 0]}>
                                                        {(testResults?.zones || []).map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Resultados e Zonas */}
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
                                        <Target size={14} /> Classificação: {testResults?.classification}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-primary/5">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-black uppercase">Aeróbico Máximo</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-end border-b pb-4">
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">vAM (Velocidade)</p>
                                            <p className="text-3xl font-black text-primary">{testResults?.vAM?.toFixed(1) || '--'} <span className="text-xs text-muted-foreground uppercase">km/h</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">Pace Máximo</p>
                                            <p className="text-2xl font-black">{testResults ? velocityToPace(testResults.vAM) : '--:--'}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-muted/20 rounded-xl text-[11px] leading-relaxed border-l-2 border-primary italic">
                                        <Info className="size-4 inline-block mr-2 text-primary" />
                                        A vAM é a menor velocidade na qual o consumo máximo de oxigênio é atingido. Essencial para treinos intervalados.
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-primary/5">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-sm font-black uppercase">Zonas de Treinamento</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent bg-muted/30">
                                                <TableHead className="text-[10px] h-8 font-black">ZONA</TableHead>
                                                <TableHead className="text-[10px] h-8 font-black">FC (bpm)</TableHead>
                                                <TableHead className="text-[10px] h-8 text-right font-black">PACE</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {testResults?.zones.map((zone) => (
                                                <TableRow key={zone.zone} className="hover:bg-muted/10 h-14 border-b last:border-0">
                                                    <TableCell className="py-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: zone.color }} />
                                                            <div>
                                                                <p className="text-xs font-black leading-none">{zone.zone}</p>
                                                                <p className="text-[9px] text-muted-foreground font-bold">{zone.description}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs font-mono font-black py-2">{zone.minHR}-{zone.maxHR}</TableCell>
                                                    <TableCell className="text-xs font-mono font-black py-2 text-right text-primary">{zone.maxPace}-{zone.minPace}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                                <CardFooter className="pt-4 border-t">
                                     <p className="text-[9px] text-muted-foreground italic text-center w-full font-bold uppercase tracking-tighter">
                                        Karvonen (FC Reserva) + % vAM
                                     </p>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                )}
            </div>

            {/* Relatório Oculto para PDF */}
            <div className="fixed -left-[9999px] -top-[9999px] w-[800px] bg-white">
                {client && testResults && (
                    <VO2Report 
                        ref={reportRef}
                        client={client}
                        protocol={protocol}
                        results={testResults}
                        hrMax={parseInt(hrMax) || 190}
                        hrRest={parseInt(hrRest) || 60}
                        stages={conconiStages}
                    />
                )}
            </div>
        </div>
    );
}
