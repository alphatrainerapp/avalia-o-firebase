'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Download, Plus, Save, Activity, User, BarChart, Wind, X, ChevronDown, Info, Star, CheckCircle2, AlertCircle, TrendingUp, Trophy } from 'lucide-react';
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
import { 
    type Evaluation, 
    type Client, 
    audienceProtocols, 
    protocolSkinfolds, 
    type SkinfoldKeys, 
    type BoneDiameterKeys, 
    calculateBodyComposition, 
    type BodyComposition,
    getFunctionalClassification,
    type ClassificationType
} from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ComparisonTable } from '@/components/ComparisonTable';
import ComparisonCharts from '@/components/ComparisonCharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import EvaluationReport from '@/components/EvaluationReport';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEvaluationContext } from '@/context/EvaluationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from 'next/image';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';

const functionalTestsConfig = [
    { id: 'pushUps', title: '1. FLEXÃO DE BRAÇO', subtitle: 'Resistência de membros superiores', unit: 'reps', icon: 'push-ups-test', instruction: 'Execute o máximo de repetições contínuas mantendo a técnica correta.', detail: 'REPETIÇÕES' },
    { id: 'sitUps', title: '2. ABDOMINAL EM 1 MINUTO', subtitle: 'Resistência de membros abdominais', unit: 'reps', icon: 'abdominal-test', instruction: 'Realize o máximo de abdominais completos em 1 minuto.', detail: 'REPETIÇÕES' },
    { id: 'handgrip', title: '3. HANDGRIP', subtitle: 'Força de preensão manual', unit: 'kgf', icon: 'handgrip-test', instruction: 'Aperte o dinamômetro com força máxima. Registre o melhor resultado.', detail: 'FORÇA MÁXIMA' },
    { id: 'wells', title: '4. BANCO DE WELLS', subtitle: 'Flexibilidade de membros inferiores', unit: 'cm', icon: 'wells-test', instruction: 'Deslize as mãos sobre a régua o mais longe possível. Não force a dor.', detail: 'FLEXIBILIDADE' },
];

