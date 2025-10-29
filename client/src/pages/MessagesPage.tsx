import { useState, useEffect } from 'react';

import { getApiUrl } from '../config';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Send, Search, Phone, Video } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';

interface Chat {
  id: string;
  name: string;
  phoneNumber: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

interface Message {
  _id: string;
  fromUserId: string;
  toUserId: string;
  text: string;
  timestamp: string;
}

export default function MessagesPage() {
  const [, setLocation] = useLocation();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // WebSocket for real-time messaging
  const { messages: wsMessages, sendMessage, isConnected, isTyping } = useWebSocket(selectedChat);

  const { data: conversations = [] } = useQuery<Chat[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(getApiUrl('/messages/conversations'), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch conversations');
      return res.json();
    },
  });

  const { data: initialMessages = [] } = useQuery<Message[]>({
    queryKey: ['messages', selectedChat],
    queryFn: async () => {
      if (!selectedChat) return [];
      const token = localStorage.getItem('auth_token');
      const res = await fetch(getApiUrl(`/messages/with/${selectedChat}`), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
    enabled: !!selectedChat,
  });

  // Combine initial messages with WebSocket messages, removing duplicates
  const messages = selectedChat && initialMessages ? (() => {
    const messageMap = new Map();
    
    // Add initial messages
    initialMessages.forEach(msg => {
      messageMap.set(msg._id, msg);
    });
    
    // Add WebSocket messages (these will override if same ID)
    wsMessages.forEach(msg => {
      messageMap.set(msg._id, msg);
    });
    
    // Convert back to array and sort by timestamp
    return Array.from(messageMap.values()).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  })() : [];

  const { data: searchResults = [] } = useQuery<any[]>({
    queryKey: ['searchUsers', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const token = localStorage.getItem('auth_token');
      const res = await fetch(getApiUrl(`/messages/search?query=${searchQuery}`), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    enabled: searchQuery.length >= 2,
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && selectedChat && user?.id) {
      const messageText = message.trim();
      const sent = sendMessage(messageText);
      
      if (sent) {
        setMessage('');
        
        // Optimistically add message to cache immediately
        const optimisticMessage: Message = {
          _id: `temp_${Date.now()}`,
          fromUserId: user.id,
          toUserId: selectedChat,
          text: messageText,
          timestamp: new Date().toISOString(),
        };

        // Update the messages query cache optimistically
        queryClient.setQueryData<Message[]>(['messages', selectedChat], (old = []) => [...old, optimisticMessage]);
        
        // Invalidate conversations to update the list
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        
        // Refetch messages from server after a short delay to ensure persistence
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['messages', selectedChat] });
        }, 1000);
      }
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const chatContainer = document.querySelector('main');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  // Clear search when closing chat or switching chats
  useEffect(() => {
    if (selectedChat) {
      setSearchQuery('');
    }
  }, [selectedChat]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-container') && searchQuery) {
        // Keep search query but don't prevent user from searching again
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [searchQuery]);

  const currentChat = conversations.find(c => c.id === selectedChat);

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {!selectedChat ? (
        <>
          <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 relative">
            <div className="px-6 py-4">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocation('/')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Messages</h1>
                  <p className="text-sm text-muted-foreground">Connect with friends</p>
                </div>
              </div>
              
              <div className="relative search-container">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                <Input
                  placeholder="Search users by name or phone..."
                  className="pl-10 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {searchResults.length > 0 && (
                <div className="mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg absolute top-full left-0 right-0 mx-6 z-20 max-h-96 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => {
                        setSelectedChat(user._id);
                        setSearchQuery('');
                      }}
                      className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-3 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {user.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.phoneNumber}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="space-y-2 p-4">
              {conversations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold mb-2">No conversations yet</h3>
                  <p className="text-muted-foreground">Search for users to start chatting!</p>
                </div>
              ) : (
                conversations.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className="relative bg-white dark:bg-slate-900 border rounded-2xl p-4 hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
                  >
                    {/* Background Image */}
                    <div 
                      className="absolute inset-0 opacity-[0.15] group-hover:opacity-20 transition-opacity bg-cover bg-center"
                      style={{
                        backgroundImage: `url('/images/message.jpg')`
                      }}
                    />
                    
                    {/* Content */}
                    <div className="relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center text-white text-xl font-bold">
                          {chat.name[0]}
                        </div>
                        {chat.unread && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-semibold truncate text-slate-900 dark:text-white">{chat.name}</h3>
                          <span className="text-xs text-muted-foreground">{new Date(chat.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate text-slate-900 dark:text-slate-300">{chat.lastMessage}</p>
                      </div>
                    </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </>
      ) : (
        <>
          <header className="border-b bg-white dark:bg-slate-900 flex-shrink-0">
            <div className="px-4 py-3 flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedChat(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                {currentChat?.name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">{currentChat?.name}</h2>
                  {isConnected ? (
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  ) : (
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isTyping ? 'Typing...' : currentChat?.phoneNumber}
                </p>
              </div>
              <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-5 w-5" />
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 space-y-3">
            {messages.map((msg) => {
              const isMine = msg.fromUserId === user?.id;
              return (
                <div
                  key={msg._id}
                  className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    isMine ? 'bg-blue-500' : 'bg-purple-500'
                  }`}>
                    {isMine ? user?.name[0] : currentChat?.name[0]}
                  </div>
                  <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`rounded-2xl px-4 py-2 ${
                      isMine 
                        ? 'bg-blue-500 text-white rounded-tr-sm' 
                        : 'bg-white dark:bg-slate-800 border rounded-tl-sm'
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </main>

          <form onSubmit={handleSendMessage} className="border-t bg-white dark:bg-slate-900 p-4 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 h-12"
              />
              <Button type="submit" size="icon" className="h-12 w-12" disabled={!isConnected}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
