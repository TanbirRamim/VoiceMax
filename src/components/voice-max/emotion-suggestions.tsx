'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';

interface EmotionSuggestionsProps {
  suggestions: string[] | null;
}

export function EmotionSuggestions({ suggestions }: EmotionSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          <Lightbulb className="h-6 w-6" />
          Additional Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-muted-foreground">You might also be feeling hints of:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <Badge key={index} variant="secondary" className="text-base px-3 py-1 bg-accent/20 text-accent-foreground border-accent">
              {suggestion}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
