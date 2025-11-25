'use client';
import React, { forwardRef } from 'react';
import type { Evaluation, Client, BioimpedanceScale, BioimpedanceInBody, BioimpedanceOmron } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { User, BarChart } from 'lucide-react';

type BioimpedanceReportProps = {
    client: Client;
    evaluations: Evaluation[];
    scaleType: BioimpedanceScale;
    omronFields: { key: keyof BioimpedanceOmron; label: string; unit: string }[];
    inbodyFields: { block: string; fields: { key: keyof BioimpedanceInBody; label: string; unit: string }[] }[];
};

const BioimpedanceReport = forwardRef<HTMLDivElement, BioimpedanceReportProps>(({ client, evaluations, scaleType, omronFields, inbodyFields }, ref) => {
    
    const mainEvaluation = evaluations[0];

    const renderTableBody = () => {
        if (!scaleType) return null;
        
        if (scaleType === 'omron') {
            return omronFields.map(field => (
                <TableRow key={field.key}>
                    <TableCell className="font-bold">{field.label} ({field.unit})</TableCell>
                    {evaluations.map(ev => {
                        const data = ev.bioimpedance.omron?.[field.key];
                        return <TableCell key={ev.id} className="text-center">{data !== undefined ? data : '-'}</TableCell>
                    })}
                </TableRow>
            ));
        }

        if (scaleType === 'inbody') {
            const rows: JSX.Element[] = [];
            inbodyFields.forEach(block => {
                rows.push(
                    <TableRow key={`header-${block.block}`} className="bg-gray-200">
                        <TableCell colSpan={evaluations.length + 1} className="font-bold text-gray-800">{block.block}</TableCell>
                    </TableRow>
                );
                block.fields.forEach(field => {
                    rows.push(
                        <TableRow key={field.key}>
                            <TableCell className="font-bold">{field.label} ({field.unit})</TableCell>
                            {evaluations.map(ev => {
                                const data = ev.bioimpedance.inbody?.[field.key];
                                return <TableCell key={ev.id} className="text-center">{data !== undefined ? data : '-'}</TableCell>
                            })}
                        </TableRow>
                    );
                });
            });
            return rows;
        }

        return null;
    }


    return (
        <div ref={ref} className="p-8 font-sans bg-white text-gray-800">
            <header className="flex items-center justify-between pb-4 border-b-2 border-gray-700">
                <div className="flex items-center">
                    <div className="p-2 bg-gray-700 text-white font-bold text-2xl tracking-wider">SMART</div>
                    <div className="p-2 bg-blue-500 text-white font-bold text-2xl tracking-wider">EVOLUTION</div>
                </div>
                <div className="text-right">
                    <h1 className="text-2xl font-bold text-gray-700">RELATÓRIO DE BIOIMPEDÂNCIA</h1>
                </div>
            </header>

            <section className="mt-4 border border-gray-400 p-2">
                <h2 className="font-bold flex items-center gap-2"><User size={16} /> DADOS PESSOAIS</h2>
                <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                    <div><strong>Nome:</strong> {client.name}</div>
                    <div><strong>Idade:</strong> {client.age}</div>
                    <div><strong>Sexo:</strong> {client.gender}</div>
                    <div><strong>Data da 1ª avaliação:</strong> {mainEvaluation ? new Date(mainEvaluation.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/A'}</div>
                </div>
            </section>
            
            <section className="mt-4 border border-gray-400 p-2">
                <h2 className="font-bold flex items-center gap-2"><BarChart size={16}/> TABELA COMPARATIVA</h2>
                 <Table className="mt-2 text-xs">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-bold">Parâmetro</TableHead>
                            {evaluations.map(ev => (
                                <TableHead key={ev.id} className="text-center font-bold">{new Date(ev.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {renderTableBody()}
                    </TableBody>
                </Table>
            </section>

             <footer className="mt-8 text-center text-xs text-gray-500">
                Relatório gerado por Alpha Trainer - {new Date().toLocaleDateString('pt-BR')}
            </footer>
        </div>
    );
});

BioimpedanceReport.displayName = "BioimpedanceReport";
export default BioimpedanceReport;
