'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { clients, evaluations, type Evaluation } from '@/lib/data';
import { suggestTraining } from '@/ai/flows/suggest-training-based-on-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function AILoadingState() {
    return (
        <div className="space-y-4 pt-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    )
}

export default function TrainingSuggestionsPage() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientEvaluations, setClientEvaluations] = useState<Evaluation[]>([]);
  const [currentEvalId, setCurrentEvalId] = useState<string | null>(null);
  const [pastEvalId, setPastEvalId] = useState<string | null>(null);
  const [trainingGoals, setTrainingGoals] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const evals = evaluations.filter(e => e.clientId === clientId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setClientEvaluations(evals);
    setCurrentEvalId(null);
    setPastEvalId(null);
    setSuggestions('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvalId || !trainingGoals) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a current evaluation and enter training goals.' });
      return;
    }
    
    setIsLoading(true);
    setSuggestions('');

    const currentMeasurements = evaluations.find(e => e.id === currentEvalId);
    const pastMeasurements = evaluations.find(e => e.id === pastEvalId);

    try {
      const result = await suggestTraining({
        currentMeasurements: JSON.stringify(currentMeasurements),
        pastMeasurements: pastMeasurements ? JSON.stringify(pastMeasurements) : 'No past measurements provided.',
        trainingGoals: trainingGoals,
      });
      setSuggestions(result.trainingSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate suggestions.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Training Suggestion Tool</CardTitle>
          <CardDescription>
            Generate AI-powered training ideas based on client data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select onValueChange={handleClientChange}>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClientId && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="current-eval">Current Evaluation</Label>
                  <Select onValueChange={setCurrentEvalId} value={currentEvalId ?? undefined}>
                    <SelectTrigger id="current-eval">
                      <SelectValue placeholder="Select most recent evaluation" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientEvaluations.map(e => (
                        <SelectItem key={e.id} value={e.id}>
                          {new Date(e.date).toLocaleDateString()} - {e.protocol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="past-eval">Comparison Evaluation (Optional)</Label>
                  <Select onValueChange={setPastEvalId} value={pastEvalId ?? undefined}>
                    <SelectTrigger id="past-eval">
                      <SelectValue placeholder="Select a past evaluation" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientEvaluations.map(e => (
                        <SelectItem key={e.id} value={e.id} disabled={e.id === currentEvalId}>
                          {new Date(e.date).toLocaleDateString()} - {e.protocol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            <div className="space-y-2">
                <Label htmlFor="goals">Training Goals</Label>
                <Textarea
                    id="goals"
                    placeholder="e.g., Increase muscle mass, improve cardiovascular endurance, prepare for a marathon..."
                    value={trainingGoals}
                    onChange={(e) => setTrainingGoals(e.target.value)}
                    rows={4}
                />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !currentEvalId || !trainingGoals}>
              {isLoading ? 'Generating...' : 'Get Suggestions'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="text-primary" />
            AI Training Suggestions
          </CardTitle>
          <CardDescription>
            These are AI-generated ideas to support your decisions. Always use your professional judgment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <AILoadingState />
          ) : suggestions ? (
            <p className="text-sm max-w-none text-foreground whitespace-pre-wrap">{suggestions}</p>
          ) : (
            <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                <p className="text-muted-foreground">Your suggestions will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
