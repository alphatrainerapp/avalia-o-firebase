'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

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

  const setPhoto = (type: string, url: string) => {
    setPhotos(prev => ({ ...prev, [type]: url }));
  };

  const toggleDeviation = (view: string, deviation: string) => {
    setDeviations(prev => {
        const newDeviations = { ...prev };
        const viewDeviations = newDeviations[view] || [];

        if (viewDeviations.includes(deviation)) {
            newDeviations[view] = viewDeviations.filter(d => d !== deviation);
        } else {
            newDeviations[view] = [...viewDeviations, deviation];
        }
        return newDeviations;
    });
  };

  const clearDeviations = () => {
    setDeviations({});
  }

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
