import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import ReminderBloc from '../components/ReminderBloc';
import VoiceNavButton from '../components/VoiceNavButton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useReminderAlarm } from '../hooks/useReminderAlarm';

interface Reminder {
  _id: string;
  text: string;
  timestamp: string;
  scheduledTime?: string;
  isVoiceCommand: boolean;
  completed: boolean;
}

export default function RemindersPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: reminders = [] } = useQuery<Reminder[]>({
    queryKey: ['reminders'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:3000/api/reminders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch reminders');
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds to check for scheduled reminders
  });

  // Enable alarm functionality
  useReminderAlarm(reminders);

  const deleteReminder = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:3000/api/reminders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete reminder');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="px-6 py-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                <span className="text-xl">🔔</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">All Reminders</h1>
                <p className="text-sm text-muted-foreground">Manage your tasks</p>
              </div>
            </div>
            <VoiceNavButton />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {reminders.map((reminder) => (
            <div key={reminder._id} className="w-full">
              <ReminderBloc
                reminders={[reminder]}
                onRemove={(id) => deleteReminder.mutate(id)}
              />
            </div>
          ))}

          {reminders.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-2xl font-semibold mb-2">No reminders yet</h3>
              <p className="text-muted-foreground mb-6">Start creating reminders with voice commands</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

