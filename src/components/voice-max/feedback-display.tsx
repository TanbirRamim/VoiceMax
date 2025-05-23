
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, MessageCircle, Zap, Leaf } from 'lucide-react';

interface FeedbackDisplayProps {
  feedbackText: string | null;
  suggestion?: string | null;
  primaryEmotion?: string | null;
}

export function FeedbackDisplay({ feedbackText, suggestion, primaryEmotion }: FeedbackDisplayProps) {
  if (!feedbackText) return null;

  const isNegativeEmotionForExercise = primaryEmotion && ['sad', 'angry', 'anxious', 'fear', 'stressed', 'sorrow', 'irate', 'frustrated', 'worried', 'nervous'].some(e => primaryEmotion.toLowerCase().includes(e));

  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center gap-2">
          <MessageCircle className="h-7 w-7" />
          Personalized Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Alert variant="default" className="bg-card border-primary/30 shadow-sm">
          <Sparkles className="h-5 w-5 text-primary" />
          <AlertTitle className="font-semibold text-primary text-lg">From Your Voice Analyst</AlertTitle>
          <AlertDescription className="text-base text-foreground/90 pt-1">
            {feedbackText}
          </AlertDescription>
        </Alert>

        {suggestion && (
          <Alert variant="default" className="bg-accent/10 border-accent/50 text-foreground shadow-sm">
             {isNegativeEmotionForExercise ? 
                <Leaf className="h-5 w-5 text-accent" /> : 
                <Zap className="h-5 w-5 text-accent" />}
            <AlertTitle className="font-semibold text-accent text-lg">A Little Tip For You</AlertTitle>
            <AlertDescription className="text-base text-foreground/90 pt-1">
              {suggestion}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
