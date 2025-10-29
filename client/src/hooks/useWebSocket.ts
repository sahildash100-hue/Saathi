import { useState, useEffect, useRef, useCallback } from 'react';
import { getToken } from '../lib/auth';

interface Message {
  _id: string;
  fromUserId: string;
  toUserId: string;
  text: string;
  timestamp: string;
}

export function useWebSocket(otherUserId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!otherUserId) return;

    try {
      const token = getToken();
      if (!token) return;

      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
      const ws = new WebSocket(`${wsUrl}/ws?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'new_message' || data.type === 'message_sent') {
          setMessages((prev) => [...prev, data.message]);
        }

        if (data.type === 'typing') {
          setIsTyping(data.isTyping);
        }

        if (data.type === 'connected') {
          console.log('WebSocket ready');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
    }
  }, [otherUserId]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!wsRef.current || !isConnected || !otherUserId) {
      return false;
    }

    try {
      wsRef.current.send(JSON.stringify({
        type: 'send_message',
        toUserId: otherUserId,
        text,
      }));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, [isConnected, otherUserId]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!wsRef.current || !isConnected || !otherUserId) return;

    try {
      wsRef.current.send(JSON.stringify({
        type: isTyping ? 'typing_start' : 'typing_stop',
        toUserId: otherUserId,
      }));
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }, [isConnected, otherUserId]);

  useEffect(() => {
    if (otherUserId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [otherUserId, connect, disconnect]);

  return {
    messages,
    isConnected,
    isTyping,
    sendMessage,
    sendTyping,
    setMessages,
  };
}

