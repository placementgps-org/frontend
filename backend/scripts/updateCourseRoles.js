import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Course from '../models/Course.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const data = `COURSE-0001	CS50: Introduction to Computer Science	Software Engineer, Python Developer, Backend Developer, Web Developer
COURSE-0002	CS50: Introduction to Programming with Python	Software Engineer, Python Developer, Backend Developer, Web Developer
COURSE-0003	CS50: Introduction to Web Programming	Full Stack Developer, Web Developer, Backend Developer
COURSE-0004	CS50's Introduction to Game Development	Game Developer, Software Engineer
COURSE-0005	Responsive Web Design (HTML/CSS)	Frontend Developer, Web Developer, Full Stack Developer, UI/UX Designer
COURSE-0006	JavaScript Algorithms and Data Structures	Frontend Developer, Web Developer, Software Engineer
COURSE-0007	Front End Development Libraries (React, Bootstrap)	Frontend Developer, Full Stack Developer, Web Developer
COURSE-0008	Back End Development and APIs (Node.js)	Backend Developer, Full Stack Developer, Web Developer, Software Engineer
COURSE-0009	Relational Database (SQL)	Database Administrator, Data Engineer, Backend Developer, Data Analyst
COURSE-0010	Scientific Computing with Python	Python Developer, Software Engineer, Data Analyst
COURSE-0011	College Algebra with Python	Python Developer, Data Analyst, Data Scientist
COURSE-0012	Information Security	Cybersecurity Engineer, Cybersecurity Analyst, Penetration Tester / Ethical Hacker
COURSE-0013	Quality Assurance (Testing)	QA Engineer, Automation Test Engineer
COURSE-0014	Full Stack Web Development Curriculum	Full Stack Developer, Web Developer, Software Engineer
COURSE-0015	Algorithms	Software Engineer, Data Engineer, Data Scientist, Machine Learning
COURSE-0016	Introduction to Algorithms (6.006)	Software Engineer, Data Engineer, Data Scientist, Machine Learning
COURSE-0017	Intro to Computer Science and Programming in Python (6.0001)	Python Developer, Software Engineer, Data Analyst
COURSE-0018	AP Computer Science Principles	Software Engineer, Full Stack Developer, Python Developer
COURSE-0019	Intro to SQL: Querying and Managing Data	Database Administrator, Data Engineer, Backend Developer, Data Analyst
COURSE-0020	Diploma in Computer Science	Software Engineer, Full Stack Developer, Python Developer
COURSE-0021	Free Computer Science Courses (multiple)	Software Engineer, Full Stack Developer, Python Developer
COURSE-0022	Data Structures & Algorithms Skills Certification	Software Engineer, Data Engineer, Data Scientist, Machine Learning
COURSE-0023	Learn Git, GitHub & Open Source (interactive)	DevOps Engineer, Software Engineer, Systems Administrator, DevSecOps Engineer
COURSE-0024	Applied Digital Skills (various tech topics)	IT Support Specialist, Business Analyst, Digital Marketing Specialist
COURSE-0025	Explore Free Computer Science Courses	Software Engineer, Full Stack Developer, Python Developer
COURSE-0026	Machine Learning with Python	Machine Learning, AI Engineer, Data Scientist, Python Developer
COURSE-0027	Data Analysis with Python	Data Scientist, Data Analyst, Data Engineer, Machine Learning, Python Developer
COURSE-0028	Elements of AI (no-code AI fundamentals)	AI Engineer, Data Scientist, Business Analyst
COURSE-0029	Practical Deep Learning for Coders	AI Engineer, Machine Learning, Computer Vision Engineer, Data Scientist
COURSE-0030	Machine Learning Crash Course	Machine Learning, AI Engineer, Data Scientist, Python Developer
COURSE-0031	Learn Python, Pandas & Machine Learning (micro-courses)	Data Scientist, Data Analyst, Data Engineer, Machine Learning, Python Developer
COURSE-0032	TensorFlow Tutorials	AI Engineer, Machine Learning, Computer Vision Engineer, Data Scientist
COURSE-0033	Introduction to Cybersecurity	Cybersecurity Engineer, Cybersecurity Analyst, SOC Analyst, Penetration Tester / Ethical Hacker
COURSE-0034	Cybersecurity Essentials	Cybersecurity Engineer, Cybersecurity Analyst, SOC Analyst, Penetration Tester / Ethical Hacker
COURSE-0035	Networking Basics	Network Engineer, Network Administrator, Systems Administrator
COURSE-0036	AWS Cloud Practitioner Essentials & Free Labs	Cloud Architect, Cloud Engineer, DevOps Engineer
COURSE-0037	Azure Fundamentals Learning Path	Cloud Architect, Cloud Engineer, Solutions Architect
COURSE-0038	Free Google Cloud Courses & Labs	Cloud Architect, Cloud Engineer, DevOps Engineer
COURSE-0039	Android Basics with Compose / Kotlin	Mobile Developer, Software Engineer
COURSE-0040	Explore Free Commerce & Management Courses	Business Analyst, Management Trainee, Operations Executive, Business Development Executive
COURSE-0041	Explore All Free Courses (all streams)	Business Analyst, Management Trainee, Operations Executive, Business Development Executive
COURSE-0042	Finance and Capital Markets	Financial Analyst, Finance Operations Associate, Business Analyst
COURSE-0043	Microeconomics	Economics Analyst, Business Analyst, Financial Analyst
COURSE-0044	Macroeconomics	Economics Analyst, Business Analyst, Financial Analyst
COURSE-0045	Diploma in Business Administration	Management Trainee, Business Analyst, Operations Executive, Business Development Executive
COURSE-0046	Diploma in Business Management	Management Trainee, Business Analyst, Operations Executive, Business Development Executive
COURSE-0047	Diploma in Financial Accounting	Accountant, Finance Operations Associate, Financial Analyst
COURSE-0048	Introduction to Bookkeeping	Accountant, Finance Operations Associate, Financial Analyst
COURSE-0049	Diploma in Human Resource Management	HR Specialist, Recruiter, HR Operations Executive
COURSE-0050	Introduction to Financial Accounting (Wharton)	Accountant, Finance Operations Associate, Financial Analyst
COURSE-0051	Introduction to Corporate Finance (Wharton)	Financial Analyst, Finance Operations Associate, Business Analyst
COURSE-0052	Financial Markets (Yale University)	Financial Analyst, Accountant, Auditor, Tax Associate
COURSE-0053	Accounting Courses (various)	Accountant, Finance Operations Associate, Financial Analyst
COURSE-0054	Business Fundamentals (various)	Management Trainee, Business Analyst, Operations Executive, Business Development Executive
COURSE-0055	Free Certification Courses (Accounting, Tally, Taxation)	Accountant, Tax Associate, Auditor, Finance Operations Associate
COURSE-0056	TallyPrime Free Tutorials	Accountant, Tax Associate, Auditor
COURSE-0057	BoS Knowledge Portal - Free Study Material	Financial Analyst, Accountant, Auditor, Tax Associate
COURSE-0058	Free Accounting Courses (multiple)	Accountant, Finance Operations Associate, Financial Analyst
COURSE-0059	Free Business Management Courses (multiple)	Management Trainee, Business Analyst, Operations Executive, Business Development Executive
COURSE-0060	Free Finance Courses (multiple)	Financial Analyst, Finance Operations Associate, Business Analyst
COURSE-0061	Digital Marketing Certification	Digital Marketing Specialist, SEO Specialist, Social Media Specialist, Content Marketing Specialist, Business Development Executive
COURSE-0062	Inbound Marketing	Digital Marketing Specialist, SEO Specialist, Social Media Specialist, Content Marketing Specialist, Business Development Executive
COURSE-0063	Content Marketing Certification	Digital Marketing Specialist, SEO Specialist, Social Media Specialist, Content Marketing Specialist, Business Development Executive
COURSE-0064	Social Media Marketing Certification	Digital Marketing Specialist, SEO Specialist, Social Media Specialist, Content Marketing Specialist, Business Development Executive
COURSE-0065	SEO Training Course	Digital Marketing Specialist, SEO Specialist, Social Media Specialist, Content Marketing Specialist, Business Development Executive
COURSE-0066	Fundamentals of Digital Marketing	Digital Marketing Specialist, SEO Specialist, Social Media Specialist, Content Marketing Specialist, Business Development Executive
COURSE-0067	Circuits and Electronics (6.002)	Electrical Engineer, Embedded Systems Engineer
COURSE-0068	Mechanics and Materials I (2.001)	Mechanical Engineer
COURSE-0069	Electrical Engineering	Electrical Engineer, Embedded Systems Engineer
COURSE-0070	Civil Engineering Courses (various)	Civil Engineer
COURSE-0071	Mechanical Engineering Courses (various)	Electrical Engineer, Mechanical Engineer, Civil Engineer, Embedded Systems Engineer
COURSE-0072	Explore Free Engineering & Technology Courses	Electrical Engineer, Mechanical Engineer, Civil Engineer, Embedded Systems Engineer
COURSE-0073	Physics (full syllabus)	Research Assistant, Physics / Lab Analyst
COURSE-0074	Classical Mechanics (8.01SC)	Research Assistant, Physics / Lab Analyst
COURSE-0075	Electricity and Magnetism (8.02SC)	Research Assistant, Physics / Lab Analyst
COURSE-0076	Physics Courses (various)	Research Assistant, Physics / Lab Analyst
COURSE-0077	Chemistry (full syllabus)	Research Assistant, Chemistry / Lab Analyst
COURSE-0078	Principles of Chemical Science (5.111SC)	Research Assistant, Chemistry / Lab Analyst
COURSE-0079	Chemistry Courses (various)	Research Assistant, Chemistry / Lab Analyst
COURSE-0080	Biology (full syllabus)	Biotechnology / Microbiology Analyst, Research Assistant, Lab Analyst
COURSE-0081	Introductory Biology (7.016)	Biotechnology / Microbiology Analyst, Research Assistant, Lab Analyst
COURSE-0082	Introduction to Biology - The Secret of Life (MIT)	Biotechnology / Microbiology Analyst, Research Assistant, Lab Analyst
COURSE-0083	Microbiology Courses (various)	Biotechnology / Microbiology Analyst, Research Assistant, Lab Analyst
COURSE-0084	Explore Free Biotechnology & Science Courses	Biotechnology / Microbiology Analyst, Research Assistant, Lab Analyst
COURSE-0085	Math (all levels)	Data Analyst, Data Scientist, Financial Analyst, Research Assistant
COURSE-0086	Single Variable Calculus (18.01SC)	Data Analyst, Data Scientist, Financial Analyst, Research Assistant
COURSE-0087	Linear Algebra (18.06)	Data Analyst, Data Scientist, Financial Analyst, Research Assistant
COURSE-0088	Principles of Microeconomics (14.01SC)	Economics Analyst, Financial Analyst, Business Analyst
COURSE-0089	Economics Courses (various)	Economics Analyst, Financial Analyst, Business Analyst
COURSE-0090	Learn English Free (all levels)	English Communication Trainer, Content Marketing Specialist, Customer Success Executive, Sales Executive
COURSE-0091	Grammar	English Communication Trainer, Content Marketing Specialist, Customer Success Executive, Sales Executive
COURSE-0092	Improve Your English Communication Skills (Georgia Tech)	English Communication Trainer, Content Marketing Specialist, Customer Success Executive, Sales Executive
COURSE-0093	Explore Free Humanities & Social Science Courses	Research Assistant, English Communication Trainer, Business Analyst
COURSE-0094	Beginners' Tamil: A Taster Course	Content Writer, Language Trainer
COURSE-0095	Learn Tamil (script, grammar, literature)	Content Writer, Language Trainer
COURSE-0096	Introduction to Psychology (Yale University)	Psychology / Wellbeing Professional, HR Specialist, Recruiter, Customer Success Executive
COURSE-0097	Diploma in Psychology	Psychology / Wellbeing Professional, HR Specialist, Recruiter, Customer Success Executive
COURSE-0098	Behavior (Psychology/MCAT section)	Psychology / Wellbeing Professional, HR Specialist, Recruiter, Customer Success Executive
COURSE-0099	Psychology Courses (various)	Psychology / Wellbeing Professional, HR Specialist, Recruiter, Customer Success Executive
COURSE-0100	The Science of Well-Being (Yale University)	Psychology / Wellbeing Professional, HR Specialist, Recruiter, Customer Success Executive
COURSE-0101	Diploma in Graphic Design	Graphic Designer, UI/UX Designer, Product Designer
COURSE-0102	Fundamentals of Graphic Design (CalArts)	Graphic Designer, UI/UX Designer, Product Designer
COURSE-0103	Design Thinking for Innovation (UVA Darden)	Graphic Designer, UI/UX Designer, Product Designer
COURSE-0104	Free Design Courses (multiple)	Graphic Designer, UI/UX Designer, Product Designer
COURSE-0105	Learning How to Learn	Management Trainee, HR Specialist, Customer Success Executive, Business Analyst
COURSE-0106	Free Soft Skills Courses (multiple)	Management Trainee, HR Specialist, Customer Success Executive, Business Analyst
COURSE-0107	Explore Free Science Courses	Research Assistant, Chemistry / Lab Analyst
COURSE-0108	NPTEL Video Lectures (many in/about Tamil)	Research Assistant, Language Trainer
COURSE-0109	Computer Programming (JS/HTML/SQL basics)	Frontend Developer, Web Developer, Backend Developer, Database Administrator
COURSE-0110	Digital Skills & Networking Courses	Network Engineer, Network Administrator, IT Support Specialist
COURSE-0111	Accounting and Financial Statements	Accountant, Finance Operations Associate, Financial Analyst
COURSE-0112	Inbound Sales	Sales Executive, Business Development Executive, Customer Success Executive
IBM-SB-001	Getting Started with Artificial Intelligence	AI Engineer, Generative AI Engineer, Machine Learning, Data Scientist
IBM-SB-002	Introduction to Large Language Models	AI Engineer, Generative AI Engineer, NLP Engineer, Data Scientist
IBM-SB-003	Build Your First Chatbot Using IBM watsonx™	AI Engineer, Generative AI Engineer, Backend Developer, Software Engineer
IBM-SB-004	Prompt Engineering: Shaping Better AI Responses	AI Engineer, Generative AI Engineer, Software Engineer, Business Analyst
IBM-SB-005	Turn Ideas Into Prototypes With Vibe Coding	Software Engineer, Full Stack Developer, Generative AI Engineer, Product Designer
IBM-SB-006	Ethical Considerations for Using Generative AI	AI Engineer, Generative AI Engineer, Business Analyst
IBM-SB-007	Unleashing the Power of AI Agents	AI Engineer, Generative AI Engineer, Software Engineer
IBM-SB-008	The Rise of Multiagent Systems	AI Engineer, Generative AI Engineer, Software Engineer
IBM-SB-009	Vector Embeddings: AI’s Key to Meaning	AI Engineer, Machine Learning, Data Scientist, Data Engineer
IBM-SB-010	Classifying Data Using IBM Granite	Data Scientist, Data Analyst, Data Engineer, Machine Learning
IBM-SB-011	Introduction to Retrieval-Augmented Generation	AI Engineer, Generative AI Engineer, Data Engineer, NLP Engineer
IBM-SB-012	Explore Text to Speech Using IBM watson®	AI Engineer, NLP Engineer, Software Engineer
IBM-SB-013	AI in Legal: From Research to Results	Legal Research Assistant, Business Analyst
IBM-SB-014	The Power of Personalized Finance with AI	Financial Analyst, AI Engineer, Business Analyst
IBM-SB-015	Transforming the Sports Fan Experience with AI	Business Analyst, Customer Success Executive, AI Engineer
IBM-SB-016	Elevate Education with AI	Education / Training Specialist, AI Engineer, Business Analyst
IBM-SB-017	Make Agentic AI Work for You	AI Engineer, Generative AI Engineer, Software Engineer
IBM-SB-018	Generative AI Essentials: Using LLMs to Work with Data	AI Engineer, Generative AI Engineer, Data Engineer, Data Scientist
IBM-SB-019	Data Classification and Summarization Using IBM Granite	Data Scientist, Data Analyst, Data Engineer
IBM-SB-020	Intelligent by Design: Build an AI Agent	AI Engineer, Generative AI Engineer, Software Engineer
IBM-SB-021	AI-Enabled Applications for Customer Service	AI Engineer, Customer Success Executive, Business Analyst
IBM-SB-022	Generative AI in Action	AI Engineer, Generative AI Engineer, Machine Learning, Data Scientist
IBM-SB-023	Artificial Intelligence Practitioner Pathway	AI Engineer, Generative AI Engineer, Machine Learning, Data Scientist
IBM-SB-024	Getting Started with Cybersecurity	Cybersecurity Engineer, Cybersecurity Analyst, SOC Analyst
IBM-SB-025	Getting Started with Threat Intelligence and Hunting	Threat Intelligence Analyst, Cybersecurity Analyst, SOC Analyst, Cybersecurity Engineer
IBM-SB-026	Enterprise Security in Practice	Cybersecurity Engineer, Cloud Security Engineer, Cybersecurity Analyst
IBM-SB-027	Security Operations Center in Practice	SOC Analyst, Cybersecurity Engineer, Cybersecurity Analyst
IBM-SB-028	Cybersecurity Fundamentals	Cybersecurity Engineer, Cybersecurity Analyst, SOC Analyst
IBM-SB-029	Cybersecurity Fluency Pathway	Cybersecurity Engineer, Cybersecurity Analyst, SOC Analyst, Threat Intelligence Analyst`;

async function updateCourseRoles() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const lines = data.trim().split('\n');
  let updatedCount = 0;
  let notFoundCount = 0;
  let totalRolesAdded = 0;

  for (const line of lines) {
    if (!line.trim()) continue;
    
    // Format: CourseID \t CourseName \t Roles
    const parts = line.split('\t');
    if (parts.length < 3) continue;

    const courseId = parts[0].trim();
    const courseName = parts[1].trim();
    const rolesStr = parts[2].trim();
    
    const newRoles = rolesStr.split(',').map(r => r.trim()).filter(Boolean);
    
    // Since roles in our app are typically slugified like 'full-stack-developer', 
    // we should format them to match the database patterns or keep as is if semantic matching handles it.
    // The prompt says "Do not change any course data... add only roles that are missing".
    // Wait, the prompt says the roles are e.g., "Full Stack Developer", "Software Engineer", etc.
    // Let's create a helper to slugify them so they match the system's career IDs (e.g., 'software-engineer').
    const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const slugifiedRoles = newRoles.map(slugify);

    // Try finding by CourseId
    let course = await Course.findOne({ courseId });
    if (!course) {
       // Fallback to name
       course = await Course.findOne({ courseName });
    }

    if (course) {
       // Merge roles without duplication
       const existingRoles = course.roles || [];
       let addedForThisCourse = 0;
       
       slugifiedRoles.forEach(newRole => {
          if (!existingRoles.includes(newRole)) {
             existingRoles.push(newRole);
             addedForThisCourse++;
             totalRolesAdded++;
          }
       });
       
       if (addedForThisCourse > 0) {
          course.roles = existingRoles;
          await course.save();
          updatedCount++;
          console.log(`[MERGED] ${courseId} (${courseName}): Added ${addedForThisCourse} roles.`);
       } else {
          console.log(`[SKIPPED] ${courseId} (${courseName}): All roles already exist.`);
       }
    } else {
       console.log(`[NOT FOUND] Cannot find course ${courseId} (${courseName})`);
       notFoundCount++;
    }
  }

  const totalCourses = await Course.countDocuments();

  console.log('\n=======================================');
  console.log(`Total Courses in DB: ${totalCourses}`);
  console.log(`Courses successfully updated with new roles: ${updatedCount}`);
  console.log(`Total individual role mappings added: ${totalRolesAdded}`);
  console.log(`Courses not found: ${notFoundCount}`);
  console.log('=======================================');

  mongoose.disconnect();
}

updateCourseRoles().catch(console.error);
