'use client';

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';

type Point = {
    top: string;
    left: string;
    label: string;
};

type BodyMeasurementChartProps = {
    points?: Point[];
};

const BodyMeasurementChart = ({ points = [] }: BodyMeasurementChartProps) => {
  return (
    <TooltipProvider>
      <div className="relative w-full h-[400px] flex items-center justify-center">
        <Image
          src="https://firebasestudio.ai/public-hosting/projects/2654/assets/4042/body-model.png"
          alt="Body model"
          width={150}
          height={400}
          className="h-full w-auto object-contain"
        />
        {points.map((point, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <div
                className="absolute w-3 h-3 rounded-full bg-red-500 border-2 border-white animate-pulse cursor-pointer"
                style={{ top: point.top, left: point.left, transform: 'translate(-50%, -50%)' }}
              ></div>
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

export default BodyMeasurementChart;
