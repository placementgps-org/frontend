import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function activateCourses() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));
    const totalBefore = await Course.countDocuments();
    console.log(`Total courses before update: ${totalBefore}`);

    // Update active: false or missing to active: true safely without altering any other fields
    const updateResult = await Course.updateMany(
      { $or: [{ active: false }, { active: { $exists: false } }] },
      { $set: { active: true } }
    );

    console.log(`Updated ${updateResult.modifiedCount} courses to active: true.`);

    const totalAfter = await Course.countDocuments();
    const activeCount = await Course.countDocuments({ active: true });
    const inactiveCount = await Course.countDocuments({ active: false });

    console.log(`Total after: ${totalAfter}, Active: ${activeCount}, Inactive: ${inactiveCount}`);

    process.exit(0);
  } catch (err) {
    console.error('Error activating courses:', err);
    process.exit(1);
  }
}

activateCourses();
