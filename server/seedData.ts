import mongoose from 'mongoose';
import User from './models/User';
import Event from './models/Event';
import Trip from './models/Trip';
import Message from './models/Message';

export const seedDummyData = async (currentUserId: string) => {
  try {
    // Create dummy events
    const events = [
      {
        createdBy: currentUserId,
        title: 'Morning Yoga Session',
        description: 'Join us for a peaceful morning yoga session in the park',
        location: 'Delhi',
        date: new Date(Date.now() + 86400000), // Tomorrow
        time: '6:00 AM',
        category: 'fitness',
        attendees: [],
      },
      {
        createdBy: currentUserId,
        title: 'Community Health Talk',
        description: 'Expert talk on senior health and nutrition',
        location: 'Mumbai',
        date: new Date(Date.now() + 172800000), // Day after tomorrow
        time: '4:00 PM',
        category: 'health',
        attendees: [],
      },
      {
        createdBy: currentUserId,
        title: 'Music & Dance Evening',
        description: 'Enjoy traditional music and dance performances',
        location: 'Bangalore',
        date: new Date(Date.now() + 259200000), // 3 days later
        time: '6:30 PM',
        category: 'entertainment',
        attendees: [],
      },
      {
        createdBy: currentUserId,
        title: 'Book Reading Circle',
        description: 'Share and discuss your favorite books',
        location: 'Kolkata',
        date: new Date(Date.now() + 345600000), // 4 days later
        time: '3:00 PM',
        category: 'education',
        attendees: [],
      },
    ];

    // Create dummy trips
    const trips = [
      {
        createdBy: currentUserId,
        destination: 'Rishikesh',
        description: 'Visit the holy temples and experience the peaceful atmosphere',
        startDate: new Date(Date.now() + 604800000), // 7 days later
        endDate: new Date(Date.now() + 691200000), // 8 days later
        duration: '2 days',
        category: 'temple',
        travelers: [],
      },
      {
        createdBy: currentUserId,
        destination: 'Kerala Backwaters',
        description: 'Relax on a houseboat through beautiful backwaters',
        startDate: new Date(Date.now() + 1209600000), // 14 days later
        endDate: new Date(Date.now() + 1296000000), // 15 days later
        duration: '3 days',
        category: 'nature',
        travelers: [],
      },
      {
        createdBy: currentUserId,
        destination: 'Himalayan Trek',
        description: 'Medium difficulty trek to enjoy the mountain views',
        startDate: new Date(Date.now() + 1814400000), // 21 days later
        endDate: new Date(Date.now() + 1900800000), // 22 days later
        duration: '2 days',
        category: 'trekking',
        travelers: [],
      },
      {
        createdBy: currentUserId,
        destination: 'Dubai',
        description: 'Explore the modern city with shopping and sightseeing',
        startDate: new Date(Date.now() + 2419200000), // 28 days later
        endDate: new Date(Date.now() + 2505600000), // 29 days later
        duration: '5 days',
        category: 'foreign',
        travelers: [],
      },
      {
        createdBy: currentUserId,
        destination: 'Varanasi',
        description: 'Spiritual journey to the ancient city of temples',
        startDate: new Date(Date.now() + 3024000000), // 35 days later
        endDate: new Date(Date.now() + 3110400000), // 36 days later
        duration: '3 days',
        category: 'temple',
        travelers: [],
      },
    ];

    // Add some random events from other users
    const allUsers = await User.find({ _id: { $ne: currentUserId } });
    if (allUsers.length > 0) {
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
      events.push({
        createdBy: randomUser._id.toString(),
        title: 'Cooking Workshop',
        description: 'Learn healthy recipes for seniors',
        location: 'Chennai',
        date: new Date(Date.now() + 432000000), // 5 days later
        time: '11:00 AM',
        category: 'cooking',
        attendees: [currentUserId],
      });
    }

    // Add some random trips from other users
    if (allUsers.length > 0) {
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
      trips.push({
        createdBy: randomUser._id.toString(),
        destination: 'Goa Beach',
        description: 'Relaxing beach holiday with gentle activities',
        startDate: new Date(Date.now() + 1382400000), // 16 days later
        endDate: new Date(Date.now() + 1468800000), // 17 days later
        duration: '4 days',
        category: 'nature',
        travelers: [],
      });
    }

    // Insert events and trips (only if they don't exist)
    for (const event of events) {
      await Event.findOneAndUpdate(
        { title: event.title, createdBy: event.createdBy },
        event,
        { upsert: true, new: true }
      );
    }

    for (const trip of trips) {
      await Trip.findOneAndUpdate(
        { destination: trip.destination, createdBy: trip.createdBy },
        trip,
        { upsert: true, new: true }
      );
    }

    console.log('✅ Dummy data seeded successfully');
  } catch (error) {
    console.error('Error seeding dummy data:', error);
  }
};

