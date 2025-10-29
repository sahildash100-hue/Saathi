import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, X, Heart, MapPin, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// Random hobbies pool
const HOBBIES_POOL = [
  '🎨 Painting', '🎵 Music', '📸 Photography', '🎮 Gaming', '📚 Reading', 
  '⚽ Sports', '🎬 Movies', '🍳 Cooking', '🏃 Fitness', '🌲 Hiking',
  '✈️ Travel', '🎭 Drama', '🧘 Yoga', '🎸 Guitar', '🏀 Basketball',
  '📝 Writing', '🎪 Dancing', '🐾 Pets', '🌱 Gardening', '☕ Coffee',
  '🏊 Swimming', '🏋️ Gym', '🎨 Art', '🎯 Archery', '🎲 Board Games',
  '🏄 Surfing', '🚴 Cycling', '🎪 Circus', '🎤 Karaoke', '🎯 Darts'
];

// Helper function to get random hobbies
const getRandomHobbies = () => {
  const shuffled = [...HOBBIES_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3 + Math.floor(Math.random() * 3)); // 3-5 hobbies
};

// Helper function to get random bio
const getRandomBio = (index: number) => {
  const bios = [
    `Hi! I'm Friend ${index + 1}. I love making new connections and exploring life together!`,
    `Hey there! I'm Friend ${index + 1}. Let's create amazing memories together!`,
    `Hello! Friend ${index + 1} here. Always up for new adventures and friendships!`,
    `Hi! I'm Friend ${index + 1}. Looking forward to meeting amazing people like you!`,
    `Hey! Friend ${index + 1} speaking. Let's build something beautiful together!`,
    `Hello! I'm Friend ${index + 1}. Passionate about life, friendships, and growth!`,
    `Hi there! Friend ${index + 1} here. Let's share experiences and create bonds!`,
    `Hey! I'm Friend ${index + 1}. Always excited to meet new people and learn!`,
  ];
  return bios[index % bios.length];
};

// Helper function to get random age
const getRandomAge = () => 18 + Math.floor(Math.random() * 20);

// Generate 40 users with random hobbies
const SAMPLE_USERS = Array.from({ length: 40 }, (_, i) => ({
  _id: `user_${i + 1}`,
  name: `Friend ${i + 1}`,
  age: getRandomAge(),
  phoneNumber: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
  email: `friend${i + 1}@example.com`,
  bio: getRandomBio(i),
  hobbies: getRandomHobbies()
}));

interface User {
  _id: string;
  name: string;
  age: number;
  phoneNumber: string;
  email: string;
  bio?: string;
  hobbies: string[];
}

interface CardPosition {
  x: number;
  y: number;
  rotation: number;
}

