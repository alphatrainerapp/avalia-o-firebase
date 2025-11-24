'use client';

import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { evaluations, type Evaluation } from '@/lib/data';
import { generateEvaluationAnalysis, GenerateEvaluationAnalysisInput } from '@/ai/flows/generate-evaluation-analysis';
import { generateTextualReport } from '@/ai/flows/generate-textual-report';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

function AILoadingState() {
    return (
        <div className="space-y-4 pt-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
        </div>
    )
}

export default function EvaluationsPage() {
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [isCompareModalOpen, setCompareModalOpen] = useState(false);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [activeEvaluation, setActiveEvaluation] = useState<Evaluation | null>(null);
  const [analysisResult, setAnalysisResult] = useState('');
  const [reportResult, setReportResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const numSelected = Object.values(selectedRows).filter(Boolean).length;

  const handleGenerateReport = async (evaluation: Evaluation) => {
    setActiveEvaluation(evaluation);
    setReportResult('');
    setReportModalOpen(true);
    setIsLoading(true);
    try {
      const result = await generateTextualReport({
        studentName: evaluation.clientName,
        evaluationData: JSON.stringify(evaluation),
      });
      setReportResult(result.report);
    } catch (error) {
      console.error('Error generating report:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate report.' });
      setReportModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = async (analysisType: GenerateEvaluationAnalysisInput['analysisType']) => {
    setAnalysisResult('');
    setCompareModalOpen(true);
    setIsLoading(true);
    const selectedEvaluations = evaluations.filter(e => selectedRows[e.id]);

    try {
      const result = await generateEvaluationAnalysis({
        evaluations: selectedEvaluations.map(e => ({
            date: e.date,
            bodyMeasurements: e.bodyMeasurements,
            bodyComposition: e.bodyComposition,
        })),
        analysisType,
      });
      setAnalysisResult(result.analysisReport);
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate analysis.' });
      setCompareModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  }

  const toggleRow = (id: string) => {
    setSelectedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAllRows = (checked: boolean) => {
    const newSelectedRows: Record<string, boolean> = {};
    if (checked) {
      evaluations.forEach(e => newSelectedRows[e.id] = true);
    }
    setSelectedRows(newSelectedRows);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle>Client Evaluations</CardTitle>
            </div>
            {numSelected >= 2 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>Compare {numSelected} Selected</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Analysis Type</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => handleCompare('evolution')}>Evolution</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleCompare('regression')}>Regression</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleCompare('stability')}>Stability</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox 
                    onCheckedChange={(checked) => toggleAllRows(!!checked)}
                    checked={numSelected === evaluations.length && evaluations.length > 0}
                    aria-label="Select all rows"
                  />
                </TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Protocol</TableHead>
                <TableHead>Body Fat %</TableHead>
                <TableHead>Muscle Mass</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations.map((evaluation) => (
                <TableRow key={evaluation.id} data-state={selectedRows[evaluation.id] ? "selected" : ""}>
                  <TableCell>
                    <Checkbox
                        checked={!!selectedRows[evaluation.id]}
                        onCheckedChange={() => toggleRow(evaluation.id)}
                        aria-label={`Select row for ${evaluation.clientName}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{evaluation.clientName}</TableCell>
                  <TableCell>{new Date(evaluation.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{evaluation.protocol}</Badge>
                  </TableCell>
                  <TableCell>{evaluation.bodyComposition.bodyFatPercentage}%</TableCell>
                  <TableCell>{evaluation.bodyComposition.muscleMass} kg</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleGenerateReport(evaluation)}>Generate Report</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Report Modal */}
      <Dialog open={isReportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>AI Generated Report for {activeEvaluation?.clientName}</DialogTitle>
            <DialogDescription>
                This report was automatically generated on {new Date().toLocaleDateString()}.
            </DialogDescription>
          </DialogHeader>
          {isLoading ? <AILoadingState /> : <p className="text-sm max-w-none text-foreground whitespace-pre-wrap">{reportResult}</p>}
        </DialogContent>
      </Dialog>

      {/* Compare Modal */}
       <Dialog open={isCompareModalOpen} onOpenChange={setCompareModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>AI Comparison Analysis</DialogTitle>
            <DialogDescription>
                Comparing {numSelected} selected evaluations.
            </DialogDescription>
          </DialogHeader>
           {isLoading ? <AILoadingState /> : <p className="text-sm max-w-none text-foreground whitespace-pre-wrap">{analysisResult}</p>}
        </DialogContent>
      </Dialog>
    </>
  );
}
