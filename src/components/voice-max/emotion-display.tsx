
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getEmotionIcon } from './icons';

interface EmotionDisplayProps {
  emotion: string | null;
}

export function EmotionDisplay({ emotion }: EmotionDisplayProps) {
  if (!emotion) return null;

  const IconComponent = getEmotionIcon(emotion);

  return (
    <Card className="shadow-xl border-accent bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl text-primary">Primary Emotion Detected</CardTitle>
      </CardHeader>
      <CardContent className="text-center py-6 sm:py-8">
        <IconComponent
          className="h-24 w-24 sm:h-28 sm:w-28 mx-auto mb-4 text-accent"
          strokeWidth={1.5}
          aria-label={`${emotion} icon`}
        />
        <p className="text-4xl sm:text-5xl font-semibold capitalize text-foreground">{emotion}</p>
      </CardContent>
    </Card>
  );
}
