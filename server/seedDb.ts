import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Event from './models/Event';
import Trip from './models/Trip';
import { seedDummyData } from './controllers/seedData';

dotenv.config();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/saathi');
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find();
    console.log(`Found ${users.length} users`);

    if (users.length === 0) {
      console.log('⚠️ No users found. Please register a user first.');
      process.exit(0);
    }

    // First, delete ALL existing events and trips
    const deletedEvents = await Event.deleteMany({});
    const deletedTrips = await Trip.deleteMany({});
    console.log(`🧹 Deleted ${deletedEvents.deletedCount} old events and ${deletedTrips.deletedCount} old trips`);

    // Seed dummy data for each user
    for (const user of users) {
      console.log(`Seeding data for user: ${user.name}`);
      await seedDummyData(user._id.toString());
    }

    console.log('✅ Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

