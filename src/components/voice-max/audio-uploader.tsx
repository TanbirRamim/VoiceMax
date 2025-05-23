
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
    if (parentAudioDataUri === null) {
      setInternalRecordedFile(null);
      setInternalRecordedDataUri(null);
      setMicError(null);
      setIsAudioPlaying(false);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
      }
    }
  }, [parentAudioDataUri]);

  useEffect(() => {
    const audioElement = audioPlayerRef.current;
    if (audioElement) {
      const handleAudioPause = () => setIsAudioPlaying(false);
      const handleAudioEnded = () => setIsAudioPlaying(false);

      audioElement.addEventListener('pause', handleAudioPause);
      audioElement.addEventListener('ended', handleAudioEnded);

      return () => {
        audioElement.removeEventListener('pause', handleAudioPause);
        audioElement.removeEventListener('ended', handleAudioEnded);
      };
    }
  }, [internalRecordedDataUri]);


  const requestMicPermission = async (): Promise<boolean> => {
    setMicError(null);
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
      const errorMsg = 'Microphone access denied. Please enable it in your browser settings.';
      setMicError(errorMsg);
      toast({ variant: 'destructive', title: 'Microphone Access Denied', description: 'Please enable microphone permissions in your browser settings.' });
      setHasMicPermission(false);
      return false;
    }
  };

  const handleStartRecording = async () => {
    let permissionGranted = hasMicPermission;
    if (permissionGranted === null || permissionGranted === false) {
      permissionGranted = await requestMicPermission();
    }

    if (!permissionGranted || !audioStreamRef.current) {
      return;
    }

    setInternalRecordedFile(null);
    setInternalRecordedDataUri(null);
    setIsAudioPlaying(false);
    onRecordingComplete(null, null);

    audioChunksRef.current = [];

    const options = { mimeType: 'audio/webm' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.warn(`${options.mimeType} is not supported, trying audio/ogg`);
      options.mimeType = 'audio/ogg';
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.warn(`${options.mimeType} is not supported, trying default`);
        (options as any).mimeType = '';
      }
    }

    try {
      mediaRecorderRef.current = new MediaRecorder(audioStreamRef.current, options);
    } catch (e) {
      console.error("Error creating MediaRecorder:", e);
      setMicError("Failed to create audio recorder. Your browser might not support the available audio formats.");
      toast({ variant: 'destructive', title: 'Recording Error', description: "Could not initialize audio recorder." });
      return;
    }

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
      const fileName = `recording.${audioBlob.type.split('/')[1] || 'webm'}`;
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

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTogglePlayPauseRecording = () => {
    if (audioPlayerRef.current && internalRecordedDataUri) {
      if (isAudioPlaying) {
        audioPlayerRef.current.pause();
        setIsAudioPlaying(false);
      } else {
        // Ensure src is set before playing, especially if reset happened
        if (audioPlayerRef.current.src !== internalRecordedDataUri) {
            audioPlayerRef.current.src = internalRecordedDataUri;
        }
        audioPlayerRef.current.play().then(() => {
            setIsAudioPlaying(true);
        }).catch(e => {
            console.error("Error playing audio:", e);
            setIsAudioPlaying(false); // Reset state if play fails
            toast({variant: 'destructive', title: 'Playback Error', description: 'Could not play the audio.'})
        });
      }
    }
  };

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stream?.getTracks().forEach(track => track.stop());
      audioStreamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const displayError = micError || analysisError;

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Mic className="h-7 w-7 text-primary" />
          Record Your Voice
        </CardTitle>
        <CardDescription>
          Click "Start Recording" and speak into your microphone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          {!isRecording ? (
            <Button
              onClick={handleStartRecording}
              disabled={isLoading}
              className="w-full py-3 text-base"
              size="lg"
            >
              <Mic className="mr-2 h-5 w-5" />
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={handleStopRecording}
              variant="destructive"
              className="w-full py-3 text-base"
              size="lg"
            >
              <Square className="mr-2 h-5 w-5" />
              Stop Recording
            </Button>
          )}
          {isRecording && (
            <div className="flex items-center text-destructive animate-pulse">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Recording...
            </div>
          )}
        </div>

        {internalRecordedFile && internalRecordedDataUri && !isRecording && (
          <Card className="p-4 bg-secondary/20 border border-secondary">
            <CardTitle className="text-lg mb-2 flex items-center">
              <FileAudio className="h-5 w-5 mr-2 text-accent" />
              Recording Saved
            </CardTitle>
            <CardDescription className="text-sm mb-3">
              Your voice has been recorded. You can play it back or proceed to analysis.
            </CardDescription>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">{internalRecordedFile.name}</span>
              <span className="text-xs text-muted-foreground">({(internalRecordedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
            <audio ref={audioPlayerRef} className="hidden" />
            <Button onClick={handleTogglePlayPauseRecording} variant="outline" size="sm" className="w-full mb-3">
              {isAudioPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isAudioPlaying ? 'Pause Recording' : 'Play Recording'}
            </Button>
          </Card>
        )}

        {hasMicPermission === false && !micError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Microphone Access Required</AlertTitle>
            <AlertDescription>
              This app needs access to your microphone to record audio.
              Please enable microphone permissions in your browser settings and refresh the page.
            </AlertDescription>
          </Alert>
        )}

        {displayError && (
          <div className="p-3 bg-destructive/20 border border-destructive text-destructive rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{displayError}</span>
          </div>
        )}

        <Button
          onClick={onAnalyzeRequest}
          disabled={!internalRecordedDataUri || isLoading || !!micError || isRecording || isAudioPlaying}
          className="w-full text-lg py-6"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Voice'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
