import { Request, Response } from 'express';
import Message from '../models/Message';
import User from '../models/User';

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get all unique user IDs that have conversations with the current user
    const messages = await Message.find({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    }).sort({ timestamp: -1 });
    
    console.log(`Found ${messages.length} messages for user ${userId}`);

    // Group by conversation
    const conversations = new Map();
    const userIds = new Set<string>();

    messages.forEach((msg) => {
      const otherUserId = msg.fromUserId === userId ? msg.toUserId : msg.fromUserId;
      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, {
          lastMessage: msg.text,
          timestamp: msg.timestamp,
          unread: msg.toUserId === userId && !msg.read,
        });
        userIds.add(otherUserId);
      }
    });

    // Get user details - handle both string and ObjectId formats
    const userIdArray = Array.from(userIds);
    
    if (userIdArray.length === 0) {
      return res.json([]);
    }
    
    console.log(`Searching for ${userIdArray.length} users:`, userIdArray);
    
    // Import mongoose for ObjectId validation
    const mongoose = require('mongoose');
    
    // Filter out invalid ObjectIds (like "user_1" from Find Friends)
    const validUserIds = userIdArray.filter(id => {
      // Check if it's a valid MongoDB ObjectId
      return mongoose.Types.ObjectId.isValid(id) && id.length === 24;
    });
    
    console.log(`Filtered to ${validUserIds.length} valid user IDs`);
    
    if (validUserIds.length === 0) {
      console.log('No valid user IDs found (may all be fake IDs from Find Friends)');
      return res.json([]);
    }
    
    // Try to find users with valid IDs
    let users: any[] = [];
    try {
      users = await User.find({ 
        _id: { $in: validUserIds } 
      }).lean();
    } catch (queryError: any) {
      console.error('Query failed:', queryError?.message || queryError);
      return res.json([]);
    }
    
    console.log(`Found ${users.length} users in database`);
    
    // Filter to only include conversations where users exist in database
    const conversationsList = users
      .map((user: any) => {
        const userIdString = user._id?.toString() || user._id;
        const convData = conversations.get(userIdString);
        
        if (!convData) {
          return null;
        }
        
        return {
          id: userIdString,
          name: user.name,
          phoneNumber: user.phoneNumber,
          lastMessage: convData.lastMessage || '',
          timestamp: convData.timestamp || new Date(),
          unread: convData.unread || false,
        };
      })
      .filter((conv: any) => conv !== null); // Remove any null entries

    console.log(`Returning ${conversationsList.length} conversations`);
    res.json(conversationsList);
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      userId: (req as any).userId
    });
    // Instead of sending 500, send empty array to prevent UI breaking
    res.json([]);
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { fromUserId: userId, toUserId: otherUserId },
        { fromUserId: otherUserId, toUserId: userId },
      ],
    }).sort({ timestamp: 1 });

    // Mark messages as read
    await Message.updateMany(
      { fromUserId: otherUserId, toUserId: userId, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { toUserId, text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Message text required' });
    }

    const message = await Message.create({
      fromUserId: userId,
      toUserId,
      text,
    });

    res.status(201).json(message);
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const userId = (req as any).userId;

    if (!query || query.toString().length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { phoneNumber: { $regex: query, $options: 'i' } },
      ],
    }).limit(10);

    res.json(users);
  } catch (error: any) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Failed to search users' });
  }
};

