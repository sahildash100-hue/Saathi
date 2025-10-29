import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

export default function VoiceNavButton() {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const queryClient = useQueryClient();

  const transcribeMutation = useMutation({
    mutationFn: async (audioFile: File) => {
      setIsTranscribing(true);
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('file', audioFile);

      const res = await fetch('http://localhost:3000/api/voice/command', {
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
      if (data.text) {
        // Show dialog asking if user wants to create a reminder
        setTranscriptionText(data.text);
        setShowReminderDialog(true);
      }
    },
    onError: () => {
      setIsTranscribing(false);
    },
    onSettled: () => {
      setIsTranscribing(false);
    }
  });

  const startRecording = async () => {
    if (isTranscribing) return; // Prevent tapping during transcription
    
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

        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
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

  const createReminder = async () => {
    const token = localStorage.getItem('auth_token');
    
    // Combine date and time if both are provided
    let scheduledDateTime = undefined;
    if (scheduledDate && scheduledTime) {
      scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    }
    
    await fetch('http://localhost:3000/api/reminders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: transcriptionText,
        isVoiceCommand: true,
        scheduledTime: scheduledDateTime,
      }),
    });
    queryClient.invalidateQueries({ queryKey: ['reminders'] });
    setShowReminderDialog(false);
    setTranscriptionText('');
    setScheduledDate('');
    setScheduledTime('');
  };

  const cancelReminder = () => {
    setShowReminderDialog(false);
    setTranscriptionText('');
    setScheduledDate('');
    setScheduledTime('');
  };

  return (
    <>
      <Button
        size="icon"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isTranscribing}
        className={`rounded-full relative w-12 h-12 ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
        } ${isTranscribing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isTranscribing ? (
          <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        ) : isRecording ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
        {isRecording && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
        )}
      </Button>

      {showReminderDialog && createPortal(
        (
        <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Create Reminder?</DialogTitle>
              <DialogDescription className="text-base">
                Would you like to save this as a reminder?
              </DialogDescription>
            </DialogHeader>
            
          <div className="py-4 space-y-4">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mb-2">
                Your voice message:
              </p>
              <p className="text-base text-slate-900 dark:text-slate-100 italic">
                "{transcriptionText}"
              </p>
            </div>
            
            {/* Schedule Option */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                ⏰ Schedule this reminder? (Optional)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">
                    📅 Choose Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScheduledDate(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-base text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ colorScheme: 'light dark' }}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block font-semibold">
                    ⏰ Choose Time
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScheduledTime(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-base text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ colorScheme: 'light dark' }}
                  />
                </div>
              </div>
              {scheduledDate && scheduledTime && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  📅 Scheduled: {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={cancelReminder}
                className="text-base px-6 h-11"
              >
                No, Skip
              </Button>
              <Button
                onClick={createReminder}
                className="text-base px-6 h-11 bg-emerald-600 hover:bg-emerald-700"
              >
                Yes, Save Reminder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        ),
        document.body
      )}
    </>
  );
}

