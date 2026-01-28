'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { clients as initialClients, evaluations as initialEvaluations, type Evaluation, type Client, audienceProtocols } from '@/lib/data';

type EvaluationContextType = {
  clients: Client[];
  allEvaluations: Evaluation[];
  addEvaluation: (clientId: string) => Evaluation;
  setAllEvaluations: React.Dispatch<React.SetStateAction<Evaluation[]>>;
};

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

export const EvaluationProvider = ({ children }: { children: ReactNode }) => {
  const [clients] = useState<Client[]>(initialClients);
  const [allEvaluations, setAllEvaluations] = useState<Evaluation[]>(initialEvaluations);

  const addEvaluation = useCallback((clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) throw new Error("Client not found");

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const localDateString = `${year}-${month}-${day}`;

    // Check if an evaluation for this client on this day already exists.
    const existingEval = allEvaluations.find(e => e.clientId === clientId && e.date === localDateString);
    if (existingEval) {
      console.log("Evaluation for today already exists.");
      return existingEval;
    }

    const newEvalId = `eval_${allEvaluations.length + 1}_${Date.now()}`;
    const newEvaluation: Evaluation = {
      id: newEvalId,
      clientId: client.id,
      clientName: client.name,
      date: localDateString,
      protocol: Object.keys(audienceProtocols).length > 0 ? audienceProtocols[Object.keys(audienceProtocols)[0]][0] : '',
      bodyMeasurements: { weight: client.bodyMeasurements?.weight || 0, height: client.height, waistCircumference: 0, hipCircumference: 0 },
      bodyComposition: { bodyFatPercentage: 0 },
      perimetria: {},
      skinFolds: {},
      boneDiameters: {},
      bioimpedance: { scaleType: null },
      posturalPhotos: {},
      posturalDeviations: {},
      observations: '',
    };

    setAllEvaluations(prevEvals => 
      [...prevEvals, newEvaluation].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );

    return newEvaluation;
  }, [clients, allEvaluations]);

  return (
    <EvaluationContext.Provider value={{ clients, allEvaluations, addEvaluation, setAllEvaluations }}>
      {children}
    </EvaluationContext.Provider>
  );
};

export const useEvaluationContext = () => {
  const context = useContext(EvaluationContext);
  if (context === undefined) {
    throw new Error('useEvaluationContext must be used within an EvaluationProvider');
  }
  return context;
};
