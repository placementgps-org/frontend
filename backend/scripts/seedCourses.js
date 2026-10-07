import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Course from '../models/Course.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for Course seeding...');

    const dataPath = path.join(__dirname, '../data/free_course_catalog.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const courses = JSON.parse(rawData);

    let inserted = 0;
    let updated = 0;

    for (const courseData of courses) {
      // Upsert based on courseLink to avoid duplicates
      const result = await Course.updateOne(
        { courseId: courseData.courseId },
        { $set: courseData },
        { upsert: true }
      );
      
      if (result.upsertedCount > 0) {
        inserted++;
      } else if (result.modifiedCount > 0) {
        updated++;
      }
    }

    console.log(`Seed Complete: ${inserted} courses inserted, ${updated} courses updated.`);
    console.log(`Total courses processed: ${courses.length}`);
    process.exit();
  } catch (error) {
    console.error('Error seeding courses:', error);
    process.exit(1);
  }
};

seedCourses();
