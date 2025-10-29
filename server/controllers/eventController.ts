import { Request, Response } from 'express';
import Event from '../models/Event';

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const { location, category, startDate, endDate } = req.query;
    const filter: any = {};

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (category) {
      filter.category = category;
    }

    // Date range filtering
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate as string);
      }
      if (endDate) {
        // Add 1 day to endDate and subtract 1ms to include the entire end date
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const events = await Event.find(filter).sort({ date: 1 });
    res.json(events);
  } catch (error: any) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { title, description, location, date, time, category } = req.body;

    if (!title || !location || !date || !time) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const event = await Event.create({
      createdBy: userId,
      title,
      description,
      location,
      date,
      time,
      category: category || 'general',
      attendees: [],
    });

    res.status(201).json(event);
  } catch (error: any) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
};

export const registerForEvent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.attendees.includes(userId)) {
      event.attendees.push(userId);
      await event.save();
    }

    res.json(event);
  } catch (error: any) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Failed to register for event' });
  }
};

