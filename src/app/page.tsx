
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCcw } from 'lucide-react';
import { AudioRecorder } from '@/components/voice-max/audio-uploader'; // Renamed for clarity
import { EmotionDisplay } from '@/components/voice-max/emotion-display';
import { EmotionSuggestions } from '@/components/voice-max/emotion-suggestions';
import { FeedbackDisplay } from '@/components/voice-max/feedback-display';
import { analyzeAudioEmotion, AnalyzeAudioEmotionInput, AnalyzeAudioEmotionOutput } from '@/ai/flows/analyze-audio-emotion';
import { suggestAdditionalEmotions, SuggestAdditionalEmotionsInput, SuggestAdditionalEmotionsOutput } from '@/ai/flows/suggest-additional-emotions';
import { providePersonalizedFeedback, ProvidePersonalizedFeedbackInput, ProvidePersonalizedFeedbackOutput } from '@/ai/flows/provide-personalized-feedback';
import { Card, CardContent } from '@/components/ui/card';

interface AnalysisResult {
  primaryEmotion: string;
  suggestedEmotions: string[];
  feedbackText: string;
  feedbackSuggestion?: string;
}

export default function VoiceMaxPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null); // Will hold the recorded audio File object
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null); // Will hold the recorded audio data URI
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
    setAnalysisResult(null); // Reset previous results
    setAnalysisError(null); // Reset previous errors
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
      // 1. Analyze primary emotion
      const emotionInput: AnalyzeAudioEmotionInput = { audioDataUri };
      const emotionOutput: AnalyzeAudioEmotionOutput = await analyzeAudioEmotion(emotionInput);
      const primaryEmotion = emotionOutput.primaryEmotion;

      if (!primaryEmotion) {
        throw new Error('Could not detect primary emotion.');
      }
      
      // Set intermediate result for primary emotion first
      setAnalysisResult(prev => ({
        primaryEmotion,
        suggestedEmotions: [], 
        feedbackText: '',
        ...(prev || {}) // Spread previous if it existed, though it's reset above
      }));

      // 2. Suggest additional emotions
      const suggestionsInput: SuggestAdditionalEmotionsInput = {
        primaryEmotion,
        audioAnalysisContext: `The primary emotion detected from the audio recording is "${primaryEmotion}". Consider the nuances that might accompany this emotion in spoken voice.`,
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
      setAnalysisError(err.message || 'An unknown error occurred during analysis.');
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setAudioFile(null);
    setAudioDataUri(null); // This will trigger reset in AudioRecorder via prop
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
            Record your voice to unlock hidden emotions.
          </p>
        </header>

        <AudioRecorder
          onRecordingComplete={handleRecordingComplete}
          onAnalyzeRequest={handleAnalyzeRequest}
          isLoading={isLoading}
          analysisError={analysisError}
          parentAudioDataUri={audioDataUri} // Used to trigger reset in child
        />

        {isLoading && !analysisResult && ( // Show loading only if no partial results yet
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
      <footer className="text-center mt-12 text-sm text-muted-foreground/70">
        
      </footer>
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
