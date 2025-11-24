'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Download, Plus, Save, Activity, User, BarChart, FileText } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { clients, evaluations as allEvaluations, type Evaluation, type Client, audienceProtocols, protocolSkinfolds, type SkinfoldKeys } from '@/lib/data';
import BodyMeasurementChart from '@/components/BodyMeasurementChart';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';


export default function DashboardPage() {
    const [selectedClientId, setSelectedClientId] = useState<string>(clients[0].id);
    const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);
    const [isCompareMode, setCompareMode] = useState(false);
    const [selectedEvalIdsForCompare, setSelectedEvalIdsForCompare] = useState<string[]>([]);
    const { toast } = useToast();
    const [selectedAudience, setSelectedAudience] = useState<string>(Object.keys(audienceProtocols)[0]);
    const [availableProtocols, setAvailableProtocols] = useState<string[]>(audienceProtocols[selectedAudience]);
    const [requiredSkinfolds, setRequiredSkinfolds] = useState<SkinfoldKeys[]>([]);

    const client = useMemo(() => clients.find(c => c.id === selectedClientId), [selectedClientId]);
    const clientEvaluations = useMemo(() => allEvaluations.filter(e => e.clientId === selectedClientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [selectedClientId]);
    
    const evaluation = useMemo(() => {
        if (selectedEvaluationId) {
            return clientEvaluations.find(e => e.id === selectedEvaluationId);
        }
        return clientEvaluations[0];
    }, [clientEvaluations, selectedEvaluationId]);

    const [formState, setFormState] = useState<Partial<Evaluation & Client & any>>({});
    
    useEffect(() => {
        if (client && evaluation) {
            const initialFormState = {
                ...client,
                ...evaluation,
                clientName: client.name,
                gender: client.gender,
                protocol: evaluation.protocol || availableProtocols[0],
            };
            setFormState(initialFormState);
            
            const audience = Object.keys(audienceProtocols).find(key => audienceProtocols[key].includes(evaluation.protocol || '')) || selectedAudience;
            setSelectedAudience(audience);
            const newProtocols = audienceProtocols[audience];
            setAvailableProtocols(newProtocols);

            const protocol = initialFormState.protocol;
            let currentRequired: SkinfoldKeys[] = [];
            if (protocol.includes('Pollock 3 dobras')) {
                currentRequired = client.gender === 'Masculino' ? protocolSkinfolds['Pollock 3 dobras (M)'] : protocolSkinfolds['Pollock 3 dobras (F)'];
            } else {
                currentRequired = protocolSkinfolds[protocol as keyof typeof protocolSkinfolds] || [];
            }
            setRequiredSkinfolds(currentRequired);

        } else if (client) {
             const newFormState = {
                ...client,
                clientName: client.name,
                gender: client.gender,
                date: new Date().toISOString().split('T')[0],
                protocol: availableProtocols[0],
             };
             setFormState(newFormState);
             let currentRequired: SkinfoldKeys[] = [];
             if (newFormState.protocol.includes('Pollock 3 dobras')) {
                currentRequired = client.gender === 'Masculino' ? protocolSkinfolds['Pollock 3 dobras (M)'] : protocolSkinfolds['Pollock 3 dobras (F)'];
            } else {
                currentRequired = protocolSkinfolds[newFormState.protocol as keyof typeof protocolSkinfolds] || [];
            }
            setRequiredSkinfolds(currentRequired);
        }
    }, [client, evaluation, availableProtocols, selectedAudience]);

    useEffect(() => {
        if (!formState.protocol) return;
        let currentRequired: SkinfoldKeys[] = [];
        if (formState.protocol.includes('Pollock 3 dobras')) {
            currentRequired = formState.gender === 'Masculino' ? protocolSkinfolds['Pollock 3 dobras (M)'] : protocolSkinfolds['Pollock 3 dobras (F)'];
        } else {
            currentRequired = protocolSkinfolds[formState.protocol as keyof typeof protocolSkinfolds] || [];
        }
        setRequiredSkinfolds(currentRequired);
    }, [formState.protocol, formState.gender]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const keys = name.split('.');
        if (keys.length > 1) {
            setFormState(prev => {
                const newState = {...prev};
                let current: any = newState;
                for (let i = 0; i < keys.length - 1; i++) {
                    current[keys[i]] = current[keys[i]] || {};
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = value;
                return newState;
            });
        } else {
            setFormState(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        if (name === 'clientId') {
            setSelectedClientId(value);
            setSelectedEvaluationId(null);
            setCompareMode(false);
            setSelectedEvalIdsForCompare([]);
        } else {
             setFormState(prev => ({...prev, [name]: value}));
        }
    }

    const handleAudienceChange = (audience: string) => {
        setSelectedAudience(audience);
        const newProtocols = audienceProtocols[audience];
        setAvailableProtocols(newProtocols);
        setFormState(prev => ({ ...prev, protocol: newProtocols[0] }));
    };
    
    const calculateBMI = (weight?: number, height?: number) => {
        if (weight && height) {
            return (weight / ((height / 100) * (height / 100))).toFixed(1);
        }
        return '-';
    }

    const getBmiClassification = (bmi?: string) => {
        if (!bmi || bmi === '-') return '-';
        const bmiValue = parseFloat(bmi);
        if (bmiValue < 18.5) return 'Abaixo do peso';
        if (bmiValue < 24.9) return 'Peso normal';
        if (bmiValue < 29.9) return 'Sobrepeso';
        if (bmiValue < 34.9) return 'Obesidade Grau I';
        if (bmiValue < 39.9) return 'Obesidade Grau II';
        return 'Obesidade Grau III';
    };

    const calculateRCQ = (waist?: number, hip?: number) => {
        if (waist && hip && hip > 0) {
            return (waist / hip).toFixed(2);
        }
        return '-';
    }

    const getRcqClassification = (rcq?: string, gender?: 'Masculino' | 'Feminino') => {
        if (!rcq || rcq === '-' || !gender) return '-';
        const rcqValue = parseFloat(rcq);
        if (gender === 'Feminino') {
            if (rcqValue < 0.80) return 'Baixo Risco';
            if (rcqValue <= 0.85) return 'Risco Moderado';
            return 'Alto Risco';
        } else { // Masculino
            if (rcqValue < 0.95) return 'Baixo Risco';
            if (rcqValue <= 1.0) return 'Risco Moderado';
            return 'Alto Risco';
        }
    };

    const getAsymmetryClassification = (val1?: number, val2?: number) => {
        if (val1 === undefined || val2 === undefined || val1 <= 0 || val2 <= 0) return '-';
        const difference = Math.abs(val1 - val2);
        const maxVal = Math.max(val1, val2);
        const percentage = (difference / maxVal) * 100;
        
        if (percentage < 1.5) return 'Sem diferença';
        if (percentage <= 5) return 'Diferença';
        if (percentage <= 10) return 'Diferença grande';
        return 'Diferença severa';
    };

    const bmi = useMemo(() => calculateBMI(formState.bodyMeasurements?.weight, formState.bodyMeasurements?.height), [formState.bodyMeasurements]);
    const bmiClassification = useMemo(() => getBmiClassification(bmi), [bmi]);
    const rcq = useMemo(() => calculateRCQ(formState.perimetria?.cintura, formState.perimetria?.quadril), [formState.perimetria]);
    const rcqClassification = useMemo(() => getRcqClassification(rcq, formState.gender), [rcq, formState.gender]);
    const armAsymmetry = useMemo(() => getAsymmetryClassification(formState.perimetria?.bracoDRelaxado, formState.perimetria?.bracoERelaxado), [formState.perimetria]);
    const thighAsymmetry = useMemo(() => getAsymmetryClassification(formState.perimetria?.coxaMedialD, formState.perimetria?.coxaMedialE), [formState.perimetria]);

    const skinfoldsSum = useMemo(() => {
        if (!formState.skinFolds) return 0;
        return Object.values(formState.skinFolds).reduce((sum: number, value: any) => sum + (Number(value) || 0), 0);
    }, [formState.skinFolds]);

    const handleNewEvaluation = () => {
        setSelectedEvaluationId(null);
        if(client){
            const newDate = new Date();
            newDate.setDate(newDate.getDate() + 1);

            setFormState({
                clientName: client.name,
                gender: client.gender,
                date: newDate.toISOString().split('T')[0],
                bodyMeasurements: { weight: 0, height: client.height || 0, waistCircumference: 0, hipCircumference: 0 },
                bodyComposition: { bodyFatPercentage: 0, muscleMass: 0, boneDensity: 0 },
                protocol: availableProtocols[0],
            });
        }
        toast({ title: "Novo Formulário", description: "Preencha os dados para a nova avaliação." });
    };
    
    const handleSave = () => {
        console.log("Saving data:", formState);
        toast({ title: "Salvo!", description: "Os dados da avaliação foram salvos com sucesso." });
    }

    const handleCompareToggle = () => {
        setCompareMode(!isCompareMode);
        setSelectedEvalIdsForCompare([]);
    }

    const handleCompareSelection = (evalId: string) => {
        setSelectedEvalIdsForCompare(prev => {
            if (prev.includes(evalId)) {
                return prev.filter(id => id !== evalId);
            }
            if (prev.length < 2) {
                return [...prev, evalId];
            }
            toast({variant: 'destructive', title: 'Aviso', description: 'Você só pode comparar duas avaliações.'})
            return prev;
        });
    }

    const comparedEvaluations = useMemo(() => {
        const sorted = allEvaluations
            .filter(e => selectedEvalIdsForCompare.includes(e.id))
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return sorted;
    }, [selectedEvalIdsForCompare]);

    const skinfoldFields: { name: SkinfoldKeys; label: string }[] = [
        { name: 'subscapular', label: 'Subscapular (mm)' },
        { name: 'tricipital', label: 'Tricipital (mm)' },
        { name: 'bicipital', label: 'Bicipital (mm)' },
        { name: 'peitoral', label: 'Peitoral (mm)' },
        { name: 'axilarMedia', label: 'Axilar-média (mm)' },
        { name: 'supraIliaca', label: 'Supra-ilíaca (mm)' },
        { name: 'abdominal', label: 'Abdominal (mm)' },
        { name: 'coxa', label: 'Coxa (mm)' },
        { name: 'panturrilha', label: 'Panturrilha (mm)' },
    ];


  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
        <header className="flex flex-wrap items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
                <Activity className="size-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Avaliação Física Completa</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleSave}><Save className="mr-2" /> Salvar</Button>
                <Button variant="outline"><BarChart className="mr-2" /> Bioimpedância</Button>
                <Button variant="outline"><User className="mr-2" /> Avaliação Postural</Button>
                <Button><Download className="mr-2" /> Exportar PDF</Button>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Avaliação {evaluation ? clientEvaluations.length - clientEvaluations.indexOf(evaluation) : clientEvaluations.length + 1}</CardTitle>
                            <CardDescription>{formState.date ? new Date(formState.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : ''}</CardDescription>
                        </div>
                        <Button variant="outline" onClick={handleNewEvaluation}><Plus className="mr-2" /> Nova Avaliação</Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2">
                                <Label htmlFor="name">Nome</Label>
                                <Select value={selectedClientId} onValueChange={(value) => handleSelectChange('clientId', value)}>
                                    <SelectTrigger id="name">
                                        <SelectValue placeholder="Selecione um cliente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                               <Label htmlFor="age">Idade</Label>
                               <Input id="age" name="age" type="number" placeholder="Anos" value={formState.age || ''} onChange={handleInputChange} />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="gender">Sexo</Label>
                                <Select value={formState.gender || ''} onValueChange={(value) => handleSelectChange('gender', value)}>
                                    <SelectTrigger id="gender">
                                        <SelectValue placeholder="Selecione o sexo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Masculino">Masculino</SelectItem>
                                        <SelectItem value="Feminino">Feminino</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="height">Altura (cm)</Label>
                                <Input id="height" name="bodyMeasurements.height" type="number" placeholder="Ex: 175" value={formState.bodyMeasurements?.height || ''} onChange={(e) => setFormState(p => ({...p, bodyMeasurements: {...p.bodyMeasurements!, height: Number(e.target.value)}}))} />
                            </div>
                            <div>
                                <Label htmlFor="weight">Peso (kg)</Label>
                                <Input id="weight" name="bodyMeasurements.weight" type="number" placeholder="Ex: 70.5" value={formState.bodyMeasurements?.weight || ''} onChange={(e) => setFormState(p => ({...p, bodyMeasurements: {...p.bodyMeasurements!, weight: Number(e.target.value)}}))} />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>IMC</Label>
                                <div className="font-bold text-lg">{bmi}</div>
                            </div>
                            <div>
                                <Label>Classificação</Label>
                                <div className="font-bold text-lg">{bmiClassification}</div>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="observations">Observações</Label>
                            <Textarea id="observations" name="observations" placeholder="Notas adicionais sobre o cliente..." value={formState.observations || ''} onChange={handleInputChange} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <CardTitle>Avaliações {new Date().getFullYear()}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="compare-switch" className="text-sm">Comparar</Label>
                                <Checkbox id="compare-switch" checked={isCompareMode} onCheckedChange={() => handleCompareToggle()} />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex gap-4 overflow-x-auto pb-4">
                        {clientEvaluations.map(ev => (
                             <Card key={ev.id} className={`shrink-0 w-40 text-center cursor-pointer border-2 ${selectedEvaluationId === ev.id && !isCompareMode ? 'border-primary' : 'border-transparent'} ${selectedEvalIdsForCompare.includes(ev.id) ? 'border-primary' : ''}`} onClick={() => isCompareMode ? handleCompareSelection(ev.id) : setSelectedEvaluationId(ev.id)}>
                                <CardHeader className="p-4 relative">
                                     {isCompareMode && <Checkbox className="absolute top-2 right-2" checked={selectedEvalIdsForCompare.includes(ev.id)} onCheckedChange={() => handleCompareSelection(ev.id)} />}
                                    <CardTitle className="text-sm font-normal">{new Date(ev.date).toLocaleDateString('pt-BR', { month: 'long', timeZone: 'UTC' })}/{new Date(ev.date).getFullYear().toString().slice(-2)}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <p className="text-4xl font-bold">{ev.bodyComposition.bodyFatPercentage.toFixed(0)}<span className="text-lg">%</span></p>
                                    <p className="text-xs text-muted-foreground">Gordura</p>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Registros de Dados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="perimetria">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="perimetria">Perimetria</TabsTrigger>
                                <TabsTrigger value="dobras">Dobras Cutâneas</TabsTrigger>
                                <TabsTrigger value="diametros">Diâmetros Ósseos</TabsTrigger>
                            </TabsList>
                            <TabsContent value="perimetria" className="pt-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                    <div><Label>Ombro (cm)</Label><Input type="number" placeholder="0.0" name="perimetria.ombro" value={formState.perimetria?.ombro || ''} onChange={handleInputChange} /></div>
                                    <div><Label>Tórax (cm)</Label><Input type="number" placeholder="0.0" name="perimetria.torax" value={formState.perimetria?.torax || ''} onChange={handleInputChange} /></div>
                                    <div><Label>Cintura (cm)</Label><Input type="number" placeholder="0.0" name="perimetria.cintura" value={formState.perimetria?.cintura || ''} onChange={handleInputChange} /></div>
                                    <div><Label>Abdômen (cm)</Label><Input type="number" placeholder="0.0" name="perimetria.abdomen" value={formState.perimetria?.abdomen || ''} onChange={handleInputChange} /></div>
                                    <div><Label>Quadril (cm)</Label><Input type="number" placeholder="0.0" name="perimetria.quadril" value={formState.perimetria?.quadril || ''} onChange={handleInputChange} /></div>
                                    <div><Label>Braço D (relaxado) (cm)</Label><Input type="number" placeholder="0.0" name="perimetria.bracoDRelaxado" value={formState.perimetria?.bracoDRelaxado || ''} onChange={handleInputChange} /></div>
                                    <div><Label>Braço D (contraído) (cm)</Label><Input type="number" placeholder="0.0" name="perimetria.bracoDContraido" value={formState.perimetria?.bracoDContraido || ''} onChange={handleInputChange} /></div>
                                    <div><Label>Braço E (relaxado) (cm)</Label><Input type="number" placeholder="0.0" name="perimetria.bracoERelaxado" value={formState.perimetria?.bracoERelaxado || ''} onChange={handleInputChange} /></div>
                                    <div><Label>Braço E (contraído) (cm)</Label><Input type="number" placeholder="0.0" name="perimetria.bracoEContraido" value={formState.perimetria?.bracoEContraido || ''} onChange={handleInputChange} /></div>
                                    <div><Label>Antebraço D (cm)</Label><Input type="number" placeholder="0.0" name="perimetria.antebracoD" value={formState.perimetria?.antebracoD || ''} onChange={handleInputChange} /></div>
                                    <div><Label>Antebraço E (cm)</Label><Input type="number" placeholder="0.0" name="perimetria.antebracoE" value={formState.perimetria?.antebracoE || ''} onChange={handleInputChange} /></div>
                                    <div><Label>Coxa Proximal D (cm)</Label><Input type="number" placeholder="0.0" name="perimetria.coxaProximalD" value={formState.perimetria?.coxaProximalD || ''} onChange={handleInputChange} /></div>
                                    <div><Label>Coxa Proximal E (cm)</Label><Input type="number" placeholder="0.0" name="perimetria.coxaProximalE" value={formState.perimetria?.coxaProximalE || ''} onChange={handleInputChange} /></div>
                                    <div><Label>Coxa Medial D (cm)</Label><Input type="number" placeholder="0.0" name="perimetria.coxaMedialD" value={formState.perimetria?.coxaMedialD || ''} onChange={handleInputChange} /></div>
                                    <div><Label>Coxa Medial E (cm)</Label><Input type="number" placeholder="0.0" name="perimetria.coxaMedialE" value={formState.perimetria?.coxaMedialE || ''} onChange={handleInputChange} /></div>
                                    <div><Label>Panturrilha D (cm)</Label><Input type="number" placeholder="0.0" name="perimetria.panturrilhaD" value={formState.perimetria?.panturrilhaD || ''} onChange={handleInputChange} /></div>
                                    <div><Label>Panturrilha E (cm)</Label><Input type="number" placeholder="0.0" name="perimetria.panturrilhaE" value={formState.perimetria?.panturrilhaE || ''} onChange={handleInputChange} /></div>
                                </div>
                                <div className="mt-6 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>RCQ (Relação Cintura-Quadril)</Label>
                                            <div className="font-bold text-lg">{rcq}</div>
                                        </div>
                                        <div>
                                            <Label>Classificação de Risco</Label>
                                            <div className="font-bold text-lg">{rcqClassification}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Assimetria de Braço (Relaxado)</Label>
                                            <div className="font-bold text-lg">{armAsymmetry}</div>
                                        </div>
                                        <div>
                                            <Label>Assimetria de Coxa (Medial)</Label>
                                            <div className="font-bold text-lg">{thighAsymmetry}</div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="dobras" className="pt-4 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="publico-alvo">Público-Alvo</Label>
                                        <Select value={selectedAudience} onValueChange={handleAudienceChange}>
                                            <SelectTrigger id="publico-alvo">
                                                <SelectValue placeholder="Selecione o público" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.keys(audienceProtocols).map(audience => (
                                                    <SelectItem key={audience} value={audience}>{audience}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="protocolo">Protocolo de Avaliação</Label>
                                        <Select value={formState.protocol || ''} onValueChange={(value) => handleSelectChange('protocol', value)}>
                                            <SelectTrigger id="protocolo">
                                                <SelectValue placeholder="Selecione o protocolo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableProtocols.map(protocol => (
                                                    <SelectItem key={protocol} value={protocol}>{protocol}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                    {skinfoldFields.map(field => (
                                        <div key={field.name}>
                                            <Label>{field.label}</Label>
                                            <Input 
                                                type="number" 
                                                placeholder="0.0" 
                                                name={`skinFolds.${field.name}`} 
                                                value={formState.skinFolds?.[field.name] || ''} 
                                                onChange={handleInputChange} 
                                                className={cn(requiredSkinfolds.includes(field.name) && 'border-primary focus-visible:ring-primary')}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6">
                                    <Label>Soma das Dobras (mm)</Label>
                                    <div className="font-bold text-lg">{skinfoldsSum.toFixed(1)}</div>
                                </div>
                            </TabsContent>
                            <TabsContent value="diametros" className="pt-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                     {/* Adicione os campos para Diâmetros Ósseos aqui */}
                                    <p className="text-muted-foreground">Campos para diâmetros ósseos serão adicionados aqui.</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BodyMeasurementChart />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                         <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">GORDURA</CardTitle>
                             {isCompareMode && comparedEvaluations.length > 0 && <p className="text-sm text-muted-foreground">{new Date(comparedEvaluations[0].date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{isCompareMode && comparedEvaluations.length > 0 ? comparedEvaluations[0]?.bodyComposition.bodyFatPercentage.toFixed(1) : evaluation?.bodyComposition.bodyFatPercentage.toFixed(1) || '0.0'}%</p>
                        <p className="text-xs text-muted-foreground">{((isCompareMode && comparedEvaluations.length > 0 ? comparedEvaluations[0]?.bodyMeasurements.weight : evaluation?.bodyMeasurements.weight || 0) * (isCompareMode && comparedEvaluations.length > 0 ? comparedEvaluations[0]?.bodyComposition.bodyFatPercentage : evaluation?.bodyComposition.bodyFatPercentage || 0) / 100).toFixed(1)} kg</p>
                    </CardContent>
                     {isCompareMode && comparedEvaluations.length > 1 && (
                         <CardContent className="border-t pt-4">
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                                <span>Comparando com</span>
                                <span>{new Date(comparedEvaluations[1].date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                            </div>
                            <p className="text-2xl font-bold">{comparedEvaluations[1].bodyComposition.bodyFatPercentage.toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground">{((comparedEvaluations[1].bodyMeasurements.weight || 0) * (comparedEvaluations[1].bodyComposition.bodyFatPercentage || 0) / 100).toFixed(1)} kg</p>
                         </CardContent>
                     )}
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                         <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">MUSCULAR</CardTitle>
                             {isCompareMode && comparedEvaluations.length > 0 && <p className="text-sm text-muted-foreground">{new Date(comparedEvaluations[0].date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{isCompareMode && comparedEvaluations.length > 0 ? comparedEvaluations[0]?.bodyComposition.muscleMass.toFixed(1) : evaluation?.bodyComposition.muscleMass.toFixed(1) || '0.0'} kg</p>
                        <p className="text-xs text-muted-foreground">{(((isCompareMode && comparedEvaluations.length > 0 ? comparedEvaluations[0]?.bodyComposition.muscleMass : evaluation?.bodyComposition.muscleMass || 0) / (isCompareMode && comparedEvaluations.length > 0 ? comparedEvaluations[0]?.bodyMeasurements.weight : evaluation?.bodyMeasurements.weight || 1)) * 100).toFixed(1)}%</p>
                    </CardContent>
                      {isCompareMode && comparedEvaluations.length > 1 && (
                         <CardContent className="border-t pt-4">
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                                <span>Comparando com</span>
                                <span>{new Date(comparedEvaluations[1].date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                            </div>
                            <p className="text-2xl font-bold">{comparedEvaluations[1].bodyComposition.muscleMass.toFixed(1)} kg</p>
                            <p className="text-xs text-muted-foreground">{(((comparedEvaluations[1].bodyComposition.muscleMass || 0) / (comparedEvaluations[1].bodyMeasurements.weight || 1)) * 100).toFixed(1)}%</p>
                         </CardContent>
                     )}
                </Card>
            </div>
        </div>
        <Toaster />
    </div>
  );
}
