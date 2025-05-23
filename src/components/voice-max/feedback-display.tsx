
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageCircle, Zap, Leaf, LifeBuoy } from 'lucide-react';

interface FeedbackDisplayProps {
  feedbackText: string | null;
  suggestion?: string | null;
  primaryEmotion?: string | null;
}

export function FeedbackDisplay({ feedbackText, suggestion, primaryEmotion }: FeedbackDisplayProps) {
  if (!feedbackText) return null;

  const isNegativeEmotionForExercise = primaryEmotion && ['sad', 'angry', 'anxious', 'fear', 'stressed', 'sorrow', 'irate', 'frustrated', 'worried', 'nervous', 'disappointed', 'gloomy', 'grief'].some(e => primaryEmotion.toLowerCase().includes(e));

  const showSeekSupportSection = isNegativeEmotionForExercise;

  return (
    <Card className="shadow-lg border-border/50 bg-card overflow-hidden">
      <CardHeader className="bg-card">
        <CardTitle className="text-xl sm:text-2xl text-primary flex items-center gap-2">
          <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
          Personalized Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
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

        {showSeekSupportSection && (
          <Alert variant="default" className="bg-destructive/10 border-destructive/50 text-foreground shadow-sm">
            <LifeBuoy className="h-5 w-5 text-destructive" />
            <AlertTitle className="font-semibold text-destructive text-lg">Support is Available</AlertTitle>
            <AlertDescription className="text-base text-foreground/90 pt-1 space-y-3">
              <p>It's okay to not be okay. If you're feeling overwhelmed or need someone to talk to, reaching out can make a difference.</p>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={() => window.open('https://www.google.com/search?q=free+mental+health+helpline+near+me', '_blank')}
              >
                <LifeBuoy className="mr-2 h-4 w-4" /> Find Support Resources
              </Button>
              <p className="text-xs text-muted-foreground pt-1">
                This will open a Google search for resources in your area. VoiceMax is not a replacement for professional advice.
              </p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
