import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

async function inspect() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));
    const count = await Course.countDocuments();
    console.log('Total courses in DB:', count);

    const sample = await Course.find({}).limit(3);
    console.log('Sample course fields:', Object.keys(sample[0]?._doc || {}));
    console.log('Sample course 1:', JSON.stringify(sample[0], null, 2));

    const distinctProviders = await Course.distinct('provider');
    console.log('Distinct providers:', distinctProviders);

    const distinctCategories = await Course.distinct('category');
    console.log('Distinct categories count:', distinctCategories.length);

    const distinctRoles = await Course.distinct('roles');
    console.log('Distinct roles in DB:', distinctRoles);

    const withRolesCount = await Course.countDocuments({ roles: { $exists: true, $ne: [] } });
    console.log('Courses with non-empty roles array:', withRolesCount);

    const withoutRolesCount = await Course.countDocuments({ $or: [{ roles: { $exists: false } }, { roles: { $size: 0 } }] });
    console.log('Courses without roles array:', withoutRolesCount);

    process.exit(0);
  } catch (err) {
    console.error('Inspection error:', err);
    process.exit(1);
  }
}

inspect();
