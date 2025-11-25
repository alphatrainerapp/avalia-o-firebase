'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Activity, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Plus, Save, User, X } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { clients, evaluations as initialEvaluations, type Evaluation, type Client, type BioimpedanceScale, BioimpedanceInBody, BioimpedanceOmron } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const omronFields: { key: keyof BioimpedanceOmron; label: string; unit: string }[] = [
    { key: 'weight', label: 'Peso corporal', unit: 'kg' },
    { key: 'bmi', label: 'IMC', unit: '' },
    { key: 'bodyFatPercentage', label: 'Gordura Corporal', unit: '%' },
    { key: 'skeletalMusclePercentage', label: 'Músculo Esquelético', unit: '%' },
    { key: 'visceralFatLevel', label: 'Gordura Visceral', unit: 'nível' },
    { key: 'basalMetabolicRate', label: 'Taxa metabólica basal', unit: 'kcal' },
    { key: 'metabolicAge', label: 'Idade metabólica', unit: 'anos' },
    { key: 'leanBodyMass', label: 'Massa corporal magra', unit: 'kg' },
    { key: 'bodyFatMass', label: 'Massa de gordura corporal', unit: 'kg' },
];

const inbodyFields: { block: string; fields: { key: keyof BioimpedanceInBody; label: string; unit: string }[] }[] = [
    {
        block: 'Composição Corporal Geral',
        fields: [
            { key: 'totalBodyWeight', label: 'Peso corporal total', unit: 'kg' },
            { key: 'skeletalMuscleMass', label: 'Massa muscular esquelética (SMM)', unit: 'kg' },
            { key: 'bodyFatMass', label: 'Massa de gordura corporal', unit: 'kg' },
            { key: 'totalBodyWater', label: 'Água corporal total (TBW)', unit: 'kg' },
            { key: 'bodyProtein', label: 'Proteína corporal', unit: 'kg' },
            { key: 'bodyMinerals', label: 'Minerais corporais', unit: 'kg' },
            { key: 'fatFreeMass', label: 'Massa Livre de Gordura (FFM)', unit: 'kg' },
        ],
    },
    {
        block: 'Análise Segmentar de Massa Magra',
        fields: [
            { key: 'rightArmLeanMass', label: 'Braço direito', unit: 'kg' },
            { key: 'leftArmLeanMass', label: 'Braço esquerdo', unit: 'kg' },
            { key: 'rightLegLeanMass', label: 'Perna direita', unit: 'kg' },
            { key: 'leftLegLeanMass', label: 'Perna esquerda', unit: 'kg' },
            { key: 'trunkLeanMass', label: 'Tronco', unit: 'kg' },
        ],
    },
    {
        block: 'Análise de Gordura Regional',
        fields: [
            { key: 'trunkFat', label: 'Gordura tronco', unit: 'kg' },
            { key: 'limbsFat', label: 'Gordura de membros', unit: 'kg' },
        ],
    },
    {
        block: 'Obesidade',
        fields: [
            { key: 'bmi', label: 'IMC', unit: '' },
            { key: 'bodyFatPercentage', label: 'Gordura corporal', unit: '%' },
            { key: 'visceralFatArea', label: 'Taxa de gordura visceral (VFA)', unit: 'cm²' },
            { key: 'waistHipRatio', label: 'Cintura-quadril (WHR)', unit: '' },
        ],
    },
    {
        block: 'Metabolismo e Controle',
        fields: [
            { key: 'basalMetabolicRate', label: 'Taxa metabólica basal (TMB)', unit: 'kcal' },
            { key: 'fatControl', label: 'Controle de gordura', unit: 'kg' },
            { key: 'muscleControl', label: 'Controle de músculo', unit: 'kg' },
        ],
    },
];

