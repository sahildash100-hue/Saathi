import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Reminder from './models/Reminder';

dotenv.config();

async function clearAllReminders() {
  try {
    console.log('🗑️ Starting to clear all reminders...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/saathi');
    console.log('✅ Connected to MongoDB');

    // Delete all reminders
    const result = await Reminder.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} reminders successfully!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing reminders:', error);
    process.exit(1);
  }
}

clearAllReminders();

