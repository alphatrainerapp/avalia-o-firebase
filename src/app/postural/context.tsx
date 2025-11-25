'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type Deviations = { [key: string]: string[] };

type PosturalContextType = {
  photos: { [key: string]: string | undefined };
  setPhoto: (type: string, url: string) => void;
  deviations: Deviations;
  toggleDeviation: (view: string, deviation: string) => void;
  clearDeviations: () => void;
};

const PosturalContext = createContext<PosturalContextType | undefined>(undefined);

export const PosturalContextProvider = ({ children }: { children: ReactNode }) => {
  const [photos, setPhotos] = useState<{ [key: string]: string | undefined }>({});
  const [deviations, setDeviations] = useState<Deviations>({});

  const setPhoto = useCallback((type: string, url: string) => {
    setPhotos(prev => ({ ...prev, [type]: url }));
  }, []);

  const toggleDeviation = useCallback((view: string, deviation: string) => {
    setDeviations(prev => {
        const currentDeviations = prev[view] || [];
        const isSelected = currentDeviations.includes(deviation);

        if (isSelected) {
            // Remove if already selected
            const newViewDeviations = currentDeviations.filter(d => d !== deviation);
            return { ...prev, [view]: newViewDeviations };
        } else {
            // Add if not selected
            const newViewDeviations = [...currentDeviations, deviation];
            return { ...prev, [view]: newViewDeviations };
        }
    });
  }, []);

  const clearDeviations = useCallback(() => {
    setDeviations({});
  }, []);

  return (
    <PosturalContext.Provider value={{ photos, setPhoto, deviations, toggleDeviation, clearDeviations }}>
      {children}
    </PosturalContext.Provider>
  );
};

export const usePosturalContext = () => {
  const context = useContext(PosturalContext);
  if (context === undefined) {
    throw new Error('usePosturalContext must be used within a PosturalContextProvider');
  }
  return context;
};
