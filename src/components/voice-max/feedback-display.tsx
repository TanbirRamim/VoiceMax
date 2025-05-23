'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, MessageCircle, Zap, Leaf } from 'lucide-react'; // Zap for suggestions, Leaf for breathing

interface FeedbackDisplayProps {
  feedbackText: string | null;
  suggestion?: string | null;
  primaryEmotion?: string | null;
}

export function FeedbackDisplay({ feedbackText, suggestion, primaryEmotion }: FeedbackDisplayProps) {
  if (!feedbackText) return null;

  const isPositiveFeedback = primaryEmotion && ['happy', 'joy', 'excited', 'content', 'pleased'].includes(primaryEmotion.toLowerCase());

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          Personalized Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant={isPositiveFeedback ? "default" : "default"} className={`${isPositiveFeedback ? 'bg-green-500/10 border-green-500/50 text-foreground' : 'bg-blue-500/10 border-blue-500/50 text-foreground'}`}>
          <Sparkles className={`h-5 w-5 ${isPositiveFeedback ? 'text-green-600' : 'text-blue-600'}`} />
          <AlertTitle className={`font-semibold ${isPositiveFeedback ? 'text-green-700' : 'text-blue-700'}`}>From Your Voice Analyst</AlertTitle>
          <AlertDescription className="text-base">
            {feedbackText}
          </AlertDescription>
        </Alert>

        {suggestion && (
          <Alert variant="default" className="bg-accent/10 border-accent/50 text-foreground">
             {(primaryEmotion && ['sad', 'angry', 'anxious', 'fear', 'stressed'].includes(primaryEmotion.toLowerCase())) ? 
                <Leaf className="h-5 w-5 text-accent" /> : 
                <Zap className="h-5 w-5 text-accent" />}
            <AlertTitle className="font-semibold text-accent-foreground">A Little Tip For You</AlertTitle>
            <AlertDescription className="text-base">
              {suggestion}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