export default function FindFriendsPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cardPosition, setCardPosition] = useState<CardPosition>({ x: 0, y: 0, rotation: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const currentUser = SAMPLE_USERS[currentIndex];

  const sendFriendMessage = useMutation({
    mutationFn: async (toUserId: string) => {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:3000/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          toUserId,
          text: 'hey i wanna be your friend',
        }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    },
  });

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!currentUser) return;

    if (direction === 'right') {
      // Send automatic friend message
      try {
        await sendFriendMessage.mutateAsync(currentUser._id);
      } catch (error) {
        console.error('Failed to send friend message:', error);
      }
    }

    // Move to next user
    if (currentIndex < SAMPLE_USERS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCardPosition({ x: 0, y: 0, rotation: 0 });
    } else {
      // No more users
      alert('You\'ve seen all available users!');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    const rotation = deltaX * 0.1;

    setCardPosition({
      x: deltaX,
      y: deltaY,
      rotation,
    });

    // Swipe threshold
    if (Math.abs(deltaX) > 100) {
      handleSwipe(deltaX > 0 ? 'right' : 'left');
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setCardPosition({ x: 0, y: 0, rotation: 0 });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;
    const rotation = deltaX * 0.1;

    setCardPosition({
      x: deltaX,
      y: deltaY,
      rotation,
    });

    // Swipe threshold
    if (Math.abs(deltaX) > 100) {
      handleSwipe(deltaX > 0 ? 'right' : 'left');
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setCardPosition({ x: 0, y: 0, rotation: 0 });
  };

  if (!currentUser) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">You've seen everyone!</h2>
        <p className="text-muted-foreground mb-4">Check back later for more friends</p>
        <Button onClick={() => setLocation('/')}>Go Back Home</Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Find Friends</h1>
                <p className="text-sm text-muted-foreground">
                  {currentIndex + 1} of {SAMPLE_USERS.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Card Stack */}
      <main className="flex-1 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-sm relative" style={{ height: '600px' }}>
          {/* Next Card (preview behind) */}
          {currentIndex < SAMPLE_USERS.length - 1 && (
            <div
              className="absolute inset-0 bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
              style={{
                transform: 'scale(0.95) translateY(8px)',
                opacity: 0.4,
              }}
            >
              {/* Preview Header */}
              <div className="h-1/3 bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">👤</span>
                </div>
              </div>
              {/* Preview Body */}
              <div className="h-2/3 p-4 flex flex-col justify-center items-center gap-3">
                <div className="w-2/3 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="w-1/2 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="flex gap-2 mt-2">
                  <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                  <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                </div>
              </div>
            </div>
          )}

          {/* Current Card */}
          <div
            ref={cardRef}
            className="absolute inset-0 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 cursor-grab active:cursor-grabbing overflow-hidden"
            style={{
              transform: `translateX(${cardPosition.x}px) translateY(${cardPosition.y}px) rotate(${cardPosition.rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Profile Header with Gradient */}
            <div className="h-1/3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col justify-between p-6 text-white relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-1">{currentUser.name}</h2>
                  <div className="flex items-center gap-2 text-sm opacity-90">
                    <span>{currentUser.age} years old</span>
                    <span>•</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>4.{Math.floor(Math.random() * 9)}</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
              </div>
            </div>

            {/* Profile Info Section */}
            <div className="p-6 h-2/3 flex flex-col overflow-y-auto">
              {/* Bio */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-semibold text-muted-foreground">ABOUT</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {currentUser.bio || 'Looking to connect!'}
                </p>
              </div>

              {/* Hobbies Section */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-purple-500 fill-purple-500" />
                  <span className="text-xs font-semibold text-muted-foreground">HOBBIES & INTERESTS</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentUser.hobbies.map((hobby, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 rounded-full shadow-sm border border-indigo-200 dark:border-indigo-800"
                    >
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats Section */}
              <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-slate-900 dark:text-white">{Math.floor(Math.random() * 50) + 20}</div>
                    <div className="text-xs text-muted-foreground">Connections</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-slate-900 dark:text-white">{Math.floor(Math.random() * 100) + 50}</div>
                    <div className="text-xs text-muted-foreground">Hobbies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-slate-900 dark:text-white">{Math.floor(Math.random() * 30) + 10}</div>
                    <div className="text-xs text-muted-foreground">Shared</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Swipe Overlay Indicators */}
          {Math.abs(cardPosition.x) > 50 && (
            <div
              className={`absolute inset-0 pointer-events-none flex items-center justify-center rounded-3xl ${
                cardPosition.x > 0 ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}
            >
              {cardPosition.x > 0 ? (
                <div className="text-6xl animate-pulse">❤️</div>
              ) : (
                <div className="text-6xl animate-pulse">👎</div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Action Buttons */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-6 flex-shrink-0">
        <div className="flex justify-center gap-8 max-w-sm mx-auto">
          {/* Pass Button */}
          <Button
            size="lg"
            variant="outline"
            className="w-20 h-20 rounded-full border-2 border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            onClick={() => handleSwipe('left')}
          >
            <div className="flex flex-col items-center">
              <X className="h-10 w-10 text-red-500 mb-1" />
              <span className="text-xs font-semibold text-red-500">PASS</span>
            </div>
          </Button>

          {/* Connect Button */}
          <Button
            size="lg"
            className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            onClick={() => handleSwipe('right')}
          >
            <div className="flex flex-col items-center">
              <Heart className="h-10 w-10 mb-1 fill-white" />
              <span className="text-xs font-semibold">LIKE</span>
            </div>
          </Button>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Swipe or click to decide
          </p>
          <p className="text-xs text-muted-foreground">
            ← Swipe left to pass • Swipe right to be friends →
          </p>
        </div>
      </div>
    </div>
  );
}

