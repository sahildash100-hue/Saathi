import { Request, Response } from 'express';
import Trip from '../models/Trip';

export const getAllTrips = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const filter: any = {};

    if (category) {
      filter.category = category;
    }

    const trips = await Trip.find(filter).sort({ startDate: 1 });
    res.json(trips);
  } catch (error: any) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ message: 'Failed to fetch trips' });
  }
};

export const createTrip = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { destination, description, startDate, endDate, duration, category } = req.body;

    if (!destination || !startDate || !endDate || !duration) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const trip = await Trip.create({
      createdBy: userId,
      destination,
      description,
      startDate,
      endDate,
      duration,
      category: category || 'nature',
      travelers: [],
    });

    res.status(201).json(trip);
  } catch (error: any) {
    console.error('Error creating trip:', error);
    res.status(500).json({ message: 'Failed to create trip' });
  }
};

export const joinTrip = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (!trip.travelers.includes(userId)) {
      trip.travelers.push(userId);
      await trip.save();
    }

    res.json(trip);
  } catch (error: any) {
    console.error('Error joining trip:', error);
    res.status(500).json({ message: 'Failed to join trip' });
  }
};

