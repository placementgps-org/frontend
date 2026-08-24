import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tsvData = `COURSE-0001	CS50: Introduction to Computer Science	Harvard University / Harvard / Harvard (via edX/CS50.harvard.edu)	https://cs50.harvard.edu/x/	Computer Science & IT / Computer	Computer Science	Easy					All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0002	CS50: Introduction to Programming with Python	Harvard University / Harvard	https://cs50.harvard.edu/python/	Computer Science & IT / Computer		Easy					All_Free_Courses_Master_List.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0003	CS50: Introduction to Web Programming	Harvard University / Harvard	https://cs50.harvard.edu/web/	Computer Science & IT / Computer		Medium					All_Free_Courses_Master_List.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0004	CS50's Introduction to Game Development	Harvard University	https://cs50.harvard.edu/games/	Computer Science & IT		Medium					All_Free_Courses_Master_List.xlsx	true
COURSE-0005	Responsive Web Design (HTML/CSS)	freeCodeCamp	https://www.freecodecamp.org/learn/2022/responsive-web-design/	Computer Science & IT / Computer	Computer Science	Easy					All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0006	JavaScript Algorithms and Data Structures	freeCodeCamp	https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/	Computer Science & IT / Computer	Computer Science	Medium					All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0007	Front End Development Libraries (React, Bootstrap)	freeCodeCamp	https://www.freecodecamp.org/learn/front-end-development-libraries/	Computer Science & IT / Computer		Medium					All_Free_Courses_Master_List.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0008	Back End Development and APIs (Node.js)	freeCodeCamp	https://www.freecodecamp.org/learn/back-end-development-and-apis/	Computer Science & IT / Computer		Medium					All_Free_Courses_Master_List.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0009	Relational Database (SQL)	freeCodeCamp	https://www.freecodecamp.org/learn/relational-database/	Computer Science & IT / Computer	CA & IT	Easy					All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0010	Scientific Computing with Python	freeCodeCamp	https://www.freecodecamp.org/learn/scientific-computing-with-python/	Computer Science & IT / Computer		Easy					All_Free_Courses_Master_List.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0011	College Algebra with Python	freeCodeCamp	https://www.freecodecamp.org/learn/college-algebra-with-python/	Computer Science & IT / Computer	Mathematics	Easy					All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0012	Information Security	freeCodeCamp	https://www.freecodecamp.org/learn/information-security/	Computer Science & IT / Computer	CA & IT	Medium					All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0013	Quality Assurance (Testing)	freeCodeCamp	https://www.freecodecamp.org/learn/quality-assurance/	Computer Science & IT / Computer		Medium					All_Free_Courses_Master_List.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0014	Full Stack Web Development Curriculum	The Odin Project	https://www.theodinproject.com/	Computer Science & IT		Medium					All_Free_Courses_Master_List.xlsx	true
COURSE-0015	Algorithms	Khan Academy	https://www.khanacademy.org/computing/computer-science/algorithms	Computer Science & IT		Medium					All_Free_Courses_Master_List.xlsx	true
COURSE-0016	Introduction to Algorithms (6.006)	MIT OpenCourseWare	https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/	Computer Science & IT / Computer		Hard					All_Free_Courses_Master_List.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0017	Intro to Computer Science and Programming in Python (6.0001)	MIT OpenCourseWare	https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/	Computer Science & IT / Computer	Computer Science	Medium					All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0018	AP Computer Science Principles	Khan Academy	https://www.khanacademy.org/computing/ap-computer-science-principles	Computer Science & IT / Computer		Easy					All_Free_Courses_Master_List.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0019	Intro to SQL: Querying and Managing Data	Khan Academy	https://www.khanacademy.org/computing/computer-programming/sql	Computer Science & IT / Computer		Easy					All_Free_Courses_Master_List.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0020	Diploma in Computer Science	Alison	https://alison.com/course/diploma-in-computer-science	Computer Science & IT / Computer		Medium					All_Free_Courses_Master_List.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0021	Free Computer Science Courses (multiple)	Great Learning Academy	https://www.mygreatlearning.com/academy/learn-for-free/subject/computer-science	Computer Science & IT / Computer		Easy					All_Free_Courses_Master_List.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0022	Data Structures & Algorithms Skills Certification	HackerRank	https://www.hackerrank.com/skills-verification	Computer Science & IT / Computer		Medium					All_Free_Courses_Master_List.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0023	Learn Git, GitHub & Open Source (interactive)	GitHub Skills	https://skills.github.com/	Computer Science & IT		Easy					All_Free_Courses_Master_List.xlsx	true
COURSE-0024	Applied Digital Skills (various tech topics)	Google	https://applieddigitalskills.withgoogle.com/	Computer Science & IT / Computer	Commerce Fintech	Easy					All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0025	Explore Free Computer Science Courses	SWAYAM (NPTEL)	https://swayam.gov.in/explorer?category=Computer%20Science%20and%20Engineering	Computer Science & IT		Medium					All_Free_Courses_Master_List.xlsx	true
COURSE-0026	Machine Learning with Python	freeCodeCamp	https://www.freecodecamp.org/learn/machine-learning-with-python/	Data Science, AI & Machine Learning / Computer		Medium					All_Free_Courses_Master_List.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0027	Data Analysis with Python	freeCodeCamp	https://www.freecodecamp.org/learn/data-analysis-with-python/	Data Science, AI & Machine Learning / Computer		Medium					All_Free_Courses_Master_List.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0028	Elements of AI (no-code AI fundamentals)	University of Helsinki / MinnaLearn	https://www.elementsofai.com/	Data Science, AI & Machine Learning		Easy					All_Free_Courses_Master_List.xlsx	true
COURSE-0029	Practical Deep Learning for Coders	fast.ai	https://course.fast.ai/	Data Science, AI & Machine Learning		Hard					All_Free_Courses_Master_List.xlsx	true
COURSE-0030	Machine Learning Crash Course	Google	https://developers.google.com/machine-learning/crash-course	Data Science, AI & Machine Learning		Medium					All_Free_Courses_Master_List.xlsx	true
COURSE-0031	Learn Python, Pandas & Machine Learning (micro-courses)	Kaggle Learn	https://www.kaggle.com/learn	Data Science, AI & Machine Learning		Easy					All_Free_Courses_Master_List.xlsx	true
COURSE-0032	TensorFlow Tutorials	TensorFlow / Google	https://www.tensorflow.org/tutorials	Data Science, AI & Machine Learning		Medium					All_Free_Courses_Master_List.xlsx	true
COURSE-0033	Introduction to Cybersecurity	Cisco Networking Academy (Skills for All)	https://skillsforall.com/course/introduction-to-cybersecurity	Cybersecurity & Cloud Computing / Computer		Easy					All_Free_Courses_Master_List.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0034	Cybersecurity Essentials	Cisco Networking Academy (Skills for All)	https://skillsforall.com/course/cybersecurity-essentials	Cybersecurity & Cloud Computing		Medium					All_Free_Courses_Master_List.xlsx	true
COURSE-0035	Networking Basics	Cisco Networking Academy (Skills for All)	https://skillsforall.com/course/networking-basics	Cybersecurity & Cloud Computing		Easy					All_Free_Courses_Master_List.xlsx	true
COURSE-0036	AWS Cloud Practitioner Essentials & Free Labs	AWS Skill Builder	https://skillbuilder.aws/	Cybersecurity & Cloud Computing		Easy					All_Free_Courses_Master_List.xlsx	true
COURSE-0037	Azure Fundamentals Learning Path	Microsoft Learn	https://learn.microsoft.com/en-us/training/paths/azure-fundamentals/	Cybersecurity & Cloud Computing		Easy					All_Free_Courses_Master_List.xlsx	true
COURSE-0038	Free Google Cloud Courses & Labs	Google Cloud Skills Boost	https://www.cloudskillsboost.google/	Cybersecurity & Cloud Computing		Easy					All_Free_Courses_Master_List.xlsx	true
COURSE-0039	Android Basics with Compose / Kotlin	Android Developers (Google)	https://developer.android.com/courses	Cybersecurity & Cloud Computing		Medium					All_Free_Courses_Master_List.xlsx	true
COURSE-0040	Explore Free Commerce & Management Courses	SWAYAM (NPTEL/UGC) / SWAYAM / SWAYAM (Govt. of India / NPTEL / UGC)	https://swayam.gov.in/explorer?category=Commerce%20%26%20Management	Commerce, Business & Finance / BCom	Commerce / Commerce Honors / Commerce Fintech						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0041	Explore All Free Courses (all streams)	NPTEL	https://nptel.ac.in/course.html	Commerce, Business & Finance / BCom	Commerce						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0042	Finance and Capital Markets	Khan Academy	https://www.khanacademy.org/economics-finance-domain/core-finance	Commerce, Business & Finance / BCom	Commerce						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0043	Microeconomics	Khan Academy	https://www.khanacademy.org/economics-finance-domain/microeconomics	Commerce, Business & Finance / BCom	Commerce Honors / Economics						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0044	Macroeconomics	Khan Academy	https://www.khanacademy.org/economics-finance-domain/macroeconomics	Commerce, Business & Finance / BCom	Commerce Honors / Economics						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0045	Diploma in Business Administration	Alison	https://alison.com/course/diploma-in-business-administration	Commerce, Business & Finance / BCom	Business Administration						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0046	Diploma in Business Management	Alison	https://alison.com/course/diploma-in-business-management	Commerce, Business & Finance / BCom	Business Administration						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0047	Diploma in Financial Accounting	Alison	https://alison.com/course/diploma-in-financial-accounting	Commerce, Business & Finance / BCom	Commerce PA (Professional Accounting)						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0048	Introduction to Bookkeeping	Alison	https://alison.com/course/introduction-to-bookkeeping	Commerce, Business & Finance / BCom	Commerce PA (Professional Accounting)						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0049	Diploma in Human Resource Management	Alison	https://alison.com/course/diploma-in-human-resource-management	Commerce, Business & Finance / BCom							All_Free_Courses_Master_List.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0050	Introduction to Financial Accounting (Wharton)	Coursera (free to audit)	https://www.coursera.org/learn/wharton-accounting	Commerce, Business & Finance / BCom	Commerce PA (Professional Accounting)						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0051	Introduction to Corporate Finance (Wharton)	Coursera (free to audit)	https://www.coursera.org/learn/wharton-finance	Commerce, Business & Finance / BCom	Commerce Honors						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0052	Financial Markets (Yale University)	Coursera (free to audit)	https://www.coursera.org/learn/financial-markets-global	Commerce, Business & Finance / BCom	Commerce CA (Chartered Accountancy)						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0053	Accounting Courses (various)	edX	https://www.edx.org/learn/accounting	Commerce, Business & Finance / BCom	Commerce PA (Professional Accounting)						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0054	Business Fundamentals (various)	edX	https://www.edx.org/learn/business	Commerce, Business & Finance / BCom	Business Administration						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0055	Free Certification Courses (Accounting, Tally, Taxation)	Vskills	https://www.vskills.in/certification/free-courses	Commerce, Business & Finance / BCom	Commerce CA (Chartered Accountancy) / CA & IT						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0056	TallyPrime Free Tutorials	Tally Solutions	https://help.tallysolutions.com/tally-prime/	Commerce, Business & Finance / BCom	Commerce CA (Chartered Accountancy) / CA & IT						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0057	BoS Knowledge Portal - Free Study Material	ICAI	https://www.icai.org/	Commerce, Business & Finance	Commerce CA (Chartered Accountancy)						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0058	Free Accounting Courses (multiple)	Great Learning Academy	https://www.mygreatlearning.com/academy/learn-for-free/subject/accounting	Commerce, Business & Finance / BCom	Commerce						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0059	Free Business Management Courses (multiple)	Great Learning Academy	https://www.mygreatlearning.com/academy/learn-for-free/subject/business-management	Commerce, Business & Finance / BCom	Business Administration						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0060	Free Finance Courses (multiple)	Great Learning Academy	https://www.mygreatlearning.com/academy/learn-for-free/subject/finance	Commerce, Business & Finance / BCom							All_Free_Courses_Master_List.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0061	Digital Marketing Certification	HubSpot Academy	https://academy.hubspot.com/courses/digital-marketing	Marketing & Digital Skills / BCom	Commerce Fintech						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0062	Inbound Marketing	HubSpot Academy	https://academy.hubspot.com/courses/inbound-marketing	Marketing & Digital Skills / BCom							All_Free_Courses_Master_List.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0063	Content Marketing Certification	HubSpot Academy	https://academy.hubspot.com/courses/content-marketing	Marketing & Digital Skills							All_Free_Courses_Master_List.xlsx	true
COURSE-0064	Social Media Marketing Certification	HubSpot Academy	https://academy.hubspot.com/courses/social-media	Marketing & Digital Skills							All_Free_Courses_Master_List.xlsx	true
COURSE-0065	SEO Training Course	HubSpot Academy	https://academy.hubspot.com/courses/seo-training	Marketing & Digital Skills							All_Free_Courses_Master_List.xlsx	true
COURSE-0066	Fundamentals of Digital Marketing	Google Digital Garage	https://learndigital.withgoogle.com/digitalgarage/course/digital-marketing	Marketing & Digital Skills / BCom	Commerce Fintech						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx | Free_Courses_Computer_BCom.xlsx	true
COURSE-0067	Circuits and Electronics (6.002)	MIT OpenCourseWare	https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/	Engineering							All_Free_Courses_Master_List.xlsx	true
COURSE-0068	Mechanics and Materials I (2.001)	MIT OpenCourseWare	https://ocw.mit.edu/courses/2-001-mechanics-materials-i-fall-2006/	Engineering							All_Free_Courses_Master_List.xlsx	true
COURSE-0069	Electrical Engineering	Khan Academy	https://www.khanacademy.org/science/electrical-engineering	Engineering							All_Free_Courses_Master_List.xlsx	true
COURSE-0070	Civil Engineering Courses (various)	edX	https://www.edx.org/learn/civil-engineering	Engineering							All_Free_Courses_Master_List.xlsx	true
COURSE-0071	Mechanical Engineering Courses (various)	edX	https://www.edx.org/learn/mechanical-engineering	Engineering							All_Free_Courses_Master_List.xlsx	true
COURSE-0072	Explore Free Engineering & Technology Courses	SWAYAM (NPTEL)	https://swayam.gov.in/explorer?category=Engineering%20and%20Technology	Engineering							All_Free_Courses_Master_List.xlsx	true
COURSE-0073	Physics (full syllabus)	Khan Academy	https://www.khanacademy.org/science/physics	Science (Physics, Chemistry, Biology)	Physics						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0074	Classical Mechanics (8.01SC)	MIT OpenCourseWare	https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/	Science (Physics, Chemistry, Biology)	Physics						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0075	Electricity and Magnetism (8.02SC)	MIT OpenCourseWare	https://ocw.mit.edu/courses/8-02sc-physics-ii-electricity-and-magnetism-fall-2010/	Science (Physics, Chemistry, Biology)	Physics						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0076	Physics Courses (various)	edX	https://www.edx.org/learn/physics	Science (Physics, Chemistry, Biology)	Physics						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0077	Chemistry (full syllabus)	Khan Academy	https://www.khanacademy.org/science/chemistry	Science (Physics, Chemistry, Biology)	Chemistry						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0078	Principles of Chemical Science (5.111SC)	MIT OpenCourseWare	https://ocw.mit.edu/courses/5-111sc-principles-of-chemical-science-fall-2014/	Science (Physics, Chemistry, Biology)	Chemistry						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0079	Chemistry Courses (various)	edX	https://www.edx.org/learn/chemistry	Science (Physics, Chemistry, Biology)	Chemistry						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0080	Biology (full syllabus)	Khan Academy	https://www.khanacademy.org/science/biology	Science (Physics, Chemistry, Biology)	Biotechnology / Microbiology						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0081	Introductory Biology (7.016)	MIT OpenCourseWare	https://ocw.mit.edu/courses/7-016-introductory-biology-fall-2018/	Science (Physics, Chemistry, Biology)	Biotechnology / Microbiology						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0082	Introduction to Biology - The Secret of Life (MIT)	edX	https://www.edx.org/learn/biology/massachusetts-institute-of-technology-7-00x-introduction-to-biology-the-secret-of-life	Science (Physics, Chemistry, Biology)	Biotechnology						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0083	Microbiology Courses (various)	edX	https://www.edx.org/learn/microbiology	Science (Physics, Chemistry, Biology)	Microbiology						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0084	Explore Free Biotechnology & Science Courses	SWAYAM (NPTEL) / SWAYAM	https://swayam.gov.in/explorer?category=Biotechnology	Science (Physics, Chemistry, Biology)	Biotechnology / Microbiology						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0085	Math (all levels)	Khan Academy	https://www.khanacademy.org/math	Mathematics	Mathematics						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0086	Single Variable Calculus (18.01SC)	MIT OpenCourseWare	https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/	Mathematics	Mathematics						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0087	Linear Algebra (18.06)	MIT OpenCourseWare	https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/	Mathematics	Mathematics						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0088	Principles of Microeconomics (14.01SC)	MIT OpenCourseWare	https://ocw.mit.edu/courses/14-01sc-principles-of-microeconomics-fall-2011/	Economics	Economics						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0089	Economics Courses (various)	edX	https://www.edx.org/learn/economics	Economics	Economics						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0090	Learn English Free (all levels)	British Council LearnEnglish	https://learnenglish.britishcouncil.org/	Humanities & Languages	English						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0091	Grammar	Khan Academy	https://www.khanacademy.org/humanities/grammar	Humanities & Languages	English						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0092	Improve Your English Communication Skills (Georgia Tech)	Coursera (free to audit)	https://www.coursera.org/specializations/improve-english	Humanities & Languages	English						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0093	Explore Free Humanities & Social Science Courses	SWAYAM (NPTEL) / SWAYAM	https://swayam.gov.in/explorer?category=Humanities%20and%20Social%20Sciences	Humanities & Languages	English						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0094	Beginners' Tamil: A Taster Course	OpenLearn (The Open University)	https://www.open.edu/openlearn/languages/beginners-tamil-a-taster-course/content-section-0	Humanities & Languages	Tamil						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0095	Learn Tamil (script, grammar, literature)	Tamil Virtual Academy (Govt. of Tamil Nadu)	https://www.tamilvu.org/	Humanities & Languages	Tamil						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0096	Introduction to Psychology (Yale University)	Coursera (free to audit)	https://www.coursera.org/learn/introduction-psychology	Psychology	Psychology						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0097	Diploma in Psychology	Alison	https://alison.com/course/diploma-in-psychology	Psychology	Psychology						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0098	Behavior (Psychology/MCAT section)	Khan Academy	https://www.khanacademy.org/test-prep/mcat/behavior	Psychology	Psychology						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0099	Psychology Courses (various)	edX	https://www.edx.org/learn/psychology	Psychology	Psychology						All_Free_Courses_Master_List.xlsx | Free_Courses_By_Department.xlsx	true
COURSE-0100	The Science of Well-Being (Yale University)	Coursera (free to audit)	https://www.coursera.org/learn/the-science-of-well-being	Psychology							All_Free_Courses_Master_List.xlsx	true
COURSE-0101	Diploma in Graphic Design	Alison	https://alison.com/course/diploma-in-graphic-design	Design & Arts							All_Free_Courses_Master_List.xlsx	true
COURSE-0102	Fundamentals of Graphic Design (CalArts)	Coursera (free to audit)	https://www.coursera.org/learn/fundamentals-of-graphic-design	Design & Arts							All_Free_Courses_Master_List.xlsx	true
COURSE-0103	Design Thinking for Innovation (UVA Darden)	Coursera (free to audit)	https://www.coursera.org/learn/uva-darden-design-thinking-innovation	Design & Arts							All_Free_Courses_Master_List.xlsx	true
COURSE-0104	Free Design Courses (multiple)	Great Learning Academy	https://www.mygreatlearning.com/academy/learn-for-free/subject/graphic-design	Design & Arts							All_Free_Courses_Master_List.xlsx	true
COURSE-0105	Learning How to Learn	Coursera (free to audit)	https://www.coursera.org/learn/learning-how-to-learn	Personal Development & Soft Skills							All_Free_Courses_Master_List.xlsx	true
COURSE-0106	Free Soft Skills Courses (multiple)	Great Learning Academy	https://www.mygreatlearning.com/academy/learn-for-free/subject/soft-skills	Personal Development & Soft Skills							All_Free_Courses_Master_List.xlsx	true
COURSE-0107	Explore Free Science Courses	SWAYAM	https://swayam.gov.in/explorer		Chemistry / Tamil						Free_Courses_By_Department.xlsx	true
COURSE-0108	NPTEL Video Lectures (many in/about Tamil)	NPTEL YouTube Channel	https://www.youtube.com/@nptelhrd		Tamil						Free_Courses_By_Department.xlsx	true
COURSE-0109	Computer Programming (JS/HTML/SQL basics)	Khan Academy	https://www.khanacademy.org/computing/computer-programming	Computer		Easy					Free_Courses_Computer_BCom.xlsx	true
COURSE-0110	Digital Skills & Networking Courses	Cisco Networking Academy (Skills for All)	https://skillsforall.com/	Computer							Free_Courses_Computer_BCom.xlsx	true
COURSE-0111	Accounting and Financial Statements	Khan Academy	https://www.khanacademy.org/economics-finance-domain/core-finance/accounting-and-financial-stateme	BCom							Free_Courses_Computer_BCom.xlsx	true
COURSE-0112	Inbound Sales	HubSpot Academy	https://academy.hubspot.com/courses/inbound-sales	BCom							Free_Courses_Computer_BCom.xlsx	true`;

const lines = tsvData.trim().split('\n');
const courses = [];

lines.forEach(line => {
  const columns = line.split('\t');
  if (columns.length >= 12 && columns[0].trim() !== '') {
    const normalize = (str) => {
        if (!str) return '';
        return str.trim();
    };
    
    courses.push({
      courseId: normalize(columns[0]),
      courseName: normalize(columns[1]),
      provider: normalize(columns[2]),
      courseLink: normalize(columns[3]),
      category: normalize(columns[4]),
      department: normalize(columns[5]),
      difficulty: normalize(columns[6]),
      skills: normalize(columns[7]),
      prerequisites: normalize(columns[8]),
      certificateAvailable: normalize(columns[9]),
      sourceFiles: normalize(columns[10]),
      active: normalize(columns[11]) === 'true'
    });
  }
});

const outputPath = path.join(__dirname, 'free_course_catalog.json');
fs.writeFileSync(outputPath, JSON.stringify(courses, null, 2));
console.log('Successfully parsed ' + courses.length + ' courses into ' + outputPath);
