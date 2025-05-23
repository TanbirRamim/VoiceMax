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
        <Alert variant="default" className="bg-teal-600/15 border-teal-500/30 hover:bg-teal-600/20 transition-colors">
          <Sparkles className="h-5 w-5 text-teal-300" />
          <AlertTitle className="font-semibold text-teal-200">From Your Voice Analyst</AlertTitle>
          <AlertDescription className="text-base text-teal-100 font-medium leading-relaxed tracking-wide">
            {feedbackText}
          </AlertDescription>
        </Alert>

        {suggestion && (
          <Alert variant="default" className="bg-amber-600/15 border-amber-500/30 hover:bg-amber-600/20 transition-colors">
             {(primaryEmotion && ['sad', 'angry', 'anxious', 'fear', 'stressed'].includes(primaryEmotion.toLowerCase())) ? 
                <Leaf className="h-5 w-5 text-amber-300" /> : 
                <Zap className="h-5 w-5 text-amber-300" />}
            <AlertTitle className="font-semibold text-amber-200">A Little Tip For You</AlertTitle>
            <AlertDescription className="text-base text-amber-100 font-medium leading-relaxed tracking-wide">
              {suggestion}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
