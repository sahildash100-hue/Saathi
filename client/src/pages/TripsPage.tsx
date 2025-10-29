import { useState } from 'react';

import { getApiUrl } from '../config';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { ArrowLeft, Plus, MapPin, Calendar, Users } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';

interface Trip {
  _id: string;
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: string;
  category: string;
  travelers: string[];
}

const categories = [
  { id: 'temple', label: '🏛️ Temples', icon: '🏛️' },
  { id: 'foreign', label: '🌍 Foreign', icon: '🌍' },
  { id: 'trekking', label: '⛰️ Trekking', icon: '⛰️' },
  { id: 'nature', label: '🌳 Nature', icon: '🌳' },
];

export default function TripsPage() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [newTrip, setNewTrip] = useState({
    destination: '',
    description: '',
    startDate: '',
    endDate: '',
    duration: '',
    category: 'nature',
  });

  const { data: trips = [] } = useQuery<Trip[]>({
    queryKey: ['trips', selectedCategory],
    queryFn: async () => {
      let url = getApiUrl('/trips');
      if (selectedCategory) {
        url += `?category=${selectedCategory}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch trips');
      return res.json();
    },
  });

  const createTripMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(getApiUrl('/trips'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create trip');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setShowCreateModal(false);
      setNewTrip({ destination: '', description: '', startDate: '', endDate: '', duration: '', category: 'nature' });
    },
  });

  const joinTripMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(getApiUrl(`/trips/${id}/join`), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to join trip');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  });

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    createTripMutation.mutate(newTrip);
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
                <h1 className="text-2xl font-bold">Travel Plans</h1>
                <p className="text-sm text-muted-foreground">Explore and plan journeys</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
              <Plus className="h-5 w-5" />
              Create Trip
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('')}
            >
              All Trips
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="gap-2"
              >
                <span>{cat.icon}</span>
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        {trips.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-xl font-semibold mb-2">No trips found</h3>
            <p className="text-muted-foreground">Try a different category or create your own trip!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {trips.map((trip) => (
            <div
              key={trip._id}
              className="relative bg-white dark:bg-slate-900 border rounded-2xl p-6 hover:shadow-xl transition-all card-hover overflow-hidden group"
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 opacity-[0.15] group-hover:opacity-20 transition-opacity bg-cover bg-center"
                style={{
                  backgroundImage: `url('/images/travel.jpg')`
                }}
              />
              
              {/* Content */}
              <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{trip.destination}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                    {categories.find(c => c.id === trip.category)?.label}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 dark:text-slate-300">{trip.description}</p>

              <div className="space-y-2 mb-4 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>⏱️</span>
                  <span>{trip.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{trip.travelers.length} travelers</span>
                </div>
              </div>

              <Button
                onClick={() => joinTripMutation.mutate(trip._id)}
                className="w-full relative z-10"
                disabled={trip.travelers.includes(user?.id || '')}
              >
                {trip.travelers.includes(user?.id || '') ? 'Joined ✓' : 'Join Trip'}
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
            <h2 className="text-2xl font-bold mb-4">Create Trip</h2>
            <form onSubmit={handleCreateTrip} className="space-y-4">
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="Destination"
                value={newTrip.destination}
                onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                required
              />
              <textarea
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="Description"
                value={newTrip.description}
                onChange={(e) => setNewTrip({ ...newTrip, description: e.target.value })}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="w-full px-4 py-2 border rounded-xl"
                  value={newTrip.startDate}
                  onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                  required
                />
                <input
                  type="date"
                  className="w-full px-4 py-2 border rounded-xl"
                  value={newTrip.endDate}
                  onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                  required
                />
              </div>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="Duration (e.g., 3 days)"
                value={newTrip.duration}
                onChange={(e) => setNewTrip({ ...newTrip, duration: e.target.value })}
                required
              />
              <select
                className="w-full px-4 py-2 border rounded-xl"
                value={newTrip.category}
                onChange={(e) => setNewTrip({ ...newTrip, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Create Trip
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
