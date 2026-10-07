import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Course from '../models/Course.js';

dotenv.config();

const ibmData = `IBM-SB-001	Getting Started with Artificial Intelligence	IBM SkillsBuild	Artificial Intelligence	Foundational	3 hours	https://skillsbuild.org/college-students/course-catalog/getting-started-with-artificial-intelligence	Digital credential
IBM-SB-002	Introduction to Large Language Models	IBM SkillsBuild	Artificial Intelligence	Foundational	1-3 hours	https://skillsbuild.org/college-students/artificial-intelligence	Course catalog / AI page
IBM-SB-003	Build Your First Chatbot Using IBM watsonx™	IBM SkillsBuild	Artificial Intelligence	Foundational	60 minutes	https://skillsbuild.org/college-students/artificial-intelligence	Course catalog / AI page
IBM-SB-004	Prompt Engineering: Shaping Better AI Responses	IBM SkillsBuild	Artificial Intelligence	Intermediate	4 hours	https://skillsbuild.org/college-students/artificial-intelligence	Course catalog / AI page
IBM-SB-005	Turn Ideas Into Prototypes With Vibe Coding	IBM SkillsBuild	Artificial Intelligence	Foundational	60 minutes	https://skillsbuild.org/college-students/artificial-intelligence	Course catalog / AI page
IBM-SB-006	Ethical Considerations for Using Generative AI	IBM SkillsBuild	Artificial Intelligence	Foundational	60-90 minutes	https://skillsbuild.org/college-students/artificial-intelligence	Course catalog / AI page
IBM-SB-007	Unleashing the Power of AI Agents	IBM SkillsBuild	Artificial Intelligence	Intermediate	60-90 minutes	https://skillsbuild.org/college-students/artificial-intelligence	Course catalog / AI page
IBM-SB-008	The Rise of Multiagent Systems	IBM SkillsBuild	Artificial Intelligence	Intermediate	60-90 minutes	https://skillsbuild.org/college-students/artificial-intelligence	Course catalog / AI page
IBM-SB-009	Vector Embeddings: AI’s Key to Meaning	IBM SkillsBuild	Artificial Intelligence	Intermediate	60-90 minutes	https://skillsbuild.org/college-students/artificial-intelligence	Course catalog / AI page
IBM-SB-010	Classifying Data Using IBM Granite	IBM SkillsBuild	Artificial Intelligence	Intermediate	60 minutes	https://skillsbuild.org/college-students/artificial-intelligence	Course catalog / AI page
IBM-SB-011	Introduction to Retrieval-Augmented Generation	IBM SkillsBuild	Artificial Intelligence	Intermediate	60-90 minutes	https://skillsbuild.org/college-students/artificial-intelligence	Course catalog / AI page
IBM-SB-012	Explore Text to Speech Using IBM watson®	IBM SkillsBuild	Artificial Intelligence	Foundational	60 minutes	https://skillsbuild.org/college-students/artificial-intelligence	Course catalog / AI page
IBM-SB-013	AI in Legal: From Research to Results	IBM SkillsBuild	Artificial Intelligence	Foundational	90 minutes	https://skillsbuild.org/college-students/artificial-intelligence	Course catalog / AI page
IBM-SB-014	The Power of Personalized Finance with AI	IBM SkillsBuild	Artificial Intelligence	Foundational	60 minutes	https://skillsbuild.org/college-students/artificial-intelligence	Course catalog / AI page
IBM-SB-015	Transforming the Sports Fan Experience with AI	IBM SkillsBuild	Artificial Intelligence	Foundational	75 minutes	https://skillsbuild.org/college-students/artificial-intelligence	Course catalog / AI page
IBM-SB-016	Elevate Education with AI	IBM SkillsBuild	Artificial Intelligence	Foundational	75 minutes	https://skillsbuild.org/college-students/artificial-intelligence	Course catalog / AI page
IBM-SB-017	Make Agentic AI Work for You	IBM SkillsBuild	Artificial Intelligence	Intermediate	4 hours	https://skillsbuild.org/college-students/artificial-intelligence	Course catalog / AI page
IBM-SB-018	Generative AI Essentials: Using LLMs to Work with Data	IBM SkillsBuild	Artificial Intelligence	Intermediate	4 hours	https://skillsbuild.org/college-students/artificial-intelligence	Course catalog / AI page
IBM-SB-019	Data Classification and Summarization Using IBM Granite	IBM SkillsBuild	Artificial Intelligence	Intermediate	180-240 minutes	https://skillsbuild.org/college-students/artificial-intelligence	Course catalog / AI page
IBM-SB-020	Intelligent by Design: Build an AI Agent	IBM SkillsBuild	Artificial Intelligence	Intermediate	4 hours	https://skillsbuild.org/college-students/artificial-intelligence	Course catalog / AI page
IBM-SB-021	AI-Enabled Applications for Customer Service	IBM SkillsBuild	Artificial Intelligence	Intermediate	8 hours	https://skillsbuild.org/college-students/artificial-intelligence	Course catalog / AI page
IBM-SB-022	Generative AI in Action	IBM SkillsBuild	Artificial Intelligence	Intermediate	5+ hours	https://skillsbuild.org/college-students/artificial-intelligence	Course catalog / AI page
IBM-SB-023	Artificial Intelligence Practitioner Pathway	IBM SkillsBuild	Artificial Intelligence	Advanced	10+ hours	https://skillsbuild.org/college-students/artificial-intelligence	Course catalog / AI page
IBM-SB-024	Getting Started with Cybersecurity	IBM SkillsBuild	Cybersecurity	Foundational	3 hours	https://skillsbuild.org/college-students/course-catalog/getting-started-with-cybersecurity	Digital credential
IBM-SB-025	Getting Started with Threat Intelligence and Hunting	IBM SkillsBuild	Cybersecurity	Intermediate	5 hours	https://skillsbuild.org/college-students/cybersecurity	Course catalog / Cybersecurity page
IBM-SB-026	Enterprise Security in Practice	IBM SkillsBuild	Cybersecurity	Intermediate	10+ hours	https://skillsbuild.org/college-students/cybersecurity	Course catalog / Cybersecurity page
IBM-SB-027	Security Operations Center in Practice	IBM SkillsBuild	Cybersecurity	Advanced	20+ hours	https://skillsbuild.org/college-students/cybersecurity	Course catalog / Cybersecurity page
IBM-SB-028	Cybersecurity Fundamentals	IBM SkillsBuild	Cybersecurity	Foundational	7.5 hours	https://skillsbuild.org/college-students/cybersecurity	Course catalog / Cybersecurity page
IBM-SB-029	Cybersecurity Fluency Pathway	IBM SkillsBuild	Cybersecurity	Foundational	54 hours	https://skillsbuild.org/college-students/cybersecurity	Course catalog / Cybersecurity page`;

