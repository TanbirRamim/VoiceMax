
'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mic, Square, AlertCircle, FileAudio, Loader2, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface AudioRecorderProps {
  onRecordingComplete: (file: File | null, dataUri: string | null) => void;
  onAnalyzeRequest: () => void;
  isLoading: boolean;
  analysisError: string | null;
  parentAudioDataUri: string | null; // To detect reset from parent
}

export function AudioRecorder({
  onRecordingComplete,
  onAnalyzeRequest,
  isLoading,
  analysisError,
  parentAudioDataUri
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const [internalRecordedFile, setInternalRecordedFile] = useState<File | null>(null);
  const [internalRecordedDataUri, setInternalRecordedDataUri] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (parentAudioDataUri === null) { // Parent reset
      // 1. Reset UI states first
      setInternalRecordedFile(null);
      setInternalRecordedDataUri(null);
      setMicError(null);
      setIsAudioPlaying(false);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
      }
      setIsRecording(false); // Reset recording state early

      // 2. Stop active MediaRecorder if any (its onstop should handle its stream)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop(); 
        // onstop will handle stopping tracks of audioStreamRef and nullifying audioStreamRef
      }
      
      // 3. Clean up mediaRecorderRef itself and any independently held stream
      if (mediaRecorderRef.current) {
        // Stop tracks if mediaRecorder exists but wasn't recording, or as a safeguard
        mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
        mediaRecorderRef.current = null; // Nullify the recorder instance
      }

      // 4. Fallback cleanup for audioStreamRef if it was somehow orphaned
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
      }
    }
  }, [parentAudioDataUri]);

  useEffect(() => {
    const audioElement = audioPlayerRef.current;
    if (audioElement) {
      const handleAudioPlay = () => setIsAudioPlaying(true);
      const handleAudioPause = () => setIsAudioPlaying(false);
      const handleAudioEnded = () => setIsAudioPlaying(false);

      audioElement.addEventListener('play', handleAudioPlay);
      audioElement.addEventListener('pause', handleAudioPause);
      audioElement.addEventListener('ended', handleAudioEnded);

      return () => {
        audioElement.removeEventListener('play', handleAudioPlay);
        audioElement.removeEventListener('pause', handleAudioPause);
        audioElement.removeEventListener('ended', handleAudioEnded);
      };
    }
  }, [internalRecordedDataUri]);


  const requestMicPermission = async (): Promise<boolean> => {
    setMicError(null);

    // Ensure any previous stream from audioStreamRef is stopped.
    if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
    }
    // Ensure any stream associated with an old media recorder instance is stopped, and nullify the recorder.
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null; // Nullify old recorder instance
    }


    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError('Media devices API not available in this browser.');
      toast({ variant: 'destructive', title: 'Error', description: 'Audio recording is not supported by your browser.' });
      setHasMicPermission(false);
      return false;
    }
    try {
      audioStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      let errorMsg = 'Microphone access denied. Please enable it in your browser settings.';
      if (error instanceof Error && error.name === 'NotAllowedError') {
        errorMsg = 'Microphone access was denied. Please enable permissions in your browser settings and try again.';
      } else if (error instanceof Error && error.name === 'NotFoundError') {
        errorMsg = 'No microphone found. Please ensure a microphone is connected and enabled.';
      } else if (error instanceof Error) {
        errorMsg = `Could not access microphone: ${error.message}. Check browser settings.`;
      }
      setMicError(errorMsg);
      toast({ variant: 'destructive', title: 'Microphone Error', description: errorMsg });
      setHasMicPermission(false);
      return false;
    }
  };

  const handleStartRecording = async () => {
    // Reset file states and notify parent at the very beginning of a new recording attempt
    setInternalRecordedFile(null);
    setInternalRecordedDataUri(null);
    setIsAudioPlaying(false); // Stop playback if any
    if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
    }
    onRecordingComplete(null, null);

    const permissionAndStreamObtained = await requestMicPermission();

    if (!permissionAndStreamObtained || !audioStreamRef.current) {
      return;
    }

    audioChunksRef.current = [];

    let options = { mimeType: 'audio/webm' };
    if (MediaRecorder.isTypeSupported && !MediaRecorder.isTypeSupported(options.mimeType)) {
      console.warn(`${options.mimeType} is not supported, trying audio/ogg`);
      options.mimeType = 'audio/ogg';
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.warn(`${options.mimeType} is not supported, trying default`);
        (options as any).mimeType = ''; 
      }
    }

    try {
      // Ensure mediaRecorderRef is null before creating a new instance, requestMicPermission should handle this
      mediaRecorderRef.current = new MediaRecorder(audioStreamRef.current, options);
    } catch (e) {
      console.error("Error creating MediaRecorder:", e);
      const errorMsg = "Failed to create audio recorder. Your browser might not support the available audio formats or the microphone is already in use.";
      setMicError(errorMsg);
      toast({ variant: 'destructive', title: 'Recording Error', description: errorMsg });
      audioStreamRef.current?.getTracks().forEach(track => track.stop()); // Clean up acquired stream
      audioStreamRef.current = null;
      return;
    }

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
      const fileName = `recording.${audioBlob.type.split('/')[1]?.split(';')[0] || 'webm'}`;
      const file = new File([audioBlob], fileName, { type: audioBlob.type });

      setInternalRecordedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setInternalRecordedDataUri(dataUri);
        onRecordingComplete(file, dataUri);
        if (audioPlayerRef.current) {
          audioPlayerRef.current.src = dataUri;
        }
      };
      reader.onerror = (error) => {
        console.error("Error converting blob to data URI:", error);
        setMicError("Failed to process recorded audio.");
        toast({ variant: 'destructive', title: 'Processing Error', description: 'Could not process the recorded audio.' });
      };
      reader.readAsDataURL(audioBlob);

      audioStreamRef.current?.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    };
    
    mediaRecorderRef.current.onerror = (event: Event) => {
        console.error('MediaRecorder error:', event);
        let errorMsg = 'An error occurred with the media recorder.';
        if ('error' in event && event.error instanceof Error) {
            errorMsg = `MediaRecorder error: ${event.error.name} - ${event.error.message}`;
        }
        setMicError(errorMsg);
        toast({ variant: 'destructive', title: 'Recording Error', description: errorMsg });
        setIsRecording(false);
        audioStreamRef.current?.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
        mediaRecorderRef.current = null; // Nullify the failed recorder
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // onstop will handle track stopping and nullifying audioStreamRef
      setIsRecording(false);
    }
  };

  const handleTogglePlayPauseRecording = () => {
    if (audioPlayerRef.current && internalRecordedDataUri) {
      if (isAudioPlaying) {
        audioPlayerRef.current.pause();
      } else {
        if (audioPlayerRef.current.src !== internalRecordedDataUri) {
            audioPlayerRef.current.src = internalRecordedDataUri;
        }
        audioPlayerRef.current.play().catch(e => {
            console.error("Error playing audio:", e);
            toast({variant: 'destructive', title: 'Playback Error', description: 'Could not play the audio.'})
        });
      }
    }
  };

  useEffect(() => {
    return () => {
      // General cleanup for the component when it unmounts.
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current?.stream?.getTracks().forEach(track => track.stop());
      audioStreamRef.current?.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
      audioStreamRef.current = null;
    };
  }, []);

  const displayError = micError || analysisError;

  return (
    <Card className="w-full shadow-xl border-primary/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-2xl text-primary">
          <Mic className="h-7 w-7" />
          Record Your Voice
        </CardTitle>
        <CardDescription className="text-base">
          Click "Start Recording", speak clearly, and then click "Stop Recording".
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        <div className="flex flex-col items-center space-y-4">
          {!isRecording ? (
            <Button
              onClick={handleStartRecording}
              disabled={isLoading || isAudioPlaying}
              className="w-full py-3 text-lg"
              size="lg"
            >
              <Mic className="mr-2 h-5 w-5" />
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={handleStopRecording}
              variant="destructive"
              className="w-full py-3 text-lg"
              size="lg"
            >
              <Square className="mr-2 h-5 w-5" />
              Stop Recording
            </Button>
          )}
          {isRecording && (
            <div className="flex items-center text-red-500 animate-pulse font-medium">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Recording...
            </div>
          )}
        </div>

        {internalRecordedFile && internalRecordedDataUri && !isRecording && (
          <Card className="p-4 bg-card border border-border/50">
            <CardTitle className="text-lg mb-2 flex items-center text-foreground">
              <FileAudio className="h-5 w-5 mr-2 text-accent" />
              Your Recording
            </CardTitle>
            <CardDescription className="text-sm mb-3 text-muted-foreground">
              Listen to your recording or proceed with analysis.
            </CardDescription>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground truncate pr-2">{internalRecordedFile.name}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">({(internalRecordedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
            <audio ref={audioPlayerRef} className="hidden" />
            <Button 
              onClick={handleTogglePlayPauseRecording} 
              variant="outline" 
              size="sm" 
              className="w-full mb-3 hover:bg-accent/10 hover:text-accent-foreground"
              disabled={isLoading}
            >
              {isAudioPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isAudioPlaying ? 'Pause Recording' : 'Play Recording'}
            </Button>
          </Card>
        )}

        {hasMicPermission === false && !micError && ( 
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Microphone Access Required</AlertTitle>
            <AlertDescription>
              This app needs access to your microphone. Please enable it in your browser settings and refresh or try again.
            </AlertDescription>
          </Alert>
        )}

        {displayError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>An Error Occurred</AlertTitle>
            <AlertDescription>{displayError}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={onAnalyzeRequest}
          disabled={!internalRecordedDataUri || isLoading || !!micError || isRecording || isAudioPlaying}
          className="w-full text-xl py-6"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-3 h-6 w-6 animate-spin" />
              Analyzing Voice...
            </>
          ) : (
            'Analyze Voice'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
    
