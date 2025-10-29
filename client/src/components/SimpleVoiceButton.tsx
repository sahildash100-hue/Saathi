import { useState } from 'react';

import { getApiUrl } from '../config';
import { Button } from './ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function SimpleVoiceButton() {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [transcription, setTranscription] = useState('');
  const queryClient = useQueryClient();

  const transcribeMutation = useMutation({
    mutationFn: async (audioFile: File) => {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('file', audioFile);

      const res = await fetch(getApiUrl('/voice/command'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Transcription failed');
      return res.json();
    },
    onSuccess: async (data) => {
      setTranscription(data.text);
      
      // If transcription contains reminder-like text, create a reminder
      if (data.text) {
        const token = localStorage.getItem('auth_token');
        await fetch(getApiUrl('/reminders'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: data.text,
            isVoiceCommand: true,
          }),
        });
        
        queryClient.invalidateQueries({ queryKey: ['reminders'] });
      }
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioFile = new File([blob], 'recording.webm', {
          type: 'audio/webm',
        });
        transcribeMutation.mutate(audioFile);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setTranscription('');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            size="lg"
            className="h-24 w-24 rounded-full bg-primary hover:bg-primary/90"
          >
            <Mic className="h-12 w-12" />
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            size="lg"
            variant="destructive"
            className="h-24 w-24 rounded-full animate-pulse"
          >
            <MicOff className="h-12 w-12" />
          </Button>
        )}
      </div>

      {isRecording && (
        <p className="text-lg font-semibold text-destructive animate-pulse">
          Recording... Click again to stop
        </p>
      )}

      {transcribeMutation.isPending && (
        <p className="text-muted-foreground">Transcribing your voice...</p>
      )}

      {transcription && (
        <div className="mt-4 p-4 bg-secondary rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">You said:</p>
          <p className="text-lg font-medium">{transcription}</p>
        </div>
      )}

      {transcribeMutation.isError && (
        <p className="text-destructive">Failed to transcribe audio</p>
      )}
    </div>
  );
}

