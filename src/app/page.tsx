
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCcw } from 'lucide-react';
import { AudioRecorder } from '@/components/voice-max/audio-uploader';
import { EmotionDisplay } from '@/components/voice-max/emotion-display';
import { DetailedObservations } from '@/components/voice-max/detailed-observations';
import { EmotionSuggestions } from '@/components/voice-max/emotion-suggestions';
import { FeedbackDisplay } from '@/components/voice-max/feedback-display';
import { analyzeAudioEmotion, AnalyzeAudioEmotionInput, AnalyzeAudioEmotionOutput } from '@/ai/flows/analyze-audio-emotion';
import { suggestAdditionalEmotions, SuggestAdditionalEmotionsInput, SuggestAdditionalEmotionsOutput } from '@/ai/flows/suggest-additional-emotions';
import { providePersonalizedFeedback, ProvidePersonalizedFeedbackInput, ProvidePersonalizedFeedbackOutput } from '@/ai/flows/provide-personalized-feedback';
import { Card, CardContent } from '@/components/ui/card';

interface AnalysisResult {
  primaryEmotion: string;
  perceivedStressLevel: string;
  speechCharacteristics: string;
  suggestedEmotions: string[];
  feedbackText: string;
  feedbackSuggestion?: string;
}

export default function VoiceMaxPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [clientLoaded, setClientLoaded] = useState(false);

  useEffect(() => {
    setClientLoaded(true);
  }, []);

  const handleRecordingComplete = (file: File, dataUri: string) => {
    setAudioFile(file);
    setAudioDataUri(dataUri);
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  const handleAnalyzeRequest = async () => {
    if (!audioDataUri || !audioFile) {
      setAnalysisError('No recording available to analyze.');
      return;
    }

    setIsLoading(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      // 1. Analyze primary emotion, stress, and speech
      const emotionInput: AnalyzeAudioEmotionInput = { audioDataUri };
      const emotionOutput: AnalyzeAudioEmotionOutput = await analyzeAudioEmotion(emotionInput);
      const { primaryEmotion, perceivedStressLevel, speechCharacteristics } = emotionOutput;

      if (!primaryEmotion) {
        throw new Error('Could not detect primary emotion.');
      }
      
      setAnalysisResult(prev => ({
        primaryEmotion,
        perceivedStressLevel,
        speechCharacteristics,
        suggestedEmotions: [], 
        feedbackText: '',
        ...(prev || {}) 
      }));

      // 2. Suggest additional emotions
      const suggestionsInput: SuggestAdditionalEmotionsInput = {
        primaryEmotion,
        audioAnalysisContext: `The primary emotion detected is "${primaryEmotion}". The voice also showed signs of "${perceivedStressLevel}" stress, and speech characteristics were noted as "${speechCharacteristics}". Consider nuances.`,
      };
      const suggestionsOutput: SuggestAdditionalEmotionsOutput = await suggestAdditionalEmotions(suggestionsInput);
      
      setAnalysisResult(prev => ({
        ...prev!,
        suggestedEmotions: suggestionsOutput.suggestedEmotions || [],
      }));

      // 3. Provide personalized feedback
      const feedbackInput: ProvidePersonalizedFeedbackInput = { emotion: primaryEmotion };
      const feedbackOutput: ProvidePersonalizedFeedbackOutput = await providePersonalizedFeedback(feedbackInput);

      setAnalysisResult(prev => ({
        ...prev!,
        feedbackText: feedbackOutput.feedback,
        feedbackSuggestion: feedbackOutput.suggestion,
      }));

    } catch (err: any) {
      console.error('Analysis failed:', err);
      let userFriendlyError = 'An unknown error occurred during analysis.';
       if (err.message && (err.message.includes('429 Too Many Requests') || err.message.includes('QuotaFailure') || err.message.includes('rate limit'))) {
        userFriendlyError = 'Analysis failed due to API rate limits. You may have exceeded the free tier usage. Please try again in a few moments or check your Google Cloud project plan and billing details.';
      } else if (err.message) {
        const match = err.message.match(/\[\d{3} .*?\] (.*)/);
        userFriendlyError = match && match[1] ? match[1].split('.')[0] : err.message;
      }
      setAnalysisError(userFriendlyError);
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setAudioFile(null);
    setAudioDataUri(null); 
    setAnalysisResult(null);
    setAnalysisError(null);
    setIsLoading(false);
  };

  if (!clientLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-background text-foreground">
      <main className="w-full max-w-2xl space-y-8">
        <header className="text-center">
          <h1 className="text-5xl font-bold text-primary mb-2 tracking-tight">VoiceMax</h1>
          <p className="text-xl text-muted-foreground">
            Record your voice to unlock hidden emotions and insights.
          </p>
        </header>

        <AudioRecorder
          onRecordingComplete={handleRecordingComplete}
          onAnalyzeRequest={handleAnalyzeRequest}
          isLoading={isLoading}
          analysisError={analysisError}
          parentAudioDataUri={audioDataUri} 
        />

        {isLoading && !analysisResult && ( 
          <Card className="w-full shadow-lg">
            <CardContent className="flex flex-col items-center justify-center p-10 space-y-3">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Analyzing your voice... this may take a moment.</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && analysisResult && (
          <div className="space-y-6 animate-fadeIn">
            <EmotionDisplay emotion={analysisResult.primaryEmotion} />
            <DetailedObservations
              stressLevel={analysisResult.perceivedStressLevel}
              speechCharacteristics={analysisResult.speechCharacteristics}
            />
            {analysisResult.suggestedEmotions && analysisResult.suggestedEmotions.length > 0 && (
              <EmotionSuggestions suggestions={analysisResult.suggestedEmotions} />
            )}
            {analysisResult.feedbackText && (
              <FeedbackDisplay
                feedbackText={analysisResult.feedbackText}
                suggestion={analysisResult.feedbackSuggestion}
                primaryEmotion={analysisResult.primaryEmotion}
              />
            )}
             <Button onClick={resetState} variant="outline" className="w-full">
              <RefreshCcw className="mr-2 h-4 w-4" /> Record New Audio
            </Button>
          </div>
        )}
        
      </main>
      
      <style jsx global>{`
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
