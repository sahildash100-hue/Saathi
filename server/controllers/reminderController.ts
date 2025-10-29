import { Request, Response } from 'express';
import Reminder from '../models/Reminder';

export const getAllReminders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const reminders = await Reminder.find({ userId }).sort({ createdAt: -1 });
    res.json(reminders);
  } catch (error: any) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ message: 'Failed to fetch reminders' });
  }
};

export const createReminder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { text, scheduledTime, isVoiceCommand = false } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Reminder text required' });
    }

    const reminder = await Reminder.create({
      userId,
      text,
      timestamp: new Date(),
      scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined,
      isVoiceCommand,
    });

    res.status(201).json(reminder);
  } catch (error: any) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ message: 'Failed to create reminder' });
  }
};

export const deleteReminder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const reminder = await Reminder.findOneAndDelete({ _id: id, userId });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ message: 'Failed to delete reminder' });
  }
};

export const completeReminder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId },
      { completed: true },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error: any) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ message: 'Failed to update reminder' });
  }
};

