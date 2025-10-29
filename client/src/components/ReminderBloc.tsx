import { useState } from 'react';
import { Trash2, Bell, ChevronDown, ChevronUp, Volume2 } from 'lucide-react';
import { Button } from './ui/button';

interface Reminder {
  _id: string;
  text: string;
  timestamp: string;
  scheduledTime?: string;
  isVoiceCommand: boolean;
}

interface ReminderBlocProps {
  reminders: Reminder[];
  onRemove: (id: string) => void;
}

export default function ReminderBloc({ reminders, onRemove }: ReminderBlocProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume
    window.speechSynthesis.speak(utterance);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-72 h-96 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white flex flex-col shadow-xl border border-green-400/30">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6" />
          <h3 className="text-2xl font-bold">Reminders</h3>
        </div>
        <span className="bg-white/20 backdrop-blur-sm text-base px-3 py-1.5 rounded-full font-semibold">
          {reminders.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
        {reminders.length === 0 ? (
          <div className="text-center mt-8">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm opacity-80">
              No reminders yet.
            </p>
            <p className="text-xs opacity-70 mt-1">
              Try the voice command!
            </p>
          </div>
        ) : (
          reminders.slice(0, 5).map((reminder) => (
            <div
              key={reminder._id}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-sm hover:bg-white/15 transition-all border border-white/10"
            >
              {reminder.isVoiceCommand && (
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="h-4 w-4 text-green-200" />
                  <span className="text-xs text-green-200 font-medium">Voice Reminder</span>
                </div>
              )}
              
              <div 
                className="flex-1 cursor-pointer" 
                onClick={() => toggleExpand(reminder._id)}
              >
                <p className={`font-medium mb-1 ${expandedId === reminder._id ? '' : 'line-clamp-2'}`}>
                  {reminder.text}
                </p>
                <p className="text-xs opacity-70 mt-1">
                  {formatDate(reminder.timestamp)}
                </p>
              </div>

              {expandedId === reminder._id && (
                <div className="mt-3 pt-3 border-t border-white/20 space-y-2">
                  <div className="bg-white/5 p-2 rounded-lg">
                    <p className="text-xs font-semibold mb-1 text-green-200">Full Transcription:</p>
                    <p className="text-sm">{reminder.text}</p>
                  </div>
                  {reminder.scheduledTime && (
                    <p className="text-xs opacity-80">
                      📅 Scheduled: {formatDate(reminder.scheduledTime)}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => toggleExpand(reminder._id)}
                  className="text-xs opacity-80 hover:opacity-100 flex items-center gap-1"
                >
                  {expandedId === reminder._id ? (
                    <>Hide <ChevronUp className="h-3 w-3" /></>
                  ) : (
                    <>View <ChevronDown className="h-3 w-3" /></>
                  )}
                </button>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-white hover:bg-white/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(reminder.text);
                    }}
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-white hover:bg-white/20"
                    onClick={() => onRemove(reminder._id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {reminders.length > 5 && (
        <p className="text-xs opacity-80 text-center mt-3 pt-3 border-t border-white/20">
          +{reminders.length - 5} more reminders
        </p>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
