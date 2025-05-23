'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCcw } from 'lucide-react';
import { AudioUploader } from '@/components/voice-max/audio-uploader';
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
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientLoaded, setClientLoaded] = useState(false);

  useEffect(() => {
    setClientLoaded(true);
  }, []);

  const handleFileChange = (file: File | null, dataUri: string | null) => {
    setAudioFile(file);
    setAudioDataUri(dataUri);
    setAnalysisResult(null); // Reset previous results
    setError(null); // Reset previous errors
  };

  const handleAnalyze = async () => {
    if (!audioDataUri || !audioFile) {
      setError('Please select an audio file first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // 1. Analyze primary emotion
      const emotionInput: AnalyzeAudioEmotionInput = { audioDataUri };
      const emotionOutput: AnalyzeAudioEmotionOutput = await analyzeAudioEmotion(emotionInput);
      const primaryEmotion = emotionOutput.primaryEmotion;

      if (!primaryEmotion) {
        throw new Error('Could not detect primary emotion.');
      }
      
      setAnalysisResult(prev => ({
        ...prev,
        primaryEmotion,
        suggestedEmotions: [], // Initialize
        feedbackText: '', // Initialize
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
      setError(err.message || 'An unknown error occurred during analysis.');
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setAudioFile(null);
    setAudioDataUri(null);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
    // Optionally, clear the file input visually if a ref is available
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
            Unlock the emotions hidden in your voice.
          </p>
        </header>

        <AudioUploader
          onFileChange={handleFileChange}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          currentError={error}
        />

        {isLoading && (
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
            <EmotionSuggestions suggestions={analysisResult.suggestedEmotions} />
            <FeedbackDisplay
              feedbackText={analysisResult.feedbackText}
              suggestion={analysisResult.feedbackSuggestion}
              primaryEmotion={analysisResult.primaryEmotion}
            />
             <Button onClick={resetState} variant="outline" className="w-full">
              <RefreshCcw className="mr-2 h-4 w-4" /> Analyze Another File
            </Button>
          </div>
        )}
        
        {/* Error display is handled within AudioUploader for file-related errors, 
            and analysis errors will clear results and show in AudioUploader too. 
            If a more general error display is needed, it can be added here. */}

      </main>
      <footer className="text-center mt-12 text-sm text-muted-foreground/70">
        <p>&copy; {new Date().getFullYear()} VoiceMax. Powered by Genkit AI.</p>
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