export default function DashboardPage() {
    const { clients, allEvaluations, setAllEvaluations, addEvaluation, selectedClientId, setSelectedClientId } = useEvaluationContext();
    const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);
    const [isCompareMode, setCompareMode] = useState(false);
    const [selectedEvalIdsForCompare, setSelectedEvalIdsForCompare] = useState<string[]>([]);
    const { toast } = useToast();
    const [selectedAudience, setSelectedAudience] = useState<string>(Object.keys(audienceProtocols)[0]);
    const [requiredSkinfolds, setRequiredSkinfolds] = useState<SkinfoldKeys[]>([]);
    const reportRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<'perimetria' | 'dobras' | 'diametros' | 'testes'>('perimetria');
    const [formattedDate, setFormattedDate] = useState('');

    const client = useMemo(() => clients.find(c => c.id === selectedClientId), [selectedClientId, clients]);
    const clientEvaluations = useMemo(() => allEvaluations.filter(e => e.clientId === selectedClientId).sort((a, b) => new Date(a.date.replace(/-/g, '/')).getTime() - new Date(b.date.replace(/-/g, '/')).getTime()), [selectedClientId, allEvaluations]);
    
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

    const [formState, setFormState] = useState<Partial<Evaluation & Client & any>>({});
    const availableProtocols = audienceProtocols[selectedAudience] || [];
    const hasEvaluations = clientEvaluations.length > 0;

    useEffect(() => {
        const currentEval = evaluation;
        let initialState: Partial<Evaluation & Client & any> = {};

        if (client && currentEval) {
            initialState = {
                ...client,
                ...currentEval,
                clientName: client.name,
                gender: client.gender,
                protocol: currentEval.protocol || availableProtocols[0],
            };
            const audience = Object.keys(audienceProtocols).find(key => audienceProtocols[key].includes(currentEval.protocol || '')) || selectedAudience;
            setSelectedAudience(audience);
        } else if (client) {
             const agora = new Date();
             const year = agora.getFullYear();
             const month = String(agora.getMonth() + 1).padStart(2, '0');
             const day = String(agora.getDate()).padStart(2, '0');

             initialState = {
                ...client,
                clientName: client.name,
                gender: client.gender,
                date: `${year}-${month}-${day}`,
                protocol: availableProtocols[0],
                bodyMeasurements: { height: client.height, weight: 0 },
                perimetria: {},
                skinFolds: {},
                functionalTests: {},
             };
        }
        setFormState(initialState);
    }, [client, evaluation, availableProtocols, selectedAudience]);

    useEffect(() => {
        if (formState.date) {
            setFormattedDate(new Date(formState.date.replace(/-/g, '/')).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }));
        }
    }, [formState.date]);

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
    
    const calculateFatFromInput = (skinfolds: any, age: number, gender: string, protocol: string) => {
        if (!skinfolds || !age || !gender || !protocol) return 0;
        const getSkinfoldSum = (keys: SkinfoldKeys[]) => keys.reduce((sum, key) => sum + (skinfolds[key] || 0), 0);

        let bodyDensity = 0;
        if (protocol.includes('Pollock 7 dobras')) {
            const sum7 = getSkinfoldSum(protocolSkinfolds['Pollock 7 dobras']);
            if (sum7 > 0) {
                bodyDensity = gender === 'Masculino' 
                    ? 1.112 - 0.00043499 * sum7 + 0.00000055 * sum7 * sum7 - 0.00028826 * age
                    : 1.097 - 0.00046971 * sum7 + 0.00000056 * sum7 * sum7 - 0.00012828 * age;
            }
        } else if (protocol.includes('Pollock 3 dobras')) {
            const skinfoldKeys = gender === 'Masculino' ? protocolSkinfolds['Pollock 3 dobras (M)'] : protocolSkinfolds['Pollock 3 dobras (F)'];
            const sum3 = getSkinfoldSum(skfoldKeys);
            if (sum3 > 0) {
                bodyDensity = gender === 'Masculino'
                    ? 1.10938 - 0.0008267 * sum3 + 0.0000016 * sum3 * sum3 - 0.0002574 * age
                    : 1.0994921 - 0.0009929 * sum3 + 0.0000023 * sum3 * sum3 - 0.0001392 * age;
            }
        } else if (protocol === 'ISAK') {
            const sum8 = getSkinfoldSum(protocolSkinfolds['ISAK']);
            if (sum8 > 0) {
                bodyDensity = gender === 'Masculino'
                    ? 1.109 - 0.0008 * sum8 + 0.0000016 * sum8 * sum8
                    : 1.099 - 0.0009 * sum8 + 0.0000023 * sum8 * sum8;
            }
        }

        if (bodyDensity > 0) {
            const fatPercentage = (4.95 / bodyDensity - 4.5) * 100;
            return fatPercentage > 0 && fatPercentage < 100 ? parseFloat(fatPercentage.toFixed(2)) : 0;
        }
        return 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const keys = name.split('.');
        const parsedValue = type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value;

        setFormState(prev => {
            let newState = JSON.parse(JSON.stringify(prev));
            let current: any = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = parsedValue;

            if (name.startsWith('skinFolds') || name === 'age' || name === 'gender' || name === 'protocol') {
                const newFat = calculateFatFromInput(newState.skinFolds, newState.age, newState.gender, newState.protocol);
                if (newFat > 0) {
                    newState.bodyComposition = { ...(newState.bodyComposition || {}), bodyFatPercentage: newFat };
                }
            }

            if (selectedEvaluationId) {
                setAllEvaluations(prevEvals => prevEvals.map(ev => ev.id === selectedEvaluationId ? { ...ev, ...newState } : ev));
            }
            return newState;
        });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormState(prev => {
            let newState = { ...prev, [name]: value };
            if (name === 'gender' || name === 'protocol') {
                const newFat = calculateFatFromInput(newState.skinFolds, newState.age, newState.gender, newState.protocol);
                if (newFat > 0) {
                    newState.bodyComposition = { ...(newState.bodyComposition || {}), bodyFatPercentage: newFat };
                }
            }
            if (selectedEvaluationId) {
                setAllEvaluations(current => current.map(ev => ev.id === selectedEvaluationId ? { ...ev, ...newState } : ev));
            }
            return newState;
        });
    }

    const handleAudienceChange = (audience: string) => {
        setSelectedAudience(audience);
        const newProtocols = audienceProtocols[audience];
        handleSelectChange('protocol', newProtocols[0]);
    };
    
    const calculateBMI = (weight?: number, height?: number) => (weight && height && weight > 0) ? (weight / ((height / 100) * (height / 100))).toFixed(1) : '—';
    const getBmiClassification = (bmi?: string) => {
        if (!bmi || bmi === '—') return '—';
        const v = parseFloat(bmi);
        if (v < 18.5) return 'Abaixo do peso';
        if (v < 24.9) return 'Peso normal';
        if (v < 29.9) return 'Sobrepeso';
        if (v < 34.9) return 'Obesidade Grau I';
        if (v < 39.9) return 'Obesidade Grau II';
        return 'Obesidade Grau III';
    };

    const calculateRCQ = (waist?: number, hip?: number) => (waist && hip && hip > 0 && waist > 0) ? (waist / hip).toFixed(2) : '—';
    const getRcqClassification = (rcq?: string, gender?: 'Masculino' | 'Feminino') => {
        if (!rcq || rcq === '—' || !gender) return '—';
        const v = parseFloat(rcq);
        if (gender === 'Feminino') return v < 0.80 ? 'Baixo Risco' : (v <= 0.85 ? 'Risco Moderado' : 'Alto Risco');
        return v < 0.95 ? 'Baixo Risco' : (v <= 1.0 ? 'Risco Moderado' : 'Alto Risco');
    };

    const calculateRCE = (waist?: number, height?: number) => (waist && height && waist > 0 && height > 0) ? (waist / height).toFixed(2) : '—';
    const getRceClassification = (rce?: string) => (!rce || rce === '—') ? '—' : (parseFloat(rce) <= 0.50 ? 'Baixo Risco' : 'Risco Aumentado');

    const getAsymmetryClassification = (val1?: number, val2?: number) => {
        if (val1 === undefined || val2 === undefined || val1 <= 0 || val2 <= 0) return '—';
        const diff = Math.abs(val1 - val2);
        const p = (diff / Math.max(val1, val2)) * 100;
        if (p < 1.5) return 'Sem diferença';
        if (p <= 5) return 'Diferença';
        if (p <= 10) return 'Diferença grande';
        return 'Diferença severa';
    };

    const bmi = useMemo(() => calculateBMI(formState.bodyMeasurements?.weight, formState.bodyMeasurements?.height), [formState.bodyMeasurements]);
    const bmiClassification = useMemo(() => getBmiClassification(bmi), [bmi]);
    const rcq = useMemo(() => calculateRCQ(formState.perimetria?.cintura, formState.perimetria?.quadril), [formState.perimetria]);
    const rcqClassification = useMemo(() => getRcqClassification(rcq, formState.gender), [rcq, formState.gender]);
    const rce = useMemo(() => calculateRCE(formState.perimetria?.cintura, formState.bodyMeasurements?.height), [formState.perimetria, formState.bodyMeasurements]);
    const rceClassification = useMemo(() => getRceClassification(rce), [rce]);
    const armAsymmetry = useMemo(() => getAsymmetryClassification(formState.perimetria?.bracoDRelaxado, formState.perimetria?.bracoERelaxado), [formState.perimetria]);
    const thighAsymmetry = useMemo(() => getAsymmetryClassification(formState.perimetria?.coxaMedialD, formState.perimetria?.coxaMedialE), [formState.perimetria]);

    const skinfoldsSum = useMemo(() => {
        if (!formState.skinFolds) return 0;
        return Object.values(formState.skinFolds).reduce((sum: number, value: any) => sum + (Number(value) || 0), 0);
    }, [formState.skinFolds]);

    const bodyComposition = useMemo<BodyComposition>(() => {
        if (!client || !formState || !formState.bodyMeasurements?.weight) {
          return { fatMassKg: 0, leanMassKg: 0, muscleMassKg: 0, boneMassKg: 0, residualMassKg: 0, fatMassPercentage: 0, muscleMassPercentage: 0, boneMassPercentage: 0, residualMassPercentage: 0, idealWeight: 0, fatLossNeeded: 0 };
        }
        return calculateBodyComposition(formState as Evaluation, client);
    }, [formState, client]);

    const getFatClassification = (percentage?: number, gender?: 'Masculino' | 'Feminino') => {
        if (!percentage || percentage === 0 || !gender) return '—';
        if (gender === 'Feminino') return percentage < 20 ? 'Atleta' : (percentage <= 24 ? 'Bom' : (percentage <= 30 ? 'Aceitável' : 'Obeso'));
        return percentage < 12 ? 'Atleta' : (percentage <= 16 ? 'Bom' : (percentage <= 22 ? 'Aceitável' : 'Obeso'));
    };
    
    const fatClassification = useMemo(() => getFatClassification(bodyComposition.fatMassPercentage, formState.gender), [bodyComposition.fatMassPercentage, formState.gender]);
    
    const handleNewEvaluation = () => {
        if(client){
            const newEval = addEvaluation(client.id);
            setSelectedEvaluationId(newEval.id);
            setCompareMode(false);
            setSelectedEvalIdsForCompare([]);
            toast({ title: "Nova Avaliação", description: "Preencha os dados para a nova avaliação criada hoje." });
        }
    };
    
    const handleSave = () => {
        toast({ title: "Salvo!", description: "Os dados da avaliação foram salvos com sucesso." });
    }

    const handleExportPdf = async () => {
        const el = reportRef.current;
        if (!el) return;
        toast({ title: 'Exportando PDF...' });
        const canvas = await html2canvas(el, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgRatio = canvas.width / canvas.height;
        const finalImgWidth = pdfWidth;
        const finalImgHeight = pdfWidth / imgRatio;
        pdf.addImage(imgData, 'PNG', 0, 0, finalImgWidth, finalImgHeight);
        pdf.save(`relatorio_${client?.name.replace(/ /g, '_')}.pdf`);
        toast({ title: 'PDF Exportado!' });
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

    const skinfoldFields: { name: SkinfoldKeys; label: string }[] = [
        { name: 'subscapular', label: 'Subscapular' }, { name: 'tricipital', label: 'Tricipital' },
        { name: 'bicipital', label: 'Bicipital' }, { name: 'peitoral', label: 'Peitoral' },
        { name: 'axilarMedia', label: 'Axilar-média' }, { name: 'supraIliaca', label: 'Supra-ilíaca' },
        { name: 'supraspinale', label: 'Supraespinal' }, { name: 'abdominal', label: 'Abdominal' },
        { name: 'coxa', label: 'Coxa' }, { name: 'panturrilha', label: 'Panturrilha' },
    ];
    
    const perimetriaFields = [
        { key: 'ombro', label: 'Ombro' }, { key: 'torax', label: 'Tórax' },
        { key: 'cintura', label: 'Cintura' }, { key: 'abdomen', label: 'Abdômen' },
        { key: 'quadril', label: 'Quadril' }, { key: 'bracoDRelaxado', label: 'Braço D (relaxado)' },
        { key: 'bracoDContraido', label: 'Braço D (contraído)' }, { key: 'bracoERelaxado', label: 'Braço E (relaxado)' },
        { key: 'bracoEContraido', label: 'Braço E (contraído)' }, { key: 'antebracoD', label: 'Antebraço D' },
        { key: 'antebracoE', label: 'Antebraço E' }, { key: 'coxaProximalD', label: 'Coxa Proximal D' },
        { key: 'coxaProximalE', label: 'Coxa Proximal E' }, { key: 'coxaMedialD', label: 'Coxa Medial D' },
        { key: 'coxaMedialE', label: 'Coxa Medial E' }, { key: 'panturrilhaD', label: 'Panturrilha D' },
        { key: 'panturrilhaE', label: 'Panturrilha E' },
    ];
    
    const diametrosFields: { name: BoneDiameterKeys, label: string }[] = [
        { name: 'biestiloidal', label: 'Biestiloidal (Punho) (cm)' },
        { name: 'bicondilarUmero', label: 'Bicondilar do Úmero (cm)' },
        { name: 'bicondilarFemur', label: 'Biestiloidal do Fêmur (cm)' },
    ];

    const EvalCard = ({ ev, index }: { ev: Evaluation; index: number }) => {
        const isSelected = selectedEvaluationId === ev.id && !isCompareMode;
        const isSelectedForCompare = selectedEvalIdsForCompare.includes(ev.id);
        const date = new Date(ev.date.replace(/-/g, '/')).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

        return (
            <Card 
                className={cn(
                    "shrink-0 w-44 text-center cursor-pointer transition-colors shadow-xl rounded-2xl",
                    isCompareMode 
                        ? isSelectedForCompare ? 'bg-primary text-primary-foreground border-transparent shadow-lg' : 'bg-card'
                        : isSelected ? 'border-2 border-primary' : 'bg-card'
                )}
                onClick={() => isCompareMode ? handleCompareSelection(ev.id) : setSelectedEvaluationId(ev.id)}
            >
                <CardHeader className="p-4 relative">
                    <CardTitle className={cn("text-sm font-normal", isSelectedForCompare ? "text-primary-foreground" : "text-card-foreground")}>{date}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                     {isCompareMode ? <p className={cn("text-4xl font-bold", isSelectedForCompare ? "text-primary-foreground" : "text-card-foreground")}>{index + 1}</p> : (
                        <>
                            <p className="text-4xl font-bold">{ev.bodyComposition.bodyFatPercentage > 0 ? ev.bodyComposition.bodyFatPercentage.toFixed(0) : '—'}<span className="text-lg">%</span></p>
                            <p className="text-xs opacity-70">Gordura</p>
                        </>
                     )}
                </CardContent>
            </Card>
        );
    };

    const FunctionalTestCard = ({ config }: { config: typeof functionalTestsConfig[0] }) => {
        const value = formState.functionalTests?.[config.id] || 0;
        const { classification, percentile, description } = getFunctionalClassification(config.id as any, value, client?.age || 30, client?.gender || 'Masculino');
        const img = getPlaceholderImage(config.icon);

        const getStatusColor = (cls: ClassificationType) => {
            switch(cls) {
                case 'EXCELENTE': return 'text-green-500';
                case 'BOM': return 'text-green-400';
                case 'REGULAR': return 'text-yellow-500';
                case 'FRACO': return 'text-orange-500';
                case 'MUITO FRACO': return 'text-red-500';
                default: return 'text-muted-foreground';
            }
        };

        const getStatusBg = (cls: ClassificationType) => {
            switch(cls) {
                case 'EXCELENTE': return 'bg-green-500/10 border-green-500/20';
                case 'BOM': return 'bg-green-500/5 border-green-500/10';
                case 'REGULAR': return 'bg-yellow-500/10 border-yellow-500/20';
                default: return 'bg-muted/50 border-muted';
            }
        };

        return (
            <Card className="overflow-hidden border-none shadow-md bg-muted/5">
                <CardHeader className="p-4 flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="text-sm font-black text-primary flex items-center gap-2">
                            {config.title}
                            <Info className="size-3 text-muted-foreground cursor-help" />
                        </CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold">{config.subtitle}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            {img && (
                                <div className="relative aspect-video rounded-lg overflow-hidden border shadow-inner">
                                    <Image src={img.imageUrl} alt={config.title} fill className="object-cover" data-ai-hint={img.imageHint} />
                                </div>
                            )}
                            <div className="flex gap-2 items-start">
                                <Activity className="size-3 text-primary shrink-0 mt-0.5" />
                                <p className="text-[10px] text-muted-foreground leading-tight">{config.instruction}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Resultado ({config.detail})</Label>
                                <div className="relative">
                                    <Input 
                                        type="number" 
                                        name={`functionalTests.${config.id}`}
                                        value={formState.functionalTests?.[config.id] || ''}
                                        onChange={handleInputChange}
                                        className="h-12 text-2xl font-black bg-background border-muted text-center pr-10"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase">{config.unit}</span>
                                </div>
                            </div>

                            <div className={cn("rounded-xl border p-3 transition-all", getStatusBg(classification))}>
                                <Label className="text-[9px] font-black uppercase text-muted-foreground block mb-2">Classificação</Label>
                                <div className="flex items-center gap-2">
                                    {classification === 'EXCELENTE' ? <Star className="size-4 fill-green-500 text-green-500" /> : <CheckCircle2 className={cn("size-4", getStatusColor(classification))} />}
                                    <span className={cn("text-sm font-black", getStatusColor(classification))}>{classification}</span>
                                </div>
                                <div className="mt-2 space-y-1">
                                    <p className="text-[10px] font-bold flex items-center gap-1.5">
                                        <TrendingUp className="size-3 text-primary" />
                                        Percentil: <span className="text-primary">{percentile}</span>
                                    </p>
                                    <p className="text-[9px] text-muted-foreground leading-tight">{description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

  return (
    <>
    <div className="min-h-screen bg-background text-foreground">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
                <Activity className="size-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground text-xs sm:text-sm">Avaliação Física Completa</p>
                </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 justify-end">
                <div className="hidden lg:flex items-center gap-2">
                    <Link href="/bioimpedance"><Button variant="outline" size="sm"><BarChart className="mr-2 h-4 w-4" /> Bioimpedância</Button></Link>
                    <Link href="/postural"><Button variant="outline" size="sm"><User className="mr-2 h-4 w-4" /> Postural</Button></Link>
                    <Link href="/vo2max"><Button variant="outline" size="sm"><Wind className="mr-2 h-4 w-4" /> VO2max</Button></Link>
                </div>
                <div className="lg:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><Activity className="mr-2 h-4 w-4" /> Avaliações <ChevronDown className="ml-1 h-3 w-3" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <Link href="/bioimpedance"><DropdownMenuItem><BarChart className="mr-2 h-4 w-4" /> Bioimpedância</DropdownMenuItem></Link>
                            <Link href="/postural"><DropdownMenuItem><User className="mr-2 h-4 w-4" /> Postural</DropdownMenuItem></Link>
                            <Link href="/vo2max"><DropdownMenuItem><Wind className="mr-2 h-4 w-4" /> VO2max</DropdownMenuItem></Link>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <Button onClick={handleSave} size="sm"><Save className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Salvar</span></Button>
                <Button onClick={handleExportPdf} size="sm"><Download className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">PDF</span></Button>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={cn("space-y-6", !hasEvaluations ? "lg:col-span-3" : "lg:col-span-2")}>
                <Card>
                    <CardHeader>
                        <div className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg sm:text-2xl">{hasEvaluations ? `Avaliação ${evaluation ? clientEvaluations.map(e => e.id).indexOf(evaluation.id) + 1 : clientEvaluations.length + 1}` : "Dados de Registro"}</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">{formattedDate}</CardDescription>
                            </div>
                             <Button onClick={handleNewEvaluation} size="sm"><Plus className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Nova Avaliação</span></Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label>Nome do Aluno</Label>
                                <div className="flex items-center gap-2">
                                    {client && <Avatar className="h-8 w-8 sm:h-10 sm:w-10"><AvatarImage src={client.avatarUrl} /><AvatarFallback>{client.name[0]}</AvatarFallback></Avatar>}
                                    <div className="flex-1 h-10 flex items-center px-3 rounded-md border bg-muted/50 font-bold text-sm">{client?.name || 'Nenhum selecionado'}</div>
                                </div>
                            </div>
                            <div className="md:col-span-2"><Label>Email</Label><Input name="email" value={formState.email || ''} onChange={handleInputChange} /></div>
                            <div><Label>Idade</Label><Input name="age" type="number" value={formState.age || ''} onChange={handleInputChange} /></div>
                            <div><Label>Sexo</Label>
                                <Select value={formState.gender || ''} onValueChange={(v) => handleSelectChange('gender', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="Masculino">Masculino</SelectItem><SelectItem value="Feminino">Feminino</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div><Label>Altura (cm)</Label><Input name="bodyMeasurements.height" type="number" value={formState.bodyMeasurements?.height || ''} onChange={handleInputChange} /></div>
                            <div><Label>Peso (kg)</Label><Input name="bodyMeasurements.weight" type="number" value={formState.bodyMeasurements?.weight || ''} onChange={handleInputChange} /></div>
                        </div>
                        {hasEvaluations && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                              <div><Label className="text-xs opacity-70">IMC</Label><div className="font-bold text-lg">{bmi}</div></div>
                              <div><Label className="text-xs opacity-70">Classificação</Label><div className="font-bold text-lg">{bmiClassification}</div></div>
                          </div>
                        )}
                        <div><Label>Observações</Label><Textarea name="observations" value={formState.observations || ''} onChange={handleInputChange} /></div>
                    </CardContent>
                </Card>

                {hasEvaluations && (
                  <>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Avaliações ({clientEvaluations.length})</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Label className="text-xs sm:text-sm">Comparar</Label>
                                    <Switch checked={isCompareMode} onCheckedChange={handleCompareToggle} />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {clientEvaluations.map((ev, idx) => <EvalCard ev={ev} index={idx} key={ev.id}/>)}
                        </CardContent>
                    </Card>
                    
                    {isCompareMode && client && comparedEvaluations.length > 0 && (
                        <div className="space-y-6">
                            <ComparisonTable evaluations={comparedEvaluations} perimetriaFields={perimetriaFields} skinfoldFields={skinfoldFields} diametrosFields={diametrosFields} />
                            <ComparisonCharts evaluations={comparedEvaluations} client={client} />
                        </div>
                    )}
                    
                    <Card>
                        <CardHeader><CardTitle className="text-lg">Registros de Dados</CardTitle></CardHeader>
                        <CardContent>
                            <Tabs defaultValue="perimetria" onValueChange={(v) => setActiveTab(v as any)}>
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="perimetria">Perimetria</TabsTrigger>
                                    <TabsTrigger value="dobras">Dobras</TabsTrigger>
                                    <TabsTrigger value="diametros">Diâmetros</TabsTrigger>
                                    <TabsTrigger value="testes">Testes</TabsTrigger>
                                </TabsList>
                                <TabsContent value="perimetria" className="pt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {perimetriaFields.map(f => (
                                            <div key={f.key}><Label className="text-xs">{f.label}</Label><Input type="number" name={`perimetria.${f.key}`} value={formState.perimetria?.[f.key] || ''} onChange={handleInputChange} /></div>
                                        ))}
                                    </div>
                                </TabsContent>
                                <TabsContent value="dobras" className="pt-4 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-6 border-b border-dashed">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase text-primary tracking-widest">Público Alvo</Label>
                                            <Select value={selectedAudience} onValueChange={handleAudienceChange}>
                                                <SelectTrigger className="h-10 bg-muted/20">
                                                    <SelectValue placeholder="Selecione o público" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.keys(audienceProtocols).map(audience => (
                                                        <SelectItem key={audience} value={audience}>{audience}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase text-primary tracking-widest">Protocolo de Cálculo</Label>
                                            <Select value={formState.protocol || ''} onValueChange={(v) => handleSelectChange('protocol', v)}>
                                                <SelectTrigger className="h-10 bg-muted/20">
                                                    <SelectValue placeholder="Selecione o protocolo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableProtocols.map(p => (
                                                        <SelectItem key={p} value={p}>{p}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {skinfoldFields.map(f => (
                                            <div key={f.name}>
                                                <Label className="text-xs">{f.label}</Label>
                                                <Input type="number" name={`skinFolds.${f.name}`} value={formState.skinFolds?.[f.name] || ''} onChange={handleInputChange} className={cn(requiredSkinfolds.includes(f.name) && 'border-primary ring-1 ring-primary/30')} />
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                                <TabsContent value="diametros" className="pt-4 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {diametrosFields.map(f => (
                                            <div key={f.name}><Label className="text-xs">{f.label}</Label><Input type="number" name={`boneDiameters.${f.name}`} value={formState.boneDiameters?.[f.name] || ''} onChange={handleInputChange} /></div>
                                        ))}
                                    </div>
                                </TabsContent>
                                <TabsContent value="testes" className="pt-4 space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {functionalTestsConfig.map(c => <FunctionalTestCard key={c.id} config={c} />)}
                                    </div>
                                    <div className="mt-8 p-6 bg-muted/20 rounded-2xl flex flex-wrap lg:flex-nowrap items-center gap-8 border border-muted/50">
                                        <div className="flex items-center gap-4 min-w-[240px] border-r border-muted/50 pr-8">
                                            <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Info size={24} /></div>
                                            <div><h4 className="text-xs font-black uppercase">Sobre as classificações</h4><p className="text-[10px] text-muted-foreground leading-tight mt-1">Baseadas em tabelas normativas por sexo e idade.</p></div>
                                        </div>
                                        <div className="flex flex-1 flex-wrap gap-x-8 gap-y-4">
                                            {[
                                                { label: 'FRACO', desc: 'Abaixo do esperado.', color: 'text-orange-500', icon: AlertCircle },
                                                { label: 'REGULAR', desc: 'Abaixo da média.', color: 'text-yellow-500', icon: CheckCircle2 },
                                                { label: 'BOM', desc: 'Na média.', color: 'text-green-400', icon: CheckCircle2 },
                                                { label: 'EXCELENTE', desc: 'Acima da média.', color: 'text-green-500', icon: Trophy },
                                            ].map(item => (
                                                <div key={item.label} className="flex gap-2.5 max-w-[200px]">
                                                    <item.icon className={cn("size-4 mt-0.5 shrink-0", item.color)} />
                                                    <div className="space-y-0.5"><p className={cn("text-[10px] font-black uppercase", item.color)}>{item.label}</p><p className="text-[9px] text-muted-foreground leading-snug">{item.desc}</p></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            {/* Setor de Indicadores Restaurado */}
                            <div className="mt-8 pt-6 border-t border-dashed space-y-6">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="size-4 text-primary" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider">Indicadores e Simetria</h3>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    <div className="p-4 bg-muted/10 rounded-2xl border border-muted/50">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Soma das Dobras</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-2xl font-black text-foreground">{skinfoldsSum.toFixed(1)}</p>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">mm</span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-muted/10 rounded-2xl border border-muted/50">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">RCQ (Cintura/Quadril)</p>
                                        <p className="text-2xl font-black text-foreground">{rcq}</p>
                                        <Badge variant="outline" className="mt-1 text-[8px] font-black uppercase bg-primary/10 text-primary border-primary/20">
                                            {rcqClassification}
                                        </Badge>
                                    </div>

                                    <div className="p-4 bg-muted/10 rounded-2xl border border-muted/50">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">RCE (Cintura/Estatura)</p>
                                        <p className="text-2xl font-black text-foreground">{rce}</p>
                                        <Badge variant="outline" className="mt-1 text-[8px] font-black uppercase bg-primary/10 text-primary border-primary/20">
                                            {rceClassification}
                                        </Badge>
                                    </div>

                                    <div className="p-4 bg-muted/10 rounded-2xl border border-muted/50">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Assimetria (Braços)</p>
                                        <p className="text-sm font-black text-foreground uppercase">{armAsymmetry}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground mt-1">D: {formState.perimetria?.bracoDRelaxado || 0} / E: {formState.perimetria?.bracoERelaxado || 0}</p>
                                    </div>

                                    <div className="p-4 bg-muted/10 rounded-2xl border border-muted/50">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Assimetria (Coxas)</p>
                                        <p className="text-sm font-black text-foreground uppercase">{thighAsymmetry}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground mt-1">D: {formState.perimetria?.coxaMedialD || 0} / E: {formState.perimetria?.coxaMedialE || 0}</p>
                                    </div>

                                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
                                        <p className="text-[10px] font-black text-primary uppercase mb-1">Gordura Calculada</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-2xl font-black text-primary">{bodyComposition.fatMassPercentage.toFixed(1)}%</p>
                                        </div>
                                        <p className="text-[9px] font-black text-primary uppercase opacity-70 mt-1">{fatClassification}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                  </>
                )}
            </div>

            {hasEvaluations && (
              <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                    <Card className="shadow-sm border-primary/20 bg-primary/[0.02]">
                        <CardHeader className="pb-2 p-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-[10px] font-bold text-primary uppercase">GORDURA</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-xl sm:text-2xl font-bold">{bodyComposition.fatMassPercentage > 0 ? `${bodyComposition.fatMassPercentage.toFixed(1)}%` : '—'}</p>
                            <p className="text-[10px] text-muted-foreground">{bodyComposition.fatMassKg > 0 ? `${bodyComposition.fatMassKg.toFixed(1)} kg` : '0.0 kg'}</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-primary/20 bg-primary/[0.02]">
                        <CardHeader className="pb-2 p-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-[10px] font-bold text-primary uppercase">MUSCULAR</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-xl sm:text-2xl font-bold">{bodyComposition.muscleMassKg > 0 ? `${bodyComposition.muscleMassKg.toFixed(1)} kg` : '—'}</p>
                            <p className="text-[10px] text-muted-foreground">{bodyComposition.muscleMassPercentage > 0 ? `${bodyComposition.muscleMassPercentage.toFixed(1)}%` : '0.0%'}</p>
                        </CardContent>
                    </Card>
                  </div>
                  <Card className="shadow-sm">
                      <CardHeader className="pb-2 p-4"><CardTitle className="text-[10px] font-bold opacity-70 uppercase">RESIDUAL</CardTitle></CardHeader>
                      <CardContent className="p-4 pt-0">
                          <p className="text-xl sm:text-2xl font-bold">{bodyComposition.residualMassKg > 0 ? `${bodyComposition.residualMassKg.toFixed(1)} kg` : '—'}</p>
                          <p className="text-[10px] text-muted-foreground">{bodyComposition.residualMassPercentage > 0 ? `${bodyComposition.residualMassPercentage.toFixed(1)}%` : '0.0%'}</p>
                      </CardContent>
                  </Card>
                  <Card className="shadow-md border-primary/10">
                      <CardHeader className="pb-4 p-4"><CardTitle className="text-sm font-bold uppercase">Resumo Analítico</CardTitle></CardHeader>
                      <CardContent className="space-y-3 text-xs p-4 pt-0">
                          <div className="flex justify-between border-b pb-1"><span className="opacity-70">Classificação % Gordura:</span><span className="font-semibold text-primary">{fatClassification}</span></div>
                          <div className="flex justify-between border-b pb-1"><span className="opacity-70">Classificação IMC:</span><span className="font-semibold">{bmiClassification}</span></div>
                          <div className="flex justify-between pt-1"><span className="opacity-70">Perda de gordura necessária:</span><span className="font-bold text-destructive">{bodyComposition.fatLossNeeded > 0 ? `${bodyComposition.fatLossNeeded.toFixed(1)} kg` : '0.0 kg'}</span></div>
                      </CardContent>
                  </Card>
              </div>
            )}
        </div>
        <Toaster />
    </div>
    <div className="fixed -left-[9999px] -top-[9999px] bg-white">
      {client && (evaluation || comparedEvaluations.length > 0) && (
        <EvaluationReport ref={reportRef} client={client} evaluation={evaluation} comparedEvaluations={isCompareMode ? comparedEvaluations : []} perimetriaFields={perimetriaFields} skinfoldFields={skinfoldFields} />
      )}
    </div>
    </>
  );
}