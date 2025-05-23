'use client';

import type React from 'react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UploadCloud, FileAudio, AlertCircle } from 'lucide-react';

interface AudioUploaderProps {
  onFileChange: (file: File | null, dataUri: string | null) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  currentError?: string | null;
}

export function AudioUploader({ onFileChange, onAnalyze, isLoading, currentError }: AudioUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    await processFile(file);
  };

  const processFile = async (file: File | undefined | null) => {
    setLocalError(null); 
    if (file) {
      if (!file.type.startsWith('audio/')) {
        setLocalError('Invalid file type. Please upload an audio file.');
        setSelectedFile(null);
        onFileChange(null, null);
        return;
      }
      setSelectedFile(file);
      try {
        const dataUri = await fileToDataUri(file);
        onFileChange(file, dataUri);
      } catch (error) {
        console.error("Error converting file to data URI:", error);
        setLocalError('Error processing file. Please try again.');
        onFileChange(null, null);
      }
    } else {
      setSelectedFile(null);
      onFileChange(null, null);
    }
  }

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true); // Ensure isDragging is true
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    await processFile(file);
    if (fileInputRef.current) { // Sync with hidden input for consistency if needed
      const dataTransfer = new DataTransfer();
      if (file) dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <UploadCloud className="h-7 w-7 text-primary" />
          Upload Your Voice
        </CardTitle>
        <CardDescription>
          Select an audio file to analyze the emotions within.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-accent'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={isLoading ? undefined : openFileDialog}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openFileDialog();}}
        >
          <Input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
            disabled={isLoading}
          />
          <UploadCloud className={`h-12 w-12 mb-3 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
          <p className={`text-lg ${isDragging ? 'text-primary' : 'text-muted-foreground'}`}>
            {isDragging ? 'Drop your audio file here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Supported formats: MP3, WAV, M4A, etc.
          </p>
        </div>

        {selectedFile && !localError && (
          <div className="p-3 bg-secondary/30 rounded-md text-sm text-secondary-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileAudio className="h-5 w-5 text-accent" />
              <span>{selectedFile.name}</span>
            </div>
            <span className="text-xs">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
          </div>
        )}
        
        {(localError || currentError) && (
          <div className="p-3 bg-destructive/20 border border-destructive text-destructive rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{localError || currentError}</span>
          </div>
        )}

        <Button
          onClick={onAnalyze}
          disabled={!selectedFile || isLoading || !!localError || !!currentError}
          className="w-full text-lg py-6"
          size="lg"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Voice'}
        </Button>
      </CardContent>
    </Card>
  );
}
