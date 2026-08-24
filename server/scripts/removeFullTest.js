import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, '../controllers/aptitudeController.js');

const code = fs.readFileSync(filePath, 'utf8');

const startIdx = code.indexOf('/**\n * @desc    Generate a mixed bag of questions for a Full Aptitude Test');
const endIdx = code.indexOf('/**\n * @desc    Generate AI topic notes');

if (startIdx !== -1 && endIdx !== -1) {
    const newCode = code.slice(0, startIdx) + code.slice(endIdx);
    fs.writeFileSync(filePath, newCode);
    console.log('Removed Full Test functions from controller');
} else {
    console.log('Could not find start or end index');
}
