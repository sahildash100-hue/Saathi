import mongoose from 'mongoose';
import User from '../models/User';
import Event from '../models/Event';
import Trip from '../models/Trip';
import Message from '../models/Message';

export const seedDummyData = async (currentUserId: string) => {
  try {
    // Check if community events already exist
    const existingEvents = await Event.find({});
    if (existingEvents.length > 0) {
      console.log('✅ Community events already exist, skipping seeding');
      return;
    }

    // Create 10 fresh unique community events (shared by all users)
    const events = [
      {
        createdBy: currentUserId,
        title: 'Morning Tai Chi Session',
        description: 'Gentle Tai Chi movements for balance and inner calm',
        location: 'Delhi',
        date: new Date(Date.now() + 86400000),
        time: '7:00 AM',
        category: 'fitness',
        attendees: [],
      },
      {
        createdBy: currentUserId,
        title: 'Cardio Dance for Seniors',
        description: 'Fun-filled dance session with easy-to-follow steps',
        location: 'Mumbai',
        date: new Date(Date.now() + 86400000),
        time: '9:00 AM',
        category: 'fitness',
        attendees: [],
      },
      {
        createdBy: currentUserId,
        title: 'Nutrition & Diet Talk',
        description: 'Learn about healthy eating habits for golden years',
        location: 'Bangalore',
        date: new Date(Date.now() + 172800000),
        time: '11:00 AM',
        category: 'health',
        attendees: [],
      },
      {
        createdBy: currentUserId,
        title: 'Carnatic Music Concert',
        description: 'Beautiful south Indian classical music performance',
        location: 'Chennai',
        date: new Date(Date.now() + 259200000),
        time: '6:00 PM',
        category: 'entertainment',
        attendees: [],
      },
      {
        createdBy: currentUserId,
        title: 'Book Club Discussion',
        description: 'Share your favorite reads and discover new authors',
        location: 'Pune',
        date: new Date(Date.now() + 345600000),
        time: '4:00 PM',
        category: 'education',
        attendees: [],
      },
      {
        createdBy: currentUserId,
        title: 'Mindfulness Workshop',
        description: 'Learn meditation techniques for daily peace',
        location: 'Hyderabad',
        date: new Date(Date.now() + 432000000),
        time: '5:30 PM',
        category: 'fitness',
        attendees: [],
      },
      {
        createdBy: currentUserId,
        title: 'Water Aerobics Class',
        description: 'Low-impact exercises in the pool for easy movement',
        location: 'Goa',
        date: new Date(Date.now() + 518400000),
        time: '10:00 AM',
        category: 'fitness',
        attendees: [],
      },
      {
        createdBy: currentUserId,
        title: 'Western Dance Evening',
        description: 'Ballroom and Waltz dancing for couples',
        location: 'Kolkata',
        date: new Date(Date.now() + 604800000),
        time: '7:00 PM',
        category: 'entertainment',
        attendees: [],
      },
      {
        createdBy: currentUserId,
        title: 'Spiritual Satsang',
        description: 'Group spiritual discourse and bhajans',
        location: 'Varanasi',
        date: new Date(Date.now() + 691200000),
        time: '7:30 PM',
        category: 'entertainment',
        attendees: [],
      },
      {
        createdBy: currentUserId,
        title: 'Qigong Healing Session',
        description: 'Ancient Chinese practice for energy and vitality',
        location: 'Jaipur',
        date: new Date(Date.now() + 777600000),
        time: '6:00 AM',
        category: 'fitness',
        attendees: [],
      },
    ];

    // Create 10 fresh unique trips
    const trips = [
      {
        createdBy: currentUserId,
        destination: 'Badrinath Temple',
        description: 'Spiritual journey to Char Dham with breathtaking mountain views',
        startDate: new Date(Date.now() + 604800000),
        endDate: new Date(Date.now() + 777600000),
        duration: '3 days',
        category: 'temple',
        travelers: [],
      },
      {
        createdBy: currentUserId,
        destination: 'Munnar Tea Gardens',
        description: 'Serene tea plantations and cool hill station atmosphere',
        startDate: new Date(Date.now() + 1209600000),
        endDate: new Date(Date.now() + 1382400000),
        duration: '4 days',
        category: 'nature',
        travelers: [],
      },
      {
        createdBy: currentUserId,
        destination: 'Gokarna Beach',
        description: 'Pristine beaches and peaceful coastal vibes',
        startDate: new Date(Date.now() + 1468800000),
        endDate: new Date(Date.now() + 1555200000),
        duration: '3 days',
        category: 'nature',
        travelers: [],
      },
      {
        createdBy: currentUserId,
        destination: 'Manali Snow View',
        description: 'Snow-capped peaks, apple orchards, and mountain streams',
        startDate: new Date(Date.now() + 1641600000),
        endDate: new Date(Date.now() + 1814400000),
        duration: '4 days',
        category: 'nature',
        travelers: [],
      },
      {
        createdBy: currentUserId,
        destination: 'Jagannath Puri',
        description: 'Divine darshan at Jagannath Temple and beach serenity',
        startDate: new Date(Date.now() + 1900800000),
        endDate: new Date(Date.now() + 1987200000),
        duration: '2 days',
        category: 'temple',
        travelers: [],
      },
      {
        createdBy: currentUserId,
        destination: 'Udaipur City Palace',
        description: 'Lake Palace, vintage markets, and royal heritage',
        startDate: new Date(Date.now() + 2073600000),
        endDate: new Date(Date.now() + 2246400000),
        duration: '4 days',
        category: 'nature',
        travelers: [],
      },
      {
        createdBy: currentUserId,
        destination: 'Mathura Vrindavan',
        description: 'Lord Krishna temples, parikrama, and bhakti experience',
        startDate: new Date(Date.now() + 2332800000),
        endDate: new Date(Date.now() + 2419200000),
        duration: '2 days',
        category: 'temple',
        travelers: [],
      },
      {
        createdBy: currentUserId,
        destination: 'Ooty Botanical Gardens',
        description: 'Rose garden, Nilgiri mountains, and toy train ride',
        startDate: new Date(Date.now() + 2505600000),
        endDate: new Date(Date.now() + 2678400000),
        duration: '3 days',
        category: 'nature',
        travelers: [],
      },
      {
        createdBy: currentUserId,
        destination: 'Vaishno Devi Yatra',
        description: 'Blessed pilgrimage to Mata Vaishno Devi shrine',
        startDate: new Date(Date.now() + 2764800000),
        endDate: new Date(Date.now() + 2851200000),
        duration: '2 days',
        category: 'temple',
        travelers: [],
      },
      {
        createdBy: currentUserId,
        destination: 'Maharashtra Caves',
        description: 'Ajanta Ellora caves exploration and Aurangabad heritage',
        startDate: new Date(Date.now() + 3024000000),
        endDate: new Date(Date.now() + 3196800000),
        duration: '4 days',
        category: 'nature',
        travelers: [],
      },
    ];

    // Insert community events/trips (only first user seeds them)
    // Subsequent users will just skip and use existing community data

    // Create events with a dummy 'community' user
    // These will show for everyone
    for (const event of events) {
      await Event.create(event);
    }

    // Create trips with a dummy 'community' user
    for (const trip of trips) {
      await Trip.create(trip);
    }

    console.log('✅ Dummy data seeded successfully');
  } catch (error) {
    console.error('Error seeding dummy data:', error);
  }
};

