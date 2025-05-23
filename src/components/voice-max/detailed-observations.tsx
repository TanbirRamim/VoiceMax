
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Thermometer, Sliders, Activity, ShieldCheck, Flame } from 'lucide-react'; 

interface DetailedObservationsProps {
  stressLevel: string | null;
  speechCharacteristics: string | null;
  confidenceLevel: string | null;
  vocalEnergy: string | null;
}

export function DetailedObservations({ stressLevel, speechCharacteristics, confidenceLevel, vocalEnergy }: DetailedObservationsProps) {
  if (!stressLevel && !speechCharacteristics && !confidenceLevel && !vocalEnergy) return null;

  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl text-primary flex items-center gap-2">
          <Activity className="h-6 w-6 sm:h-7 sm:w-7" />
          Detailed Observations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stressLevel && (
          <Alert variant="default" className="bg-card border-secondary/40">
            <Thermometer className="h-5 w-5 text-secondary" />
            <AlertTitle className="font-semibold text-secondary text-lg">Perceived Stress Level</AlertTitle>
            <AlertDescription className="text-base text-foreground/90 pt-1">
              {stressLevel}
            </AlertDescription>
          </Alert>
        )}
        {speechCharacteristics && (
          <Alert variant="default" className="bg-card border-accent/40">
            <Sliders className="h-5 w-5 text-accent" />
            <AlertTitle className="font-semibold text-accent text-lg">Speech Characteristics</AlertTitle>
            <AlertDescription className="text-base text-foreground/90 pt-1">
              {speechCharacteristics}
            </AlertDescription>
          </Alert>
        )}
        {confidenceLevel && (
          <Alert variant="default" className="bg-card border-blue-500/40"> {/* Using a distinct color */}
            <ShieldCheck className="h-5 w-5 text-blue-500" />
            <AlertTitle className="font-semibold text-blue-500 text-lg">Perceived Confidence</AlertTitle>
            <AlertDescription className="text-base text-foreground/90 pt-1">
              {confidenceLevel}
            </AlertDescription>
          </Alert>
        )}
        {vocalEnergy && (
          <Alert variant="default" className="bg-card border-orange-500/40"> {/* Using another distinct color */}
            <Flame className="h-5 w-5 text-orange-500" />
            <AlertTitle className="font-semibold text-orange-500 text-lg">Vocal Energy</AlertTitle>
            <AlertDescription className="text-base text-foreground/90 pt-1">
              {vocalEnergy}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
