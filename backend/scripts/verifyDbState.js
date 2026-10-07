import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function verify() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));

    const total = await Course.countDocuments();
    const active = await Course.countDocuments({ active: true });
    const inactive = await Course.countDocuments({ active: false });

    console.log(`Total: ${total}, Active: ${active}, Inactive: ${inactive}`);

    const roles = await Course.distinct('roles');
    console.log(`Distinct roles count: ${roles.length}`);

    // Check roles distribution across some sample careers
    const careers = [
      'full-stack-developer',
      'software-engineer',
      'ai-engineer',
      'data-scientist',
      'cybersecurity-engineer',
      'cloud-architect',
      'devops-engineer',
      'business-analyst',
      'financial-analyst',
      'hr-specialist'
    ];

    for (const c of careers) {
      const matchExact = await Course.countDocuments({ roles: c });
      console.log(`Career '${c}' mapped courses count: ${matchExact}`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verify();
