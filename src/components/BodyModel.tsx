'use client';

import React from 'react';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { perimetriaPoints, skinfoldPoints, boneDiameterPoints } from '@/lib/data';

type Point = {
  top: string;
  left: string;
  label: string;
};

type BodyModelProps = {
  activeTab: 'perimetria' | 'dobras' | 'diametros' | null;
};

const pointData = {
    perimetria: perimetriaPoints,
    dobras: skinfoldPoints,
    diametros: boneDiameterPoints
};

const BodyModel: React.FC<BodyModelProps> = ({ activeTab }) => {
    const pointsToShow: Point[] = activeTab ? pointData[activeTab] : [];

    return (
        <TooltipProvider>
            <div className="relative w-full max-w-[300px] mx-auto">
                <Image
                    src="https://firebasestudio.ai/public-hosting/projects/2654/assets/8189/body-reference.png"
                    alt="Modelo Corporal para Medidas"
                    width={300}
                    height={750}
                    className="w-full h-auto"
                />
                {pointsToShow.map((point) => (
                    <Tooltip key={point.label}>
                        <TooltipTrigger asChild>
                            <div
                                className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2 cursor-pointer animate-pulse"
                                style={{ top: point.top, left: point.left }}
                            />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{point.label}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    );
};

export default BodyModel;
