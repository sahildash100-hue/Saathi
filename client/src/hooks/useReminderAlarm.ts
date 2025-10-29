import { useEffect, useRef } from 'react';

interface Reminder {
  _id: string;
  scheduledTime?: string;
  completed: boolean;
  text: string;
}

export function useReminderAlarm(reminders: Reminder[]) {
  const alertedRemindersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Speak the reminder text using Web Speech API
    const speakReminder = (text: string) => {
      // Create a friendly greeting before reading the reminder
      const message = `Reminder. ${text}`;
      const utterance = new SpeechSynthesisUtterance(message);
      
      // Speech settings optimized for clarity
      utterance.rate = 0.85; // Slightly slower for senior users
      utterance.pitch = 1.0; // Normal pitch
      utterance.volume = 1.0; // Full volume
      
      // Use a more natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || voice.name.includes('Samantha')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // Cancel any ongoing speech to avoid overlapping
      window.speechSynthesis.cancel();
      
      // Speak the reminder
      window.speechSynthesis.speak(utterance);
    };

    const checkScheduledReminders = () => {
      const now = new Date().getTime();

      reminders.forEach(reminder => {
        // Skip if already alerted or no scheduled time or completed
        if (
          !reminder.scheduledTime ||
          reminder.completed ||
          alertedRemindersRef.current.has(reminder._id)
        ) {
          return;
        }

        const scheduledTime = new Date(reminder.scheduledTime).getTime();
        
        // Only trigger if we are at or past the scheduled time (not before)
        if (now >= scheduledTime) {
          const timeSinceScheduled = now - scheduledTime;
          
          // Trigger alarm if within 5 minutes of scheduled time (in case app was closed)
          if (timeSinceScheduled < 300000) {
            // Check if we already alerted this reminder
            if (!alertedRemindersRef.current.has(reminder._id)) {
              // Mark as alerted first to prevent multiple alerts
              alertedRemindersRef.current.add(reminder._id);
              
              // Speak the reminder text
              speakReminder(reminder.text);

              // Show browser notification if permission granted
              if (Notification.permission === 'granted') {
                new Notification('🔔 Reminder', {
                  body: reminder.text,
                  icon: '/favicon.png',
                  tag: reminder._id,
                });
              } else if (Notification.permission !== 'denied') {
                // Request permission
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    new Notification('🔔 Reminder', {
                      body: reminder.text,
                      icon: '/favicon.png',
                      tag: reminder._id,
                    });
                  }
                });
              }

              console.log('🔔 Reminder spoken:', reminder.text, 'at', new Date().toLocaleTimeString());
            }
          }
        }
      });
    };

    // Check every 10 seconds for scheduled reminders (more frequent checks)
    const interval = setInterval(checkScheduledReminders, 10000);

    return () => {
      clearInterval(interval);
      // Cancel any ongoing speech when component unmounts
      window.speechSynthesis.cancel();
    };
  }, [reminders]);
}

