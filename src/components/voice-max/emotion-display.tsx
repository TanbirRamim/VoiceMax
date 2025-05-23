'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getEmotionIcon } from './icons';
import type { LucideProps } from 'lucide-react';

interface EmotionDisplayProps {
  emotion: string | null;
}

export function EmotionDisplay({ emotion }: EmotionDisplayProps) {
  if (!emotion) return null;

  const IconComponent = getEmotionIcon(emotion);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Detected Primary Emotion</CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        <IconComponent
          className="h-20 w-20 mx-auto mb-4 text-accent"
          strokeWidth={1.5}
          aria-label={`${emotion} icon`}
        />
        <p className="text-4xl font-semibold capitalize">{emotion}</p>
      </CardContent>
    </Card>
  );
}
