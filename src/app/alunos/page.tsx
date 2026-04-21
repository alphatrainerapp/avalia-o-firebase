'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
    Users, 
    Search, 
    Plus, 
    Mail, 
    Calendar, 
    UserCircle, 
    ChevronRight,
    Filter,
    MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEvaluationContext } from '@/context/EvaluationContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

export default function AlunosPage() {
    const { clients, setSelectedClientId, allEvaluations } = useEvaluationContext();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = useMemo(() => {
        return clients.filter(client => 
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [clients, searchTerm]);

    const getLatestEvaluation = (clientId: string) => {
        const clientEvals = allEvaluations
            .filter(e => e.clientId === clientId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return clientEvals[0];
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Users className="size-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Gestão de Alunos</h1>
                        <p className="text-muted-foreground">Listagem e controle de clientes ativos</p>
                    </div>
                </div>
                <Button className="bg-primary text-primary-foreground shadow-md">
                    <Plus className="mr-2 h-4 w-4" /> Novo Aluno
                </Button>
            </header>

            <Card className="border-none shadow-sm bg-muted/10">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar por nome ou email..." 
                                className="pl-9 bg-background"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-lg overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[300px]">Aluno</TableHead>
                                <TableHead className="hidden md:table-cell">Idade / Sexo</TableHead>
                                <TableHead className="hidden lg:table-cell">Última Avaliação</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClients.map((client) => {
                                const latestEval = getLatestEvaluation(client.id);
                                return (
                                    <TableRow key={client.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                                    <AvatarImage src={client.avatarUrl} />
                                                    <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col leading-tight">
                                                    <span className="font-bold text-sm">{client.name}</span>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Mail className="size-3" /> {client.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex flex-col text-xs font-medium">
                                                <span>{client.age} anos</span>
                                                <span className="text-muted-foreground">{client.gender}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            {latestEval ? (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Calendar className="size-3 text-primary" />
                                                    <span className="font-medium">
                                                        {new Date(latestEval.date.replace(/-/g, '/')).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">Sem registros</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={latestEval ? "default" : "secondary"} className="text-[10px] uppercase font-bold tracking-tight">
                                                {latestEval ? 'Ativo' : 'Pendente'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href="/dashboard" onClick={() => setSelectedClientId(client.id)}>
                                                    <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10">
                                                        Abrir Ficha <ChevronRight className="ml-1 size-4" />
                                                    </Button>
                                                </Link>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>Editar Perfil</DropdownMenuItem>
                                                        <DropdownMenuItem>Ver Histórico</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive">Inativar</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {filteredClients.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                                        Nenhum aluno encontrado para "{searchTerm}"
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
