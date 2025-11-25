'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Download, Plus, Save, Activity, User, BarChart, FileText, X } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { clients, evaluations as initialEvaluations, type Evaluation, type Client, audienceProtocols, protocolSkinfolds, type SkinfoldKeys, type BoneDiameterKeys, perimetriaPoints, skinfoldPoints, boneDiameterPoints } from '@/lib/data';
import BodyMeasurementChart from '@/components/BodyMeasurementChart';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ComparisonTable } from '@/components/ComparisonTable';
import ComparisonCharts from '@/components/ComparisonCharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import EvaluationReport from '@/components/EvaluationReport';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function DashboardPage() {
    const [selectedClientId, setSelectedClientId] = useState<string>(clients[0].id);
    const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);
    const [isCompareMode, setCompareMode] = useState(false);
    const [selectedEvalIdsForCompare, setSelectedEvalIdsForCompare] = useState<string[]>([]);
    const { toast } = useToast();
    const [selectedAudience, setSelectedAudience] = useState<string>(Object.keys(audienceProtocols)[0]);
    const [availableProtocols, setAvailableProtocols] = useState<string[]>(audienceProtocols[selectedAudience]);
    const [requiredSkinfolds, setRequiredSkinfolds] = useState<SkinfoldKeys[]>([]);
    const [allEvaluations, setAllEvaluations] = useState<Evaluation[]>(initialEvaluations);
    const reportRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState('perimetria');


    const client = useMemo(() => clients.find(c => c.id === selectedClientId), [selectedClientId]);
    const clientEvaluations = useMemo(() => allEvaluations.filter(e => e.clientId === selectedClientId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [selectedClientId, allEvaluations]);
    
    const evaluation = useMemo(() => {
        if (selectedEvaluationId) {
            return clientEvaluations.find(e => e.id === selectedEvaluationId);
        }
        return clientEvaluations[0];
    }, [clientEvaluations, selectedEvaluationId]);

    const [formState, setFormState] = useState<Partial<Evaluation & Client & any>>({});
    
    useEffect(() => {
        const currentEval = clientEvaluations.find(e => e.id === selectedEvaluationId);
        if (client && currentEval) {
            const initialFormState = {
                ...client,
                ...currentEval,
                clientName: client.name,
                gender: client.gender,
                protocol: currentEval.protocol || availableProtocols[0],
            };
            setFormState(initialFormState);
            
            const audience = Object.keys(audienceProtocols).find(key => audienceProtocols[key].includes(currentEval.protocol || '')) || selectedAudience;
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
                bodyMeasurements: { height: client.height },
                perimetria: {},
                skinFolds: {},
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
    }, [client, selectedEvaluationId, clientEvaluations, availableProtocols, selectedAudience]);


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
        const { name, value, type } = e.target;
        const keys = name.split('.');
        
        const parsedValue = type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value;

        if (keys.length > 1) {
            setFormState(prev => {
                const newState = {...prev};
                let current: any = newState;
                for (let i = 0; i < keys.length - 1; i++) {
                    current[keys[i]] = current[keys[i]] || {};
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = parsedValue;
                return newState;
            });
        } else {
            setFormState(prev => ({ ...prev, [name]: parsedValue }));
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

    const boneMass = useMemo(() => {
        const height = formState.bodyMeasurements?.height; // cm
        const wrist = formState.boneDiameters?.biestiloidal; // cm
        const femur = formState.boneDiameters?.bicondilarFemur; // cm
    
        if (height && wrist && femur) {
            const heightInM = height / 100;
            const wristInM = wrist / 100;
            const femurInM = femur / 100;
            return (3.02 * Math.pow(Math.pow(heightInM, 2) * wristInM * femurInM * 400, 0.712));
        }
        return 0;
    }, [formState.bodyMeasurements?.height, formState.boneDiameters?.biestiloidal, formState.boneDiameters?.bicondilarFemur]);
    
    const fatMassKg = useMemo(() => {
        const weight = formState.bodyMeasurements?.weight;
        const fatPercentage = formState.bodyComposition?.bodyFatPercentage;
        if (weight && fatPercentage) {
            return (weight * fatPercentage) / 100;
        }
        return 0;
    }, [formState.bodyMeasurements?.weight, formState.bodyComposition?.bodyFatPercentage]);
    
    const leanMassKg = useMemo(() => (formState.bodyMeasurements?.weight || 0) - fatMassKg, [formState.bodyMeasurements?.weight, fatMassKg]);
    
    const muscleMass = useMemo(() => {
        if (leanMassKg > 0 && boneMass > 0) {
           return leanMassKg - boneMass;
        }
        return 0;
    }, [leanMassKg, boneMass]);

    const residualMass = useMemo(() => {
        const weight = formState.bodyMeasurements?.weight;
    
        if (weight && fatMassKg > 0 && muscleMass > 0 && boneMass > 0) {
            const calculatedResidual = weight - (fatMassKg + muscleMass + boneMass);
            return calculatedResidual > 0 ? calculatedResidual : 0;
        }
        
        if(weight) {
            const residualFactor = formState.gender === 'Feminino' ? 0.21 : 0.24;
            return weight * residualFactor;
        }

        return 0;
    }, [formState.bodyMeasurements?.weight, fatMassKg, muscleMass, boneMass, formState.gender]);
    
    const residualMassPercentage = useMemo(() => {
        const weight = formState.bodyMeasurements?.weight;
        if (weight && residualMass > 0) {
            return (residualMass / weight) * 100;
        }
        return 0;
    }, [residualMass, formState.bodyMeasurements?.weight]);

    const getFatClassification = (percentage?: number, gender?: 'Masculino' | 'Feminino') => {
        if (percentage === undefined || !gender) return '-';
        if (gender === 'Feminino') {
            if (percentage < 20) return 'Atleta';
            if (percentage <= 24) return 'Bom';
            if (percentage <= 30) return 'Aceitável';
            return 'Obeso';
        } else { // Masculino
            if (percentage < 12) return 'Atleta';
            if (percentage <= 16) return 'Bom';
            if (percentage <= 22) return 'Aceitável';
            return 'Obeso';
        }
    };
    
    const fatClassification = useMemo(() => getFatClassification(formState.bodyComposition?.bodyFatPercentage, formState.gender), [formState.bodyComposition?.bodyFatPercentage, formState.gender]);
    const leanMassPercentage = useMemo(() => {
        const weight = formState.bodyMeasurements?.weight;
        if (!weight || weight === 0) return 0;
        return (leanMassKg / weight) * 100;
    }, [leanMassKg, formState.bodyMeasurements?.weight]);
    const idealWeight = useMemo(() => leanMassKg / (formState.gender === 'Masculino' ? 0.85 : 0.75), [leanMassKg, formState.gender]);
    const fatLossNeeded = useMemo(() => (formState.bodyMeasurements?.weight || 0) - idealWeight, [formState.bodyMeasurements?.weight, idealWeight]);



    const handleNewEvaluation = () => {
        if(client){
            const newEvalId = `eval_${allEvaluations.length + 1}`;
            const newEvaluation: Evaluation = {
                id: newEvalId,
                clientId: client.id,
                clientName: client.name,
                date: new Date().toISOString().split('T')[0],
                protocol: availableProtocols[0],
                bodyMeasurements: {
                    weight: 0,
                    height: client.height,
                    waistCircumference: 0,
                    hipCircumference: 0,
                },
                bodyComposition: {
                    bodyFatPercentage: 0,
                    muscleMass: 0,
                    boneDensity: 0
                },
                perimetria: {},
                skinFolds: {},
                boneDiameters: {},
                bioimpedance: {
                    scaleType: null
                },
                observations: '',
            };
            
            setAllEvaluations(prevEvals => [...prevEvals, newEvaluation].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            setSelectedEvaluationId(newEvalId);
            setCompareMode(false);
            setSelectedEvalIdsForCompare([]);
        }
        toast({ title: "Nova Avaliação", description: "Preencha os dados para a nova avaliação." });
    };
    
    const handleSave = () => {
        console.log("Saving data:", formState);
        toast({ title: "Salvo!", description: "Os dados da avaliação foram salvos com sucesso." });
    }

    const handleExportPdf = async () => {
        const reportElement = reportRef.current;
        if (!reportElement) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível gerar o PDF.' });
            return;
        }

        toast({ title: 'Exportando PDF...', description: 'Aguarde enquanto o relatório é gerado.' });

        // Hide scrollbars before capturing
        const originalStyle = reportElement.style.overflow;
        reportElement.style.overflow = 'visible';

        const canvas = await html2canvas(reportElement, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: true,
            allowTaint: true,
        });

        // Restore scrollbars
        reportElement.style.overflow = originalStyle;

        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const height = pdfWidth / ratio;

        let position = 0;
        let pageHeight = pdf.internal.pageSize.height;
        let remainingHeight = canvasHeight * pdfWidth / canvasWidth;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, remainingHeight);
        remainingHeight -= pageHeight;
        
        while (remainingHeight > 0) {
            position = remainingHeight - (canvasHeight * pdfWidth / canvasWidth);
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, remainingHeight);
            remainingHeight -= pageHeight;
        }


        pdf.save(`relatorio_${client?.name.replace(/ /g, '_')}_${new Date().toLocaleDateString('pt-BR')}.pdf`);

        toast({ title: 'PDF Exportado!', description: 'O relatório foi salvo com sucesso.' });
    };

    const handleCompareToggle = (checked: boolean) => {
        setCompareMode(checked);
        if (!checked) {
            setSelectedEvalIdsForCompare([]);
        } else {
            setSelectedEvaluationId(null)
        }
    }

    const handleCompareSelection = (evalId: string) => {
        setSelectedEvalIdsForCompare(prev => {
            if (prev.includes(evalId)) {
                return prev.filter(id => id !== evalId);
            }
            if (prev.length < 4) {
                return [...prev, evalId].sort((a,b) => {
                    const evalA = clientEvaluations.find(e => e.id === a);
                    const evalB = clientEvaluations.find(e => e.id === b);
                    return new Date(evalA!.date).getTime() - new Date(evalB!.date).getTime();
                });
            }
            toast({variant: 'destructive', title: 'Aviso', description: 'Você pode selecionar no máximo 4 avaliações.'})
            return prev;
        });
    }

    const comparedEvaluations = useMemo(() => {
        return clientEvaluations
            .filter(e => selectedEvalIdsForCompare.includes(e.id))
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [selectedEvalIdsForCompare, clientEvaluations]);

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
    
    const perimetriaFields = [
        { key: 'ombro', label: 'Ombro' },
        { key: 'torax', label: 'Tórax' },
        { key: 'cintura', label: 'Cintura' },
        { key: 'abdomen', label: 'Abdômen' },
        { key: 'quadril', label: 'Quadril' },
        { key: 'bracoDRelaxado', label: 'Braço D (relaxado)' },
        { key: 'bracoDContraido', label: 'Braço D (contraído)' },
        { key: 'bracoERelaxado', label: 'Braço E (relaxado)' },
        { key: 'bracoEContraido', label: 'Braço E (contraído)' },
        { key: 'antebracoD', label: 'Antebraço D' },
        { key: 'antebracoE', label: 'Antebraço E' },
        { key: 'coxaProximalD', label: 'Coxa Proximal D' },
        { key: 'coxaProximalE', label: 'Coxa Proximal E' },
        { key: 'coxaMedialD', label: 'Coxa Medial D' },
        { key: 'coxaMedialE', label: 'Coxa Medial E' },
        { key: 'panturrilhaD', label: 'Panturrilha D' },
        { key: 'panturrilhaE', label: 'Panturrilha E' },
    ];
    
    const diametrosFields: { name: BoneDiameterKeys, label: string }[] = [
        { name: 'biestiloidal', label: 'Biestiloidal (Punho) (cm)' },
        { name: 'bicondilarUmero', label: 'Bicondilar do Úmero (cm)' },
        { name: 'bicondilarFemur', label: 'Bicondilar do Fêmur (cm)' },
    ];

    const chartPoints = useMemo(() => {
        switch (activeTab) {
            case 'perimetria':
                return perimetriaPoints;
            case 'dobras':
                return skinfoldPoints;
            case 'diametros':
                return boneDiameterPoints;
            default:
                return [];
        }
    }, [activeTab]);


  return (
    <>
    <div className="min-h-screen bg-background text-foreground">
        <header className="flex flex-wrap items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
                <Activity className="size-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Avaliação Física Completa</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={handleSave} className="bg-primary text-primary-foreground shadow-md hover:bg-primary/90"><Save className="mr-2" /> Salvar</Button>
                <Link href="/bioimpedance">
                  <Button className="bg-primary text-primary-foreground shadow-md hover:bg-primary/90"><BarChart className="mr-2" /> Bioimpedância</Button>
                </Link>
                <Link href="/postural">
                    <Button className="bg-primary text-primary-foreground shadow-md hover:bg-primary/90"><User className="mr-2" /> Avaliação Postural</Button>
                </Link>
                <Button onClick={handleExportPdf} className="bg-primary text-primary-foreground shadow-md hover:bg-primary/90"><Download className="mr-2" /> Exportar PDF</Button>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
                
                <Card>
                    <CardHeader>
                        <div className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Avaliação {evaluation && selectedEvaluationId ? clientEvaluations.map(e => e.id).indexOf(selectedEvaluationId) + 1 : clientEvaluations.length + 1}</CardTitle>
                                <CardDescription>{formState.date ? new Date(formState.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : ''}</CardDescription>
                            </div>
                             <Button 
                                onClick={handleNewEvaluation} 
                                className="bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                            >
                                <Plus className="mr-2" /> Nova Avaliação
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            {client && (
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={client.avatarUrl} alt={client.name} />
                                    <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
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
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                        <div className="flex items-center justify-between">
                            <CardTitle>Avaliações {new Date().getFullYear()}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="compare-switch" className="text-sm">Comparar</Label>
                                <Switch id="compare-switch" checked={isCompareMode} onCheckedChange={handleCompareToggle} />
                            </div>
                        </div>
                         {isCompareMode && (
                            <div className="pt-4 space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    Selecione até 4 datas para comparar ({selectedEvalIdsForCompare.length}/4 selecionadas)
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {comparedEvaluations.map(ev => (
                                        <div key={`chip-${ev.id}`} className="flex items-center gap-2 bg-primary/20 text-primary-foreground rounded-full px-3 py-1 text-sm">
                                            <span>{new Date(ev.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                                            <button onClick={() => handleCompareSelection(ev.id)} className="text-primary-foreground/70 hover:text-primary-foreground">
                                                <X className="size-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="flex gap-4 overflow-x-auto pb-4">
                        {clientEvaluations.map((ev, index) => {
                            const isSelected = selectedEvaluationId === ev.id && !isCompareMode;
                            const isSelectedForCompare = selectedEvalIdsForCompare.includes(ev.id);
                            
                            return (
                                <Card 
                                    key={ev.id} 
                                    className={cn(
                                        "shrink-0 w-40 text-center cursor-pointer transition-colors shadow-xl rounded-2xl",
                                        isCompareMode 
                                            ? isSelectedForCompare ? 'bg-primary text-primary-foreground border-transparent shadow-lg' : 'bg-card'
                                            : isSelected ? 'border-2 border-primary' : 'bg-card',
                                        !isCompareMode && 'hover:bg-accent'
                                    )}
                                    onClick={() => isCompareMode ? handleCompareSelection(ev.id) : setSelectedEvaluationId(ev.id)}
                                >
                                    <CardHeader className="p-4 relative">
                                        <CardTitle className={cn("text-sm font-normal capitalize", isSelectedForCompare ? "text-primary-foreground" : "text-card-foreground")}>
                                            {new Date(ev.date).toLocaleDateString('pt-BR', { month: 'long', timeZone: 'UTC' })}/{new Date(ev.date).getFullYear().toString().slice(-2)}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                         {isCompareMode ? (
                                            <p className={cn("text-4xl font-bold", isSelectedForCompare ? "text-primary-foreground" : "text-card-foreground")}>{index + 1}</p>
                                         ) : (
                                            <>
                                                <p className="text-4xl font-bold">{ev.bodyComposition.bodyFatPercentage.toFixed(0)}<span className="text-lg">%</span></p>
                                                <p className={cn("text-xs", isSelected ? "text-muted-foreground" : "text-card-foreground")}>Gordura</p>
                                            </>
                                         )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </CardContent>
                </Card>
                
                {isCompareMode && client && comparedEvaluations.length > 0 && (
                    <div className="space-y-6">
                        <ComparisonTable
                            evaluations={comparedEvaluations}
                            perimetriaFields={perimetriaFields}
                            skinfoldFields={skinfoldFields}
                            diametrosFields={diametrosFields}
                        />
                        <ComparisonCharts 
                            evaluations={comparedEvaluations}
                            client={client}
                        />
                    </div>
                )}
                
                <Card>
                    <CardHeader>
                        <CardTitle>Registros de Dados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="perimetria" onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="perimetria">Perimetria</TabsTrigger>
                                <TabsTrigger value="dobras">Dobras Cutâneas</TabsTrigger>
                                <TabsTrigger value="diametros">Diâmetros Ósseos</TabsTrigger>
                            </TabsList>
                            <TabsContent value="perimetria" className="pt-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                    {perimetriaFields.map(field => (
                                        <div key={field.key}><Label>{field.label} (cm)</Label><Input type="number" placeholder="0.0" name={`perimetria.${field.key}`} value={formState.perimetria?.[field.key] || ''} onChange={handleInputChange} /></div>
                                    ))}
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
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Seleção de Protocolo</CardTitle>
                                        <CardDescription className="text-sm">Escolha o público-alvo e o protocolo para destacar as medidas necessárias.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
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
                                    </CardContent>
                                </Card>
                                
                                <div className="pt-4">
                                    <h3 className="text-lg font-medium mb-4">Medidas</h3>
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
                                                    className={cn(requiredSkinfolds.includes(field.name) && 'border-primary bg-primary/10 ring-2 ring-primary/50')}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 rounded-lg bg-primary/10 p-4">
                                    <h3 className="font-semibold mb-2">Resultados</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Soma das Dobras (mm)</Label>
                                            <div className="font-bold text-lg">{skinfoldsSum.toFixed(1)}</div>
                                        </div>
                                        <div>
                                            <Label>% Gordura Estimado</Label>
                                            <div className="font-bold text-lg">{formState.bodyComposition?.bodyFatPercentage?.toFixed(1) ?? '—'}%</div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="diametros" className="pt-4 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                    {diametrosFields.map(field => (
                                        <div key={field.name}>
                                            <Label>{field.label}</Label>
                                            <Input 
                                                type="number" 
                                                placeholder="0.0" 
                                                name={`boneDiameters.${field.name}`} 
                                                value={formState.boneDiameters?.[field.name] || ''} 
                                                onChange={handleInputChange} 
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 rounded-lg bg-primary/10 p-4">
                                    <h3 className="font-semibold mb-2">Resultados</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <Label>Massa Óssea (kg) - Rocha, 1975</Label>
                                            <div className="font-bold text-lg text-foreground">{boneMass > 0 ? boneMass.toFixed(2) : '-'} kg</div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-foreground mt-2">
                                        Essa estimativa complementa a análise da composição corporal, fornecendo dados estruturais mais estáveis.
                                    </p>
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
                        <CardTitle>Modelo Corporal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BodyMeasurementChart points={chartPoints} />
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
                            <p className="text-xs text-muted-foreground">{(((comparedEvaluations[1].bodyMeasurements.weight || 0) * (comparedEvaluations[1].bodyComposition.bodyFatPercentage || 0)) / 100).toFixed(1)} kg</p>
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
                        <p className="text-2xl font-bold">{muscleMass > 0 ? muscleMass.toFixed(1) : '0.0'} kg</p>
                        <p className="text-xs text-muted-foreground">{(((muscleMass) / (formState.bodyMeasurements?.weight || 1)) * 100).toFixed(1)}%</p>
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
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">RESIDUAL</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{residualMass > 0 ? residualMass.toFixed(1) : '0.0'} kg</p>
                        <p className="text-xs text-muted-foreground">{residualMassPercentage > 0 ? residualMassPercentage.toFixed(1) : '0.0'}%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-medium">RESULTADOS</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Classificação % Gordura:</span>
                            <span className="font-medium">{fatClassification}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Classificação IMC:</span>
                            <span className="font-medium">{bmiClassification}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Massa gorda (kg / %):</span>
                            <span className="font-medium">{fatMassKg.toFixed(1)} kg / {formState.bodyComposition?.bodyFatPercentage?.toFixed(1) ?? '0.0'}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Massa magra (kg / %):</span>
                            <span className="font-medium">{leanMassKg.toFixed(1)} kg / {leanMassPercentage.toFixed(1)}%</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Massa óssea (kg):</span>
                            <span className="font-medium">{boneMass > 0 ? boneMass.toFixed(2) : '-'} kg</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Massa muscular (kg):</span>
                            <span className="font-medium">{muscleMass > 0 ? muscleMass.toFixed(1) : '-'} kg</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Peso desejável:</span>
                            <span className="font-medium">{idealWeight > 0 ? idealWeight.toFixed(1) : '-'} kg</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Perda de gordura necessária:</span>
                            <span className="font-medium">{fatLossNeeded > 0 ? fatLossNeeded.toFixed(1) : '0.0'} kg</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
        <Toaster />
    </div>
    <div className="fixed -left-[2000px] -top-[2000px] w-[800px] bg-white" >
      {client && (evaluation || comparedEvaluations) && (
        <EvaluationReport 
            ref={reportRef}
            client={client}
            evaluation={evaluation}
            comparedEvaluations={isCompareMode ? comparedEvaluations : []}
            perimetriaFields={perimetriaFields}
        />
      )}
    </div>
    </>
  );
}

    