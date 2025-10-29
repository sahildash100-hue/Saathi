import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Plus, Search, Users, Calendar } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';

interface Event {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  attendees: string[];
  createdBy: string;
}

export default function EventsPage() {
  const [, setLocation] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [specificDate, setSpecificDate] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
  });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['events', locationFilter, dateFilter, specificDate],
    queryFn: async () => {
      let url = 'http://localhost:3000/api/events';
      const params = new URLSearchParams();
      
      if (locationFilter) {
        params.append('location', locationFilter);
      }
      
      // Handle specific date (takes priority over preset dateFilter)
      if (specificDate) {
        params.append('startDate', specificDate);
        params.append('endDate', specificDate);
      } else if (dateFilter) {
        const today = new Date();
        let startDate: string, endDate: string;
        
        switch (dateFilter) {
          case 'today':
            startDate = new Date(today).toISOString().split('T')[0];
            endDate = startDate;
            break;
          case 'tomorrow':
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            startDate = tomorrow.toISOString().split('T')[0];
            endDate = startDate;
            break;
          case 'this-week':
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            startDate = startOfWeek.toISOString().split('T')[0];
            endDate = endOfWeek.toISOString().split('T')[0];
            break;
          case 'next-week':
            const nextWeekStart = new Date(today);
            nextWeekStart.setDate(today.getDate() - today.getDay() + 7);
            const nextWeekEnd = new Date(nextWeekStart);
            nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
            startDate = nextWeekStart.toISOString().split('T')[0];
            endDate = nextWeekEnd.toISOString().split('T')[0];
            break;
          default:
            return [];
        }
        
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create event');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setShowCreateModal(false);
      setNewEvent({ title: '', description: '', location: '', date: '', time: '' });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:3000/api/events/${id}/register`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to register');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    createEventMutation.mutate(newEvent);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Events</h1>
                <p className="text-sm text-muted-foreground">Join community activities</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
              <Plus className="h-5 w-5" />
              Create Event
            </Button>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Filter by location..."
                className="pl-10 h-12"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
              {locationFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocationFilter('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  Clear
                </Button>
              )}
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune'].map((city) => (
                <Button
                  key={city}
                  variant={locationFilter === city ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLocationFilter(city)}
                  className="flex-shrink-0"
                >
                  📍 {city}
                </Button>
              ))}
            </div>

            {/* Date Filter */}
            <div className="pt-2 border-t space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Filter by Date:</span>
              </div>
              
              {/* Specific Date Input */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={specificDate}
                  onChange={(e) => {
                    setSpecificDate(e.target.value);
                    setDateFilter(''); // Clear preset filter when specific date is selected
                  }}
                  className="flex-1 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                  placeholder="Select specific date"
                />
                {specificDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSpecificDate('')}
                    className="text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>

              {/* Preset Date Buttons */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { key: 'today', label: '📅 Today' },
                  { key: 'tomorrow', label: '📅 Tomorrow' },
                  { key: 'this-week', label: '📅 This Week' },
                  { key: 'next-week', label: '📅 Next Week' }
                ].map((filter) => (
                  <Button
                    key={filter.key}
                    variant={dateFilter === filter.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setDateFilter(dateFilter === filter.key ? '' : filter.key);
                      setSpecificDate(''); // Clear specific date when preset is selected
                    }}
                    className="flex-shrink-0"
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground">Try a different location or create your own event!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {events.map((event) => (
            <div
              key={event._id}
              className="relative bg-white dark:bg-slate-900 border rounded-2xl p-6 hover:shadow-xl transition-all card-hover overflow-hidden group"
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 opacity-[0.15] group-hover:opacity-20 transition-opacity bg-cover bg-center"
                style={{
                  backgroundImage: `url('/images/event.jpg')`
                }}
              />
              
              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{event.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 dark:text-slate-300">{event.description}</p>

              <div className="space-y-2 mb-4 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">📍</span>
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">📅</span>
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">⏰</span>
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{event.attendees.length} people attending</span>
                </div>
              </div>

              <Button
                onClick={() => registerMutation.mutate(event._id)}
                className="w-full relative z-10"
                disabled={event.attendees.includes(user?.id || '')}
              >
                {event.attendees.includes(user?.id || '') ? 'Registered ✓' : 'Join Event'}
              </Button>
              </div>
            </div>
          ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create Event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <Input
                placeholder="Event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                required
              />
              <Input
                placeholder="Description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
              <Input
                placeholder="Location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                required
              />
              <Input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                required
              />
              <Input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                required
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Create Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
