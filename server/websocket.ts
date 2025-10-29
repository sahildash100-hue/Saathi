import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import Message from './models/Message';
import User from './models/User';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
}

export function setupWebSocketServer(server: any) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
    console.log('New WebSocket connection attempt');

    // Authenticate user
    const token = req.url?.split('token=')[1];
    
    if (!token) {
      ws.close(1008, 'Authentication required');
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here_make_it_long_and_secure_123456789') as any;
      ws.userId = decoded.userId;
      console.log(`User ${ws.userId} connected via WebSocket`);
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      ws.close(1008, 'Invalid token');
      return;
    }

    // Handle incoming messages
    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'send_message') {
          const { toUserId, text } = message;
          
          // Save message to database
          const savedMessage = await Message.create({
            fromUserId: ws.userId,
            toUserId,
            text,
          });

          // Get user details
          const fromUser = await User.findById(ws.userId);
          
          // Broadcast to the recipient if they're connected
          wss.clients.forEach((client: AuthenticatedWebSocket) => {
            if (client.readyState === WebSocket.OPEN && client.userId === toUserId) {
              client.send(JSON.stringify({
                type: 'new_message',
                message: {
                  _id: savedMessage._id,
                  fromUserId: savedMessage.fromUserId,
                  toUserId: savedMessage.toUserId,
                  text: savedMessage.text,
                  timestamp: savedMessage.timestamp,
                  fromUserName: fromUser?.name,
                }
              }));
            }
          });

          // Send confirmation to sender
          ws.send(JSON.stringify({
            type: 'message_sent',
            message: {
              _id: savedMessage._id,
              fromUserId: savedMessage.fromUserId,
              toUserId: savedMessage.toUserId,
              text: savedMessage.text,
              timestamp: savedMessage.timestamp,
            }
          }));
        }

        if (message.type === 'typing_start') {
          const { toUserId } = message;
          // Broadcast typing indicator to recipient
          wss.clients.forEach((client: AuthenticatedWebSocket) => {
            if (client.readyState === WebSocket.OPEN && client.userId === toUserId) {
              client.send(JSON.stringify({
                type: 'typing',
                fromUserId: ws.userId,
                isTyping: true,
              }));
            }
          });
        }

        if (message.type === 'typing_stop') {
          const { toUserId } = message;
          // Broadcast typing stop to recipient
          wss.clients.forEach((client: AuthenticatedWebSocket) => {
            if (client.readyState === WebSocket.OPEN && client.userId === toUserId) {
              client.send(JSON.stringify({
                type: 'typing',
                fromUserId: ws.userId,
                isTyping: false,
              }));
            }
          });
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    // Handle connection close
    ws.on('close', () => {
      console.log(`User ${ws.userId} disconnected`);
    });

    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'WebSocket connected successfully'
    }));
  });

  return wss;
}

