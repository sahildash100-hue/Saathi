import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import VoiceNavButton from '../components/VoiceNavButton';
import { useAuth } from '../hooks/useAuth';
import { Moon, Sun, LogOut, User, Calendar, MessageSquare, Plane, Bell, Pill, Users } from 'lucide-react';
import { removeToken } from '../lib/auth';
import { useReminderAlarm } from '../hooks/useReminderAlarm';
import { usePrescriptionAlarm } from '../hooks/usePrescriptionAlarm';
import { getApiUrl } from '../config';

interface Reminder {
  _id: string;
  text: string;
  timestamp: string;
  scheduledTime?: string;
  isVoiceCommand: boolean;
  completed: boolean;
}

interface Prescription {
  _id: string;
  medicationName: string;
  dosage: string;
  time: string;
  completed: boolean;
}

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: reminders = [] } = useQuery<Reminder[]>({
    queryKey: ['reminders'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(getApiUrl('/reminders'), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch reminders');
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: prescriptions = [] } = useQuery<Prescription[]>({
    queryKey: ['prescriptions'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(getApiUrl('/prescriptions'), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch prescriptions');
      return res.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Enable alarm functionality
  useReminderAlarm(reminders);
  usePrescriptionAlarm(prescriptions);

  // Get recent reminders (last 3)
  const recentReminders = reminders.slice(0, 3);

  // Sample data for other cards (in production, fetch from API)
  const recentEvents = [
    { title: 'Yoga Session', date: 'Today, 6:00 AM' },
    { title: 'Community Meet', date: 'Tomorrow' }
  ];

  const recentMessages = [
    { name: 'Dr. Priya', message: 'Medication reminder sent' },
    { name: 'Family', message: 'See you soon!' }
  ];

  const upcomingTrips = [
    { destination: 'Rishikesh', date: 'Jan 15' }
  ];

  const deleteReminder = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(getApiUrl(`/reminders/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete reminder');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reminders'] }),
  });

  const deletePrescription = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(getApiUrl(`/prescriptions/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete prescription');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prescriptions'] }),
  });

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    removeToken();
    window.location.href = '/';
  };

  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Events',
      description: 'Join community activities',
      color: 'from-blue-500 to-cyan-500',
      route: '/events'
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'Messages',
      description: 'Stay connected',
      color: 'from-purple-500 to-pink-500',
      route: '/messages'
    },
    {
      icon: <Plane className="w-8 h-8" />,
      title: 'Travel',
      description: 'Plan your journeys',
      color: 'from-orange-500 to-red-500',
      route: '/trips'
    }
  ];

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Header - Fixed at top */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex-shrink-0 z-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Saathi</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user?.name && (
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.name}</span>
                </div>
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleLogout}
                className="rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden container mx-auto px-6 lg:px-8 py-4">
        {/* Welcome Section */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Here's what's happening with your Saathi
          </p>
        </div>

        {/* Quick Actions Grid - 2 rows, 5 columns */}
        <div className="grid grid-rows-2 grid-cols-5 gap-4 h-[calc(100vh-200px)]">
          {/* Reminders Card - Tall rectangle spanning 2 columns and 2 rows */}
          <div 
            className="col-span-2 row-span-2 cursor-pointer"
            onClick={() => setLocation('/reminders')}
          >
            <div className="h-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 card-hover overflow-hidden relative">
              {/* Banner Image Overlay */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url('/images/reminder.jpg')` }}
              />
              
              <div className="relative z-10 flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <div onClick={(e) => e.stopPropagation()}>
                    <VoiceNavButton />
                  </div>
                  <span className="text-2xl font-bold">{reminders.length}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 relative z-10">Reminders</h3>
              
              <div className="relative z-10">
              {recentReminders.length > 0 ? (
                <div className="space-y-2">
                  {recentReminders.map((reminder, idx) => (
                    <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                      <p className="text-xs line-clamp-2">{reminder.text}</p>
                      <p className="text-[10px] text-emerald-100 mt-1">
                        {new Date(reminder.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-emerald-100 text-xs">No reminders yet. Add one!</p>
              )}
              </div>
            </div>
          </div>

          {/* Prescriptions Card */}
          <div
            className="cursor-pointer"
            onClick={() => setLocation('/prescriptions')}
          >
            <div className="h-full bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-lg border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all hover:-translate-y-1 card-hover overflow-hidden relative">
              {/* Full Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url('/images/reminder.jpg')` }}
              />
              
              <div className="relative z-10 flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Pill className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{prescriptions.length}</span>
              </div>
              <h3 className="text-base font-bold mb-1.5 text-slate-900 dark:text-white relative z-10">Prescriptions</h3>
              
              <div className="relative z-10">
              {prescriptions.length > 0 ? (
                <div className="space-y-1.5">
                  {prescriptions.slice(0, 1).map((prescription, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 border border-slate-200 dark:border-slate-700">
                      <p className="text-[11px] font-semibold text-slate-900 dark:text-white line-clamp-1">{prescription.medicationName}</p>
                      <p className="text-[9px] text-slate-600 dark:text-slate-400 mt-0.5">⏰ {prescription.time}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 dark:text-slate-400 text-xs">No prescriptions</p>
              )}
              </div>
            </div>
          </div>

          {/* Events Card */}
          <div
            className="cursor-pointer"
            onClick={() => setLocation('/events')}
          >
            <div className="h-full bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-lg border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all hover:-translate-y-1 card-hover overflow-hidden relative">
              {/* Full Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url('/images/event.jpg')` }}
              />
              
              <div className="relative z-10 flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{recentEvents.length}</span>
              </div>
              <h3 className="text-base font-bold mb-1.5 text-slate-900 dark:text-white relative z-10">Events</h3>
              
              <div className="relative z-10">
              {recentEvents.length > 0 ? (
                <div className="space-y-1.5">
                  {recentEvents.slice(0, 1).map((event, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 border border-slate-200 dark:border-slate-700">
                      <p className="text-[11px] font-semibold text-slate-900 dark:text-white line-clamp-1">{event.title}</p>
                      <p className="text-[9px] text-slate-600 dark:text-slate-400 mt-0.5">{event.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 dark:text-slate-400 text-xs">No events</p>
              )}
              </div>
            </div>
          </div>

          {/* Find Friends Card */}
          <div
            className="cursor-pointer"
            onClick={() => setLocation('/find-friends')}
          >
            <div className="h-full bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-lg border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all hover:-translate-y-1 card-hover overflow-hidden relative">
              {/* Full Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url('/images/message.jpg')` }}
              />
              
              <div className="relative z-10 flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">40</span>
              </div>
              <h3 className="text-base font-bold mb-1.5 text-slate-900 dark:text-white relative z-10">Find Friends</h3>
              
              <div className="relative z-10">
                <p className="text-slate-600 dark:text-slate-400 text-xs">Swipe to connect</p>
              </div>
            </div>
          </div>

          {/* Messages Card */}
          <div
            className="cursor-pointer"
            onClick={() => setLocation('/messages')}
            style={{ animationDelay: '200ms' }}
          >
            <div className="h-full bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-lg border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all hover:-translate-y-1 card-hover overflow-hidden relative">
              {/* Full Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url('/images/message.jpg')` }}
              />
              
              <div className="relative z-10 flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{recentMessages.length}</span>
              </div>
              <h3 className="text-base font-bold mb-1.5 text-slate-900 dark:text-white relative z-10">Messages</h3>
              
              <div className="relative z-10">
              {recentMessages.length > 0 ? (
                <div className="space-y-1.5">
                  {recentMessages.slice(0, 1).map((msg, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 border border-slate-200 dark:border-slate-700">
                      <p className="text-[11px] font-semibold text-slate-900 dark:text-white line-clamp-1">{msg.name}</p>
                      <p className="text-[9px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">{msg.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 dark:text-slate-400 text-xs">No messages</p>
              )}
              </div>
            </div>
          </div>

          {/* Travel Card */}
          <div
            className="cursor-pointer"
            onClick={() => setLocation('/trips')}
            style={{ animationDelay: '300ms' }}
          >
            <div className="h-full bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-lg border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all hover:-translate-y-1 card-hover overflow-hidden relative">
              {/* Full Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url('/images/travel.jpg')` }}
              />
              
              <div className="relative z-10 flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{upcomingTrips.length}</span>
              </div>
              <h3 className="text-base font-bold mb-1.5 text-slate-900 dark:text-white relative z-10">Travel</h3>
              
              <div className="relative z-10">
              {upcomingTrips.length > 0 ? (
                <div className="space-y-1.5">
                  {upcomingTrips.map((trip, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 border border-slate-200 dark:border-slate-700">
                      <p className="text-[11px] font-semibold text-slate-900 dark:text-white line-clamp-1">{trip.destination}</p>
                      <p className="text-[9px] text-slate-600 dark:text-slate-400 mt-0.5">{trip.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 dark:text-slate-400 text-xs">No trips</p>
              )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