export default function BioimpedancePage() {
    const [selectedClientId, setSelectedClientId] = useState<string>(clients[0].id);
    const [selectedEvalIds, setSelectedEvalIds] = useState<string[]>([]);
    const [allEvaluations, setAllEvaluations] = useState<Evaluation[]>(initialEvaluations);
    const [isModalOpen, setModalOpen] = useState(true);
    const [selectedScale, setSelectedScale] = useState<BioimpedanceScale>(null);
    const { toast } = useToast();

    const client = useMemo(() => clients.find(c => c.id === selectedClientId), [selectedClientId]);
    const clientEvaluations = useMemo(() => {
        return allEvaluations
            .filter(e => e.clientId === selectedClientId && e.bioimpedance.scaleType === selectedScale)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [selectedClientId, allEvaluations, selectedScale]);

    const comparedEvaluations = useMemo(() => {
        return clientEvaluations
            .filter(e => selectedEvalIds.includes(e.id))
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [selectedEvalIds, clientEvaluations]);

    const handleClientChange = (clientId: string) => {
        setSelectedClientId(clientId);
        setSelectedEvalIds([]);
        setModalOpen(true);
        setSelectedScale(null);
    };

    const handleScaleSelect = (scale: BioimpedanceScale) => {
        setSelectedScale(scale);
        setSelectedEvalIds([]);
        setModalOpen(false);
    };

    const handleCompareSelection = (evalId: string) => {
        setSelectedEvalIds(prev => {
            if (prev.includes(evalId)) {
                return prev.filter(id => id !== evalId);
            }
            if (prev.length < 5) {
                return [...prev, evalId].sort((a,b) => {
                    const evalA = clientEvaluations.find(e => e.id === a);
                    const evalB = clientEvaluations.find(e => e.id === b);
                    return new Date(evalA!.date).getTime() - new Date(evalB!.date).getTime();
                });
            }
            toast({variant: 'destructive', title: 'Aviso', description: 'Você pode selecionar no máximo 5 avaliações.'})
            return prev;
        });
    };

    const handleSave = () => {
        // Here you would implement the logic to save the updated `allEvaluations` state
        console.log("Saving evaluations...", allEvaluations);
        toast({ title: 'Salvo!', description: 'Os dados da bioimpedância foram salvos.' });
    };

    const handleInputChange = (evalId: string, block: 'omron' | 'inbody', field: string, value: string) => {
        setAllEvaluations(prevEvals => prevEvals.map(ev => {
            if (ev.id === evalId) {
                const updatedEval = { ...ev };
                if (!updatedEval.bioimpedance) {
                    updatedEval.bioimpedance = { scaleType: selectedScale };
                }
                if (!updatedEval.bioimpedance[block]) {
                    (updatedEval.bioimpedance as any)[block] = {};
                }
                (updatedEval.bioimpedance[block] as any)[field] = value ? parseFloat(value) : undefined;
                return updatedEval;
            }
            return ev;
        }));
    };

    const renderComparisonRows = () => {
        const fields = selectedScale === 'omron' ? omronFields : inbodyFields.flatMap(b => b.fields.map(f => ({...f, block: b.block})));

        const rows: JSX.Element[] = [];
        let lastBlock = '';

        fields.forEach(fieldInfo => {
            const fieldKey = fieldInfo.key;
            const currentBlock = 'block' in fieldInfo ? fieldInfo.block : '';

            if(currentBlock && currentBlock !== lastBlock && selectedScale === 'inbody') {
                 rows.push(
                    <TableRow key={`header-${currentBlock}`} className="bg-muted/50">
                        <TableCell colSpan={comparedEvaluations.length + 1} className="font-bold text-primary-foreground py-2 px-4">{currentBlock}</TableCell>
                    </TableRow>
                );
                lastBlock = currentBlock;
            }

            rows.push(
                <TableRow key={fieldKey}>
                    <TableCell className="font-medium">{fieldInfo.label} <span className="text-muted-foreground text-xs">({fieldInfo.unit})</span></TableCell>
                    {comparedEvaluations.map((ev, evalIndex) => {
                        const data = selectedScale ? ev.bioimpedance[selectedScale] as any : undefined;
                        const currentValue = data?.[fieldKey] as number | undefined;
                        
                        let difference: number | null = null;
                        let diffColor = 'text-gray-500';

                        if (evalIndex > 0) {
                            const prevEval = comparedEvaluations[evalIndex - 1];
                            const prevData = selectedScale ? prevEval.bioimpedance[selectedScale] as any : undefined;
                            const previousValue = prevData?.[fieldKey] as number | undefined;

                            if (currentValue !== undefined && previousValue !== undefined) {
                                difference = currentValue - previousValue;
                                // Example improvement logic: lower fat is good, higher muscle is good
                                const isGoodChange = (fieldKey.toLowerCase().includes('fat') && difference < 0) || (fieldKey.toLowerCase().includes('muscle') && difference > 0);
                                const isBadChange = (fieldKey.toLowerCase().includes('fat') && difference > 0) || (fieldKey.toLowerCase().includes('muscle') && difference < 0);
                                
                                if (isGoodChange) diffColor = 'text-green-500';
                                else if (isBadChange) diffColor = 'text-red-500';
                            }
                        }

                        return (
                            <TableCell key={ev.id} className="text-center">
                                <Input
                                    type="number"
                                    className="w-24 text-center mx-auto"
                                    value={currentValue ?? ''}
                                    onChange={(e) => handleInputChange(ev.id, selectedScale!, fieldKey, e.target.value)}
                                    placeholder="-"
                                />
                                {difference !== null && (
                                    <span className={cn("flex items-center justify-center gap-1 text-xs pt-1", diffColor)}>
                                        {difference > 0 ? <ChevronUp className="size-3" /> : (difference < 0 ? <ChevronDown className="size-3" /> : null)}
                                        {difference.toFixed(1)}
                                    </span>
                                )}
                            </TableCell>
                        );
                    })}
                </TableRow>
            );
        });
        return rows;
    };


    return (
        <>
            <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Selecione o tipo de balança</DialogTitle>
                        <DialogDescription>
                            Escolha a balança utilizada para carregar os campos de avaliação correspondentes.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Button onClick={() => handleScaleSelect('omron')} variant="outline">
                            Balança Simples (Omron HBF-514)
                        </Button>
                        <Button onClick={() => handleScaleSelect('inbody')} variant="outline">
                            Bioimpedância Completa (InBody 270)
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
                <header className="flex flex-wrap items-center justify-between mb-6 gap-4">
                     <div className="flex items-center gap-3">
                        <Link href="/dashboard"><Button variant="outline" size="icon"><ArrowLeft /></Button></Link>
                        <Activity className="size-8 text-primary" />
                        <div>
                            <h1 className="text-2xl font-bold">Bioimpedância</h1>
                            <p className="text-muted-foreground">
                                {selectedScale ? `Resultados para ${selectedScale === 'omron' ? 'Omron HBF-514' : 'InBody 270'}` : 'Selecione uma balança'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={handleSave} className="bg-[#01baba] text-white shadow-md hover:bg-[#01baba]/90"><Save className="mr-2" /> Salvar Alterações</Button>
                    </div>
                </header>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-2">
                                    <Label htmlFor="name">Nome</Label>
                                    <Select value={selectedClientId} onValueChange={handleClientChange}>
                                        <SelectTrigger id="name">
                                            <SelectValue placeholder="Selecione um cliente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end">
                                    <Button onClick={() => { setModalOpen(true); setSelectedEvalIds([]); }}>Trocar Balança</Button>
                                </div>
                            </div>
                        </CardHeader>
                        {selectedScale && (
                            <CardContent className="flex gap-4 overflow-x-auto pb-4">
                                {clientEvaluations.map((ev, index) => {
                                    const isSelectedForCompare = selectedEvalIds.includes(ev.id);
                                    
                                    return (
                                        <Card 
                                            key={ev.id} 
                                            className={cn(
                                                "shrink-0 w-36 text-center cursor-pointer transition-colors shadow-xl",
                                                isSelectedForCompare ? 'bg-[#01baba] text-white border-transparent shadow-lg rounded-2xl' : 'bg-card rounded-2xl'
                                            )}
                                            onClick={() => handleCompareSelection(ev.id)}
                                        >
                                            <CardHeader className="p-4 relative">
                                                 <CardTitle className={cn("text-sm font-normal capitalize", isSelectedForCompare ? "text-white" : "text-card-foreground")}>
                                                    {new Date(ev.date).toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', timeZone: 'UTC' })}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                <p className={cn("text-4xl font-bold", isSelectedForCompare ? "text-white" : "text-card-foreground")}>{index + 1}</p>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </CardContent>
                        )}
                         {selectedEvalIds.length > 0 && (
                            <CardFooter>
                                 <p className="text-sm text-muted-foreground">
                                    {selectedEvalIds.length}/{clientEvaluations.length} avaliações selecionadas para comparação.
                                </p>
                            </CardFooter>
                        )}
                    </Card>

                    {comparedEvaluations.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Tabela Comparativa de Bioimpedância</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="min-w-[250px]">Parâmetro</TableHead>
                                                {comparedEvaluations.map(ev => (
                                                    <TableHead key={ev.id} className="text-center min-w-[150px]">
                                                        {new Date(ev.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {renderComparisonRows()}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                </div>
            </div>
        </>
    );
}
