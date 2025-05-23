
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Thermometer, Sliders, Activity } from 'lucide-react'; 

interface DetailedObservationsProps {
  stressLevel: string | null;
  speechCharacteristics: string | null;
}

export function DetailedObservations({ stressLevel, speechCharacteristics }: DetailedObservationsProps) {
  if (!stressLevel && !speechCharacteristics) return null;

  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center gap-2">
          <Activity className="h-7 w-7" />
          Detailed Observations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stressLevel && (
          <Alert variant="default" className="bg-card border-secondary/40">
            <Thermometer className="h-5 w-5 text-secondary" />
            <AlertTitle className="font-semibold text-secondary">Perceived Stress Level</AlertTitle>
            <AlertDescription className="text-base text-foreground/90">
              {stressLevel}
            </AlertDescription>
          </Alert>
        )}
        {speechCharacteristics && (
          <Alert variant="default" className="bg-card border-accent/40">
            <Sliders className="h-5 w-5 text-accent" />
            <AlertTitle className="font-semibold text-accent">Speech Characteristics</AlertTitle>
            <AlertDescription className="text-base text-foreground/90">
              {speechCharacteristics}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
