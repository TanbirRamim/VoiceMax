'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Activity, BarChart3, Thermometer, Sliders } from 'lucide-react'; // Using Thermometer for stress, Sliders for characteristics

interface DetailedObservationsProps {
  stressLevel: string | null;
  speechCharacteristics: string | null;
}

export function DetailedObservations({ stressLevel, speechCharacteristics }: DetailedObservationsProps) {
  if (!stressLevel && !speechCharacteristics) return null;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          <Activity className="h-6 w-6" />
          Detailed Observations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stressLevel && (
          <Alert variant="default" className="bg-lime-500/20 border-lime-400/40">
            <Thermometer className="h-5 w-5 text-lime-400" />
            <AlertTitle className="font-semibold text-lime-300">Perceived Stress Level</AlertTitle>
            <AlertDescription className="text-base text-lime-200 font-medium leading-relaxed tracking-wide">
              {stressLevel}
            </AlertDescription>
          </Alert>
        )}
        {speechCharacteristics && (
          <Alert variant="default" className="bg-violet-500/20 border-violet-400/40">
            <Sliders className="h-5 w-5 text-violet-400" />
            <AlertTitle className="font-semibold text-violet-300">Speech Characteristics</AlertTitle>
            <AlertDescription className="text-base text-violet-200 font-medium leading-relaxed tracking-wide">
              {speechCharacteristics}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
