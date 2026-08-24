import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

async function checkActive() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));
    const total = await Course.countDocuments();
    const activeTrue = await Course.countDocuments({ active: true });
    const activeFalse = await Course.countDocuments({ active: false });
    const activeMissing = await Course.countDocuments({ active: { $exists: false } });
    console.log(`Total: ${total}, active=true: ${activeTrue}, active=false: ${activeFalse}, missing: ${activeMissing}`);

    const inactiveSamples = await Course.find({ active: false }).limit(5);
    console.log('Inactive sample names:', inactiveSamples.map(c => ({ id: c.courseId, name: c.courseName, active: c.active })));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkActive();
