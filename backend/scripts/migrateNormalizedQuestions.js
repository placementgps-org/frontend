import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import mongoose from 'mongoose';
import AptitudeQuestion from '../models/AptitudeQuestion.js';
import CompanyQuestion from '../models/CompanyQuestion.js';

export function normalizeQuestion(text) {
    if (!text) return '';
    return text
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s%.-]/g, '')
        .trim();
}

const runMigration = async () => {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected. Starting migration for AptitudeQuestion...');

    const processModel = async (Model, modelName) => {
        const questions = await Model.find({});
        let updated = 0;
        let deleted = 0;
        
        // Keep track of what we've seen to delete duplicates
        // Key format: topic|difficulty|normalizedQuestion
        const seen = new Set();

        for (const q of questions) {
            const normText = normalizeQuestion(q.question);
            const key = `${q.topic}|${q.difficulty}|${normText}`;

            if (seen.has(key)) {
                // It's a duplicate, delete it
                await Model.findByIdAndDelete(q._id);
                deleted++;
            } else {
                seen.add(key);
                q.normalizedQuestion = normText;
                await q.save();
                updated++;
            }
        }
        
        console.log(`[${modelName}] Updated: ${updated}, Deleted Duplicates: ${deleted}`);
    };

    try {
        await processModel(AptitudeQuestion, 'AptitudeQuestion');
        await processModel(CompanyQuestion, 'CompanyQuestion');
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    }
    process.exit(0);
};

runMigration();
