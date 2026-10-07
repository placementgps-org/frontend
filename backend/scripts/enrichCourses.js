import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Course from '../models/Course.js';
import { classifyCourse } from '../data/careerTaxonomy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const enrichCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for Course Enrichment...');

    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses to process.`);

    let enrichedCount = 0;

    for (const course of courses) {
      const metadata = classifyCourse(course.courseName || '', course.category || '', course.department || '');
      
      // We always update to ensure it reflects latest taxonomy
      course.domains = metadata.domains;
      course.roles = metadata.roles;
      course.skillsArray = metadata.skills;

      // Ensure that if the course explicitly mentions the original skills string, we keep it
      if (course.skills && typeof course.skills === 'string') {
        const existingSkills = course.skills.split(',').map(s => s.trim()).filter(Boolean);
        existingSkills.forEach(s => {
          if (!course.skillsArray.includes(s)) {
            course.skillsArray.push(s);
          }
        });
      }

      await course.save();
      
      if (metadata.roles.length > 0) {
        enrichedCount++;
      }
    }

    console.log(`Enrichment Complete: ${enrichedCount} out of ${courses.length} courses successfully tagged with roles/domains.`);
    process.exit();
  } catch (error) {
    console.error('Error enriching courses:', error);
    process.exit(1);
  }
};

enrichCourses();
