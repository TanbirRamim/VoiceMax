
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    <Card className="shadow-lg border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center gap-2">
          <Lightbulb className="h-7 w-7" />
          Additional Insights
        </CardTitle>
        <CardDescription className="text-base pt-1">
          The AI also detected hints of the following:
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {suggestions.map((suggestion, index) => (
            <Badge key={index} variant="secondary" className="text-base px-4 py-1.5 bg-secondary/80 text-secondary-foreground border-secondary hover:bg-secondary">
              {suggestion}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
