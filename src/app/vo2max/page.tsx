
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wind, Activity, Timer, Calculator, Plus, Save, Download, Trash2, TrendingUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEvaluationContext } from '@/context/EvaluationContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
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
    const { clients, selectedClientId, setSelectedClientId, allEvaluations, setAllEvaluations } = useEvaluationContext();
    const { toast } = useToast();
    const reportRef = useRef<HTMLDivElement>(null);

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

    const totalSeconds = useMemo(() => {
        return (parseInt(timeMinutes) || 0) * 60 + (parseInt(timeSeconds) || 0);
    }, [timeMinutes, timeSeconds]);

    const testResults = useMemo(() => {
        if (!client) return null;

        const data = {
            protocol,
            date: new Date().toISOString(),
            weight: 70, // Fallback
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
        
        // Estimar VAM (Velocidade Aeróbica Máxima)
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

    const handleSave = () => {
        toast({ title: 'Salvo!', description: 'Os dados da avaliação de VO2max foram registrados.' });
    };

    const handleExportPdf = async () => {
        const reportElement = reportRef.current;
        if (!reportElement || !client) return;

        toast({ title: 'Gerando PDF...', description: 'Aguarde um instante.' });
        
        const canvas = await html2canvas(reportElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`vo2max_${client.name.replace(/\s+/g, '_')}.pdf`);
        toast({ title: 'PDF Exportado!' });
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <header className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard"><Button variant="outline" size="icon"><ArrowLeft className="size-4" /></Button></Link>
                    <Wind className="size-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Avaliação VO2max</h1>
                        <p className="text-muted-foreground">Fisiologia e Performance</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Salvar</Button>
                    <Button onClick={handleExportPdf} variant="outline"><Download className="mr-2 h-4 w-4" /> PDF</Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuração do Teste */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuração do Protocolo</CardTitle>
                            <CardDescription>Selecione o teste realizado e insira os dados de campo.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Atleta</Label>
                                    <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Protocolo de Teste</Label>
                                    <Select value={protocol} onValueChange={(v) => setProtocol(v as VO2Protocol)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase">FC Máxima (bpm)</Label>
                                    <Input type="number" value={hrMax} onChange={(e) => setHrMax(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase">FC Repouso (bpm)</Label>
                                    <Input type="number" value={hrRest} onChange={(e) => setHrRest(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase">Idade</Label>
                                    <div className="h-10 flex items-center px-3 border rounded-md bg-background/50 font-bold">{client?.age || '--'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase">Sexo</Label>
                                    <div className="h-10 flex items-center px-3 border rounded-md bg-background/50 font-bold">{client?.gender || '--'}</div>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                {protocol === 'cooper' && (
                                    <div className="space-y-2 max-w-xs">
                                        <Label>Distância Total Percorrida (metros)</Label>
                                        <div className="relative">
                                            <Input type="number" placeholder="Ex: 2800" value={distance} onChange={(e) => setDistance(e.target.value)} className="pr-12" />
                                            <span className="absolute right-3 top-2.5 text-muted-foreground text-sm font-bold">m</span>
                                        </div>
                                    </div>
                                )}

                                {(protocol === 'three_km' || protocol === 'five_km' || protocol === 'balke') && (
                                    <div className="space-y-4">
                                        <Label>Tempo Total de Execução</Label>
                                        <div className="flex items-center gap-3">
                                            <div className="space-y-1">
                                                <Input type="number" placeholder="Min" value={timeMinutes} onChange={(e) => setTimeMinutes(e.target.value)} />
                                                <p className="text-[10px] text-center text-muted-foreground uppercase">Minutos</p>
                                            </div>
                                            <span className="mb-4 font-bold">:</span>
                                            <div className="space-y-1">
                                                <Input type="number" placeholder="Seg" value={timeSeconds} onChange={(e) => setTimeSeconds(e.target.value)} />
                                                <p className="text-[10px] text-center text-muted-foreground uppercase">Segundos</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {protocol === 'step_test' && (
                                    <div className="space-y-2 max-w-xs">
                                        <Label>FC de Recuperação (após 1 min)</Label>
                                        <Input type="number" placeholder="bpm" value={recoveryHR} onChange={(e) => setRecoveryHR(e.target.value)} />
                                    </div>
                                )}

                                {protocol === 'conconi' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Estágios do Teste (Velocidade x FC)</Label>
                                            <Button size="sm" variant="outline" onClick={handleAddStage}><Plus className="mr-2 h-4" /> Adicionar Estágio</Button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {conconiStages.map((stage, idx) => (
                                                <div key={idx} className="flex items-center gap-2 p-2 border rounded-md bg-muted/20 relative group">
                                                    <div className="w-full space-y-1">
                                                        <p className="text-[10px] font-bold text-primary uppercase">Estágio {idx + 1}</p>
                                                        <div className="flex gap-2">
                                                            <div className="flex-1">
                                                                <Input type="number" value={stage.velocity} onChange={(e) => handleUpdateStage(idx, 'velocity', e.target.value)} step="0.5" bs-size="sm" />
                                                                <p className="text-[9px] text-center text-muted-foreground">km/h</p>
                                                            </div>
                                                            <div className="flex-1">
                                                                <Input type="number" value={stage.hr} onChange={(e) => handleUpdateStage(idx, 'hr', e.target.value)} />
                                                                <p className="text-[9px] text-center text-muted-foreground">bpm</p>
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

                    {/* Visualização de Gráficos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Análise Visual</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {protocol === 'conconi' && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase text-primary tracking-widest">Curva de Frequência Cardíaca (Conconi)</h3>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer>
                                            <LineChart data={conconiStages}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="velocity" label={{ value: 'Velocidade (km/h)', position: 'insideBottom', offset: -5 }} />
                                                <YAxis domain={['auto', 'auto']} label={{ value: 'FC (bpm)', angle: -90, position: 'insideLeft' }} />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="hr" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 6, fill: 'hsl(var(--primary))' }} activeDot={{ r: 8 }} />
                                                {testResults?.conconiThreshold && (
                                                    <Tooltip content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className="bg-background p-2 border rounded shadow-lg text-xs">
                                                                    <p className="font-bold">Vel: {payload[0].payload.velocity} km/h</p>
                                                                    <p className="font-bold text-primary">FC: {payload[0].payload.hr} bpm</p>
                                                                    {payload[0].payload.velocity === testResults.conconiThreshold?.velocity && (
                                                                        <p className="text-destructive font-bold uppercase mt-1">Limiar Anaeróbico Detetado!</p>
                                                                    )}
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }} />
                                                )}
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    {testResults?.conconiThreshold && (
                                        <div className="p-3 bg-primary/10 border border-primary/20 rounded-md flex items-center gap-3">
                                            <TrendingUp className="text-primary" />
                                            <p className="text-sm">
                                                <span className="font-bold">Ponto de Deflexão detetado:</span> {testResults.conconiThreshold.velocity} km/h @ {testResults.conconiThreshold.hr} bpm.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase text-primary tracking-widest">Distribuição de Intensidade por Zona</h3>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer>
                                        <BarChart data={testResults?.zones || []}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="zone" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="maxHR" radius={[4, 4, 0, 0]}>
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
                    <Card className="bg-primary text-primary-foreground">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs uppercase tracking-widest opacity-80">VO2 Máximo Estimado</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-5xl font-black">{testResults?.vo2 || '0.0'}</div>
                            <p className="text-xs font-bold mt-1">ml/kg/min</p>
                            <div className="mt-4 px-3 py-1 bg-white/20 rounded-full inline-block text-sm font-bold uppercase">
                                Classificação: {testResults?.classification}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold uppercase">Capacidade Aeróbica</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-end border-b pb-2">
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">vAM (Vel. Aeróbica Máx.)</p>
                                    <p className="text-xl font-black">{testResults?.vAM?.toFixed(1) || '--'} <span className="text-xs">km/h</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Pace Máximo</p>
                                    <p className="text-lg font-bold">{testResults ? velocityToPace(testResults.vAM) : '--:--'}</p>
                                </div>
                            </div>
                            <div className="p-3 bg-muted/20 rounded-md text-[11px] leading-relaxed">
                                <Info className="size-3 inline-block mr-1 text-primary" />
                                A vAM é a menor velocidade na qual o consumo máximo de oxigênio (VO2max) é atingido. Essencial para prescrever treinos de intervalo.
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-sm font-bold uppercase">Zonas de Treinamento</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent bg-muted/30">
                                        <TableHead className="text-[10px] h-8">ZONA</TableHead>
                                        <TableHead className="text-[10px] h-8">FC (bpm)</TableHead>
                                        <TableHead className="text-[10px] h-8 text-right">PACE (min/km)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {testResults?.zones.map((zone) => (
                                        <TableRow key={zone.zone} className="hover:bg-muted/10 h-12">
                                            <TableCell className="py-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color }} />
                                                    <div>
                                                        <p className="text-xs font-black leading-none">{zone.zone}</p>
                                                        <p className="text-[9px] text-muted-foreground">{zone.description}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-mono py-2">{zone.minHR}-{zone.maxHR}</TableCell>
                                            <TableCell className="text-xs font-mono py-2 text-right">{zone.maxPace}-{zone.minPace}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter className="pt-4 flex flex-col gap-2">
                             <p className="text-[10px] text-muted-foreground italic text-center w-full">
                                Zonas calculadas pelo método de Karvonen (FC Reserva) e percentuais de vAM.
                             </p>
                        </CardFooter>
                    </Card>
                </div>
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
