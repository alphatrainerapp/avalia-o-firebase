'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Wind, Activity, Timer, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEvaluationContext } from '@/context/EvaluationContext';

export default function VO2MaxPage() {
    const { clients, selectedClientId } = useEvaluationContext();
    const client = clients.find(c => c.id === selectedClientId);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <Wind className="size-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Avaliação VO2max</h1>
                        <p className="text-muted-foreground">Capacidade Cardiorrespiratória</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="md:col-span-2 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Em Breve: Protocolos de VO2max</CardTitle>
                        <CardDescription>
                            Estamos preparando a implementação dos principais testes de campo para {client?.name}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 border rounded-lg bg-muted/20 flex items-start gap-3">
                                <Timer className="size-5 text-primary mt-1" />
                                <div>
                                    <h3 className="font-semibold">Teste de Cooper</h3>
                                    <p className="text-sm text-muted-foreground">Estimativa de VO2max baseada na distância percorrida em 12 minutos.</p>
                                </div>
                            </div>
                            <div className="p-4 border rounded-lg bg-muted/20 flex items-start gap-3">
                                <Activity className="size-5 text-primary mt-1" />
                                <div>
                                    <h3 className="font-semibold">Teste de Rockport</h3>
                                    <p className="text-sm text-muted-foreground">Caminhada de 1 milha (1.600m) monitorando frequência cardíaca.</p>
                                </div>
                            </div>
                            <div className="p-4 border rounded-lg bg-muted/20 flex items-start gap-3">
                                <Calculator className="size-5 text-primary mt-1" />
                                <div>
                                    <h3 className="font-semibold">Fórmula de Balke</h3>
                                    <p className="text-sm text-muted-foreground">Protocolo ideal para diferentes níveis de condicionamento físico.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
