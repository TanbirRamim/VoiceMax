
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
import { OpeningBuffer } from '@/components/voice-max/opening-buffer';

interface AnalysisResult {
  primaryEmotion: string;
  perceivedStressLevel: string;
  speechCharacteristics: string;
  perceivedConfidence: string;
  vocalEnergy: string;
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

  const handleRecordingComplete = (file: File | null, dataUri: string | null) => {
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
    

    try {
      // 1. Analyze primary emotion, stress, speech, confidence, and energy
      const emotionInput: AnalyzeAudioEmotionInput = { audioDataUri };
      const emotionOutput: AnalyzeAudioEmotionOutput = await analyzeAudioEmotion(emotionInput);
      const { primaryEmotion, perceivedStressLevel, speechCharacteristics, perceivedConfidence, vocalEnergy } = emotionOutput;

      if (!primaryEmotion) {
        throw new Error('Could not detect primary emotion.');
      }
      
      let currentResult: Partial<AnalysisResult> = {
        primaryEmotion,
        perceivedStressLevel,
        speechCharacteristics,
        perceivedConfidence,
        vocalEnergy,
        suggestedEmotions: [],
        feedbackText: '',
      };
      setAnalysisResult(currentResult as AnalysisResult); // Show partial results sooner

      // 2. Suggest additional emotions
      const suggestionsInput: SuggestAdditionalEmotionsInput = {
        primaryEmotion,
        audioAnalysisContext: `The primary emotion detected is "${primaryEmotion}". The voice also showed signs of "${perceivedStressLevel}" stress, speech characteristics were noted as "${speechCharacteristics}", perceived confidence as "${perceivedConfidence}", and vocal energy as "${vocalEnergy}". Consider nuances.`,
      };
      const suggestionsOutput: SuggestAdditionalEmotionsOutput = await suggestAdditionalEmotions(suggestionsInput);
      
      currentResult = {
        ...currentResult,
        suggestedEmotions: suggestionsOutput.suggestedEmotions || [],
      };
      setAnalysisResult(currentResult as AnalysisResult); // Update with more results

      // 3. Provide personalized feedback
      const feedbackInput: ProvidePersonalizedFeedbackInput = { emotion: primaryEmotion };
      const feedbackOutput: ProvidePersonalizedFeedbackOutput = await providePersonalizedFeedback(feedbackInput);

      currentResult = {
        ...currentResult,
        feedbackText: feedbackOutput.feedback,
        feedbackSuggestion: feedbackOutput.suggestion,
      };

      setAnalysisResult(currentResult as AnalysisResult);

    } catch (err: any) {
      console.error('Analysis failed:', err);
      let userFriendlyError = 'An unknown error occurred during analysis.';
      if (err.message) {
        if (err.message.includes('429 Too Many Requests') || err.message.includes('QuotaFailure') || err.message.includes('rate limit')) {
          userFriendlyError = 'Analysis failed due to API rate limits. You may have exceeded the free tier usage. Please try again in a few moments or check your Google Cloud project plan and billing details.';
        } else if (err.message.includes('400 Bad Request') || err.message.toLowerCase().includes('invalid argument')) {
          userFriendlyError = 'Analysis failed: The recorded audio might be too short, silent, corrupted, or in a format the AI could not process. Please try recording again clearly and for a few seconds.';
        } else {
          // Try to extract a more specific message if available, otherwise use the raw message
          const match = err.message.match(/\[\d{3} .*?\] (.*)/); 
          let extractedMessage = match && match[1] ? match[1].split('.')[0] : err.message;
          if (extractedMessage.length > 200) extractedMessage = "An error occurred during analysis. Please try again." // Cap length
          userFriendlyError = extractedMessage;
        }
      }
      setAnalysisError(userFriendlyError);
      setAnalysisResult(null); // Clear results on error
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

  return (
    <>
      <OpeningBuffer />
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-background text-foreground">
        
        {!clientLoaded && (
          <div className="fixed inset-0 flex items-center justify-center bg-background z-40">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
        )}

        {clientLoaded && (
          <>
            <main className="w-full max-w-2xl space-y-8 flex-grow">
              <header className="text-center space-y-2 pt-8 sm:pt-12">
                <h1 className="text-5xl sm:text-6xl font-bold text-primary tracking-tight">VoiceMax</h1>
                <p className="text-lg sm:text-xl text-muted-foreground">
                  Uncover the emotions in your voice. Gain insights, get feedback.
                </p>
              </header>

              <AudioRecorder
                onRecordingComplete={handleRecordingComplete}
                onAnalyzeRequest={handleAnalyzeRequest}
                isLoading={isLoading}
                analysisError={analysisError}
                parentAudioDataUri={audioDataUri} 
              />

              {isLoading && ( 
                <Card className="w-full shadow-xl border-primary/30">
                  <CardContent className="flex flex-col items-center justify-center p-10 space-y-4">
                    <Loader2 className="h-14 w-14 animate-spin text-primary" />
                    <p className="text-lg text-muted-foreground">Analyzing your voice...</p>
                    <p className="text-sm text-muted-foreground/80">This may take a moment, especially for the first analysis.</p>
                  </CardContent>
                </Card>
              )}

              {!isLoading && analysisResult && (
                <div className="space-y-6 animate-fadeIn pb-8">
                  <EmotionDisplay emotion={analysisResult.primaryEmotion} />
                  <DetailedObservations
                    stressLevel={analysisResult.perceivedStressLevel}
                    speechCharacteristics={analysisResult.speechCharacteristics}
                    confidenceLevel={analysisResult.perceivedConfidence}
                    vocalEnergy={analysisResult.vocalEnergy}
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
                  <Button onClick={resetState} variant="outline" className="w-full py-3 text-base hover:bg-primary/10 hover:border-primary">
                    <RefreshCcw className="mr-2 h-4 w-4" /> Record New Audio
                  </Button>
                </div>
              )}
            </main>
            <footer className="w-full max-w-2xl text-center py-6 text-sm text-muted-foreground">
              <p>An Initiative from Hackaburg 2025 | Team 2.1</p>
            </footer>
          </>
        )}
        
        <style jsx global>{`
          .animate-fadeIn {
            animation: fadeIn 0.7s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </>
  );
}
