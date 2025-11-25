'use client';

import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { muscleMappings } from '@/lib/postural-data';
import { muscleSvgs } from '@/lib/muscle-svgs';
import { Button } from './ui/button';

type Deviations = { [key: string]: string[] };

interface BodyModelProps {
    deviations: Deviations;
}

type MuscleStatus = 'normal' | 'encurtado' | 'alongado';
type MuscleStates = { [key: string]: MuscleStatus };

const BodyModel: React.FC<BodyModelProps> = ({ deviations }) => {
    const [view, setView] = useState<'front' | 'back'>('front');

    const getMuscleStates = (): MuscleStates => {
        const states: MuscleStates = {};
        const allDeviations = Object.values(deviations).flat();

        for (const deviation of allDeviations) {
            const mapping = muscleMappings[deviation];
            if (mapping) {
                mapping.encurtados.forEach(muscle => {
                    states[muscle] = 'encurtado';
                });
                mapping.alongados.forEach(muscle => {
                    // An 'encurtado' state has priority over 'alongado' if a muscle is in both lists from different deviations
                    if (states[muscle] !== 'encurtado') {
                        states[muscle] = 'alongado';
                    }
                });
            }
        }
        return states;
    };

    const muscleStates = getMuscleStates();

    const getMuscleColor = (status: MuscleStatus | undefined) => {
        switch (status) {
            case 'encurtado':
                return 'fill-red-500/80'; // Red for shortened
            case 'alongado':
                return 'fill-blue-500/80'; // Blue for lengthened
            default:
                return 'fill-gray-400/30'; // Neutral
        }
    };
    
    const renderMuscles = (side: 'front' | 'back') => {
        return muscleSvgs[side].map(muscle => {
            const status = muscleStates[muscle.name];
            return (
                <Tooltip key={muscle.id}>
                    <TooltipTrigger asChild>
                        <path
                            d={muscle.d}
                            className={cn(
                                'transition-colors duration-300 stroke-gray-600/50 stroke-1',
                                getMuscleColor(status),
                                'hover:fill-yellow-400/80'
                            )}
                        />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{muscle.name}{status ? ` (${status})` : ''}</p>
                    </TooltipContent>
                </Tooltip>
            );
        });
    };

    return (
        <TooltipProvider>
            <div className="flex flex-col items-center">
                <div className="relative w-full max-w-[250px] mx-auto">
                    <svg viewBox="0 0 200 400" className="w-full h-auto">
                        {view === 'front' ? renderMuscles('front') : renderMuscles('back')}
                    </svg>
                </div>
                 <div className="flex gap-2 mt-4">
                    <Button onClick={() => setView('front')} variant={view === 'front' ? 'default' : 'outline'}>
                        Frente
                    </Button>
                    <Button onClick={() => setView('back')} variant={view === 'back' ? 'default' : 'outline'}>
                        Costas
                    </Button>
                </div>
                 <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-xs justify-center">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <span>Encurtado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500/80"></div>
                        <span>Alongado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400/30"></div>
                        <span>Normal</span>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
};

export default BodyModel;
