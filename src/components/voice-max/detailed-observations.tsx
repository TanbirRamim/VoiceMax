
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
          <Alert variant="default" className="bg-purple-500/10 border-purple-500/50">
            <Thermometer className="h-5 w-5 text-purple-600" />
            <AlertTitle className="font-semibold text-purple-700">Perceived Stress Level</AlertTitle>
            <AlertDescription className="text-base text-foreground">
              {stressLevel}
            </AlertDescription>
          </Alert>
        )}
        {speechCharacteristics && (
          <Alert variant="default" className="bg-indigo-500/10 border-indigo-500/50">
            <Sliders className="h-5 w-5 text-indigo-600" />
            <AlertTitle className="font-semibold text-indigo-700">Speech Characteristics</AlertTitle>
            <AlertDescription className="text-base text-foreground">
              {speechCharacteristics}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