const mapDifficulty = (diff) => {
  if (diff === 'Foundational') return 'Easy';
  if (diff === 'Intermediate') return 'Medium';
  if (diff === 'Advanced') return 'Hard';
  return '';
};

const mapCategory = (cat) => {
  if (cat === 'Artificial Intelligence') return 'Data Science, AI & Machine Learning';
  if (cat === 'Cybersecurity') return 'Computer Science & IT'; // Using existing categories to fit in dropdowns, or Cybersecurity & Cloud Computing
  return cat;
};

const seedIBM = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for IBM Course seeding...');

    const lines = ibmData.trim().split('\n');
    let inserted = 0;
    let updated = 0;

    for (const line of lines) {
      if (!line.trim()) continue;
      const columns = line.split('\t');
      if (columns.length >= 7) {
        const courseData = {
          courseId: columns[0].trim(),
          courseName: columns[1].trim(),
          provider: columns[2].trim(),
          category: mapCategory(columns[3].trim()),
          department: columns[3].trim(), // Original category as department
          difficulty: mapDifficulty(columns[4].trim()),
          skills: `Duration: ${columns[5].trim()}`, // Append duration to skills
          courseLink: columns[6].trim(),
          certificateAvailable: columns[7] ? columns[7].trim() : '',
          active: true,
          sourceFiles: 'IBM SkillsBuild Prompt'
        };

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
    }

    console.log(`IBM Seed Complete: ${inserted} courses inserted, ${updated} courses updated.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding IBM courses:', error);
    process.exit(1);
  }
};

seedIBM();
