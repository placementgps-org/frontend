/**
 * Placement GPS — Complete Career Roadmap Templates
 * All 12 careers have unique, professional, career-specific roadmaps.
 * NO career falls back to another career's content.
 */

export const CAREER_METADATA = {
  'software-engineer': {
    title: 'Software Engineer',
    description: 'Design, build, test and maintain software applications across many domains.',
    whatTheyDo: 'Write clean code, review peers\' code, collaborate with product/design teams, debug and fix production issues, and ship features that millions of users interact with daily.',
    responsibilities: ['Writing production-quality code', 'Code review', 'System design', 'Bug fixing', 'Documentation', 'Collaboration with cross-functional teams'],
    coreSkills: ['DSA', 'OOP', 'System Design', 'Version Control', 'Problem Solving'],
    tools: ['Git', 'VS Code', 'Jira', 'Docker', 'CI/CD tools'],
  },
  'full-stack-developer': {
    title: 'Full Stack Developer',
    description: 'Build both the frontend (what users see) and backend (server, database) of web applications.',
    whatTheyDo: 'Design and implement complete web products — from pixel-perfect UIs to scalable APIs and database schemas.',
    responsibilities: ['Building responsive UIs', 'Designing RESTful APIs', 'Database schema design', 'Authentication & Authorization', 'Deployment & hosting'],
    coreSkills: ['HTML/CSS/JS', 'React', 'Node.js', 'Databases', 'REST APIs'],
    tools: ['React', 'Node.js', 'MongoDB', 'PostgreSQL', 'Git', 'Vercel', 'AWS'],
  },
  'mobile-developer': {
    title: 'Mobile Developer',
    description: 'Build native and cross-platform mobile applications for iOS and Android.',
    whatTheyDo: 'Create feature-rich mobile apps, integrate device hardware (camera, GPS, sensors), publish to app stores, and optimize for performance on mobile hardware.',
    responsibilities: ['Designing app architecture', 'UI/UX implementation for mobile', 'API integration', 'App store publishing', 'Performance tuning', 'Push notifications'],
    coreSkills: ['React Native / Flutter', 'Kotlin / Swift', 'REST APIs', 'State Management', 'Device APIs'],
    tools: ['Android Studio', 'Xcode', 'Flutter SDK', 'React Native', 'Firebase', 'Expo'],
  },
  'ai-engineer': {
    title: 'AI Engineer',
    description: 'Build AI-powered products and pipelines using LLMs, APIs, and AI infrastructure.',
    whatTheyDo: 'Integrate large language models into real products, build AI pipelines, fine-tune models, create RAG systems, and deploy AI-powered features.',
    responsibilities: ['Prompt engineering', 'LLM API integration', 'RAG system design', 'Model fine-tuning', 'AI application development', 'Evaluation & testing'],
    coreSkills: ['Python', 'LLMs', 'Prompt Engineering', 'Vector Databases', 'API Development'],
    tools: ['OpenAI API', 'LangChain', 'Pinecone', 'HuggingFace', 'FastAPI', 'Docker'],
  },
  'machine-learning-engineer': {
    title: 'Machine Learning Engineer',
    description: 'Design, build and deploy machine learning models that power intelligent systems.',
    whatTheyDo: 'Research algorithms, clean and prepare datasets, train and evaluate ML models, optimize for production performance, and deploy models as scalable APIs.',
    responsibilities: ['Data preprocessing', 'Feature engineering', 'Model training & evaluation', 'Hyperparameter tuning', 'Model deployment (MLOps)', 'A/B testing models'],
    coreSkills: ['Python', 'Math/Stats', 'ML Algorithms', 'Deep Learning', 'MLOps'],
    tools: ['Python', 'scikit-learn', 'TensorFlow', 'PyTorch', 'MLflow', 'Kubeflow', 'AWS SageMaker'],
  },
  'data-scientist': {
    title: 'Data Scientist',
    description: 'Extract actionable insights from data using statistics, machine learning, and visualization.',
    whatTheyDo: 'Collect and analyze large datasets, build predictive models, communicate findings through visualizations, and guide business decisions with data.',
    responsibilities: ['Data collection and cleaning', 'Statistical analysis', 'Building predictive models', 'Creating dashboards', 'Presenting insights to stakeholders', 'Hypothesis testing'],
    coreSkills: ['Python/R', 'Statistics', 'Machine Learning', 'SQL', 'Data Visualization'],
    tools: ['Python', 'Pandas', 'NumPy', 'Tableau', 'Power BI', 'Jupyter', 'SQL', 'Spark'],
  },
  'data-engineer': {
    title: 'Data Engineer',
    description: 'Build and maintain the data infrastructure that powers analytics, ML, and reporting.',
    whatTheyDo: 'Design and build data pipelines, manage data warehouses, ensure data quality, and make data reliably available for data scientists and analysts.',
    responsibilities: ['Building ETL/ELT pipelines', 'Data warehouse design', 'Data quality monitoring', 'Pipeline orchestration', 'Data lake management', 'Performance optimization'],
    coreSkills: ['Python', 'SQL', 'Data Pipelines', 'Cloud Platforms', 'Distributed Systems'],
    tools: ['Apache Spark', 'Airflow', 'dbt', 'Kafka', 'Snowflake', 'BigQuery', 'AWS Glue', 'Databricks'],
  },
  'cloud-architect': {
    title: 'Cloud Architect',
    description: 'Design and oversee cloud computing strategies, infrastructure and service deployments.',
    whatTheyDo: 'Design scalable, secure, cost-optimized cloud architectures. Select appropriate cloud services, define best practices, and guide engineering teams on cloud adoption.',
    responsibilities: ['Cloud architecture design', 'Cost optimization', 'Security & compliance', 'Migration planning', 'Multi-cloud strategy', 'Disaster recovery planning'],
    coreSkills: ['Cloud Platforms (AWS/GCP/Azure)', 'Networking', 'Security', 'IaC', 'Microservices'],
    tools: ['AWS / GCP / Azure', 'Terraform', 'Kubernetes', 'Docker', 'Ansible', 'CloudFormation'],
  },
  'devops-engineer': {
    title: 'DevOps Engineer',
    description: 'Bridge development and operations to enable fast, reliable software delivery pipelines.',
    whatTheyDo: 'Automate build, test and deployment pipelines; manage infrastructure as code; ensure high availability; and monitor production systems.',
    responsibilities: ['CI/CD pipeline management', 'Infrastructure automation', 'Container orchestration', 'Monitoring & alerting', 'Incident response', 'Security integration (DevSecOps)'],
    coreSkills: ['Linux', 'CI/CD', 'Docker/Kubernetes', 'IaC', 'Scripting', 'Cloud Platforms'],
    tools: ['Jenkins', 'GitHub Actions', 'Docker', 'Kubernetes', 'Terraform', 'Prometheus', 'Grafana', 'Ansible'],
  },
  'cybersecurity-engineer': {
    title: 'Cybersecurity Engineer',
    description: 'Protect systems, networks and data from cyber threats, attacks and unauthorized access.',
    whatTheyDo: 'Assess vulnerabilities, implement security controls, monitor for threats, conduct penetration tests, respond to incidents, and ensure compliance with security standards.',
    responsibilities: ['Vulnerability assessment', 'Penetration testing', 'Security monitoring (SOC)', 'Incident response', 'Security architecture', 'Compliance & audits'],
    coreSkills: ['Networking', 'Linux', 'Cryptography', 'Ethical Hacking', 'Security Monitoring', 'Incident Response'],
    tools: ['Kali Linux', 'Wireshark', 'Nmap', 'Burp Suite', 'Metasploit', 'Splunk', 'Nessus'],
  },
  'network-engineer': {
    title: 'Network Engineer',
    description: 'Design, implement, maintain and troubleshoot computer networks for organizations.',
    whatTheyDo: 'Configure routers and switches, design network topologies, ensure high availability, troubleshoot connectivity issues, and manage network security.',
    responsibilities: ['Network design and configuration', 'Router/switch management', 'Network troubleshooting', 'Performance monitoring', 'VPN and firewall management', 'Documentation'],
    coreSkills: ['TCP/IP', 'Routing & Switching', 'Subnetting', 'Network Security', 'Wireless Networking'],
    tools: ['Cisco IOS', 'Packet Tracer', 'Wireshark', 'SolarWinds', 'PRTG', 'GNS3', 'Juniper'],
  },
  'qa-engineer': {
    title: 'QA Engineer',
    description: 'Ensure software quality through systematic testing, automation, and quality processes.',
    whatTheyDo: 'Write test plans, design test cases, perform manual and automated testing, report bugs, work with developers to fix issues, and ensure products meet quality standards.',
    responsibilities: ['Test plan creation', 'Manual and automated testing', 'Bug reporting and tracking', 'Performance testing', 'Regression testing', 'CI/CD pipeline integration'],
    coreSkills: ['Testing methodologies', 'Test automation', 'API testing', 'Performance testing', 'Bug tracking'],
    tools: ['Selenium', 'Cypress', 'Postman', 'JMeter', 'Jira', 'TestRail', 'GitHub Actions'],
  },
  'business-analyst': {
    title: 'Business Analyst',
    description: 'Bridge the gap between IT and the business using data analytics to assess processes, determine requirements and deliver data-driven recommendations.',
    whatTheyDo: 'Analyze business needs, write requirements, communicate with stakeholders, and help design technical solutions.',
    responsibilities: ['Requirement gathering', 'Data analysis', 'Process modeling', 'Stakeholder communication'],
    coreSkills: ['SQL', 'Excel', 'Data Visualization', 'Communication'],
    tools: ['Jira', 'Tableau', 'Excel', 'Visio'],
  },
  'financial-analyst': {
    title: 'Financial Analyst',
    description: 'Guide businesses and individuals in decisions about expending money to attain profit.',
    whatTheyDo: 'Analyze financial data, spot trends, develop forecasts, and create financial models.',
    responsibilities: ['Financial modeling', 'Forecasting', 'Variance analysis', 'Reporting'],
    coreSkills: ['Financial Modeling', 'Excel', 'Accounting', 'Analytical Thinking'],
    tools: ['Excel', 'ERP Systems', 'Tableau'],
  },
  'hr-specialist': {
    title: 'HR Specialist',
    description: 'Recruit, screen, interview, and place workers. Handle employee relations, payroll, benefits, and training.',
    whatTheyDo: 'Manage the employee lifecycle, from recruitment and onboarding to benefits administration and conflict resolution.',
    responsibilities: ['Recruitment', 'Onboarding', 'Employee relations', 'Performance management'],
    coreSkills: ['Communication', 'Empathy', 'Conflict Resolution', 'HR Policies'],
    tools: ['Workday', 'Greenhouse', 'LinkedIn Recruiter'],
  },
  'digital-marketing-specialist': {
    title: 'Digital Marketing Specialist',
    description: 'Develop, implement, track and optimize digital marketing campaigns across all digital channels.',
    whatTheyDo: 'Manage SEO/SEM, email, social media, and display advertising campaigns to drive brand awareness and lead generation.',
    responsibilities: ['Campaign management', 'SEO/SEM', 'Content strategy', 'Analytics reporting'],
    coreSkills: ['SEO', 'Content Marketing', 'Data Analytics', 'Copywriting'],
    tools: ['Google Analytics', 'HubSpot', 'Mailchimp', 'Facebook Ads'],
  },
  'graphic-designer': {
    title: 'Graphic Designer',
    description: 'Create visual concepts, by hand or using computer software, to communicate ideas that inspire, inform, or captivate consumers.',
    whatTheyDo: 'Develop the overall layout and production design for advertisements, brochures, magazines, and corporate reports.',
    responsibilities: ['Visual design', 'Branding', 'Typography', 'UI/UX Basics'],
    coreSkills: ['Creativity', 'Typography', 'Color Theory', 'Layout Design'],
    tools: ['Adobe Photoshop', 'Illustrator', 'Figma', 'InDesign'],
  },
  'accountant': {
    title: 'Accountant',
    description: 'Prepare and examine financial records, ensuring they are accurate and that taxes are paid properly and on time.',
    whatTheyDo: 'Assess financial operations, prepare tax returns, and provide management with financial information and advice.',
    responsibilities: ['Bookkeeping', 'Tax preparation', 'Financial reporting', 'Auditing'],
    coreSkills: ['Accounting Principles', 'Attention to detail', 'Tax Law', 'Math'],
    tools: ['QuickBooks', 'Tally', 'Excel', 'Xero'],
  },
};

export const ROADMAP_TEMPLATES = {

  // ═══════════════════════════════════════════════════
  // SOFTWARE ENGINEER
  // ═══════════════════════════════════════════════════
  'software-engineer': {
    title: 'Software Engineer',
    stages: [
      {
        id: 'se-s1', title: 'FOUNDATIONS',
        topics: [
          { id: 'se-f1', title: 'Programming Fundamentals (Variables, Loops, Functions)', diff: 'Beginner', hours: '20 hours' },
          { id: 'se-f2', title: 'Object-Oriented Programming (OOP)', diff: 'Beginner', hours: '15 hours' },
          { id: 'se-f3', title: 'Command Line / Terminal Basics', diff: 'Beginner', hours: '5 hours' },
          { id: 'se-f4', title: 'Git & Version Control (GitHub)', diff: 'Beginner', hours: '8 hours' },
        ]
      },
      {
        id: 'se-s2', title: 'DATA STRUCTURES & ALGORITHMS',
        topics: [
          { id: 'se-d1', title: 'Arrays, Strings & Complexity Analysis', diff: 'Intermediate', hours: '15 hours' },
          { id: 'se-d2', title: 'Linked Lists, Stacks & Queues', diff: 'Intermediate', hours: '12 hours' },
          { id: 'se-d3', title: 'Trees & Graphs', diff: 'Intermediate', hours: '20 hours' },
          { id: 'se-d4', title: 'Sorting & Searching Algorithms', diff: 'Intermediate', hours: '12 hours' },
          { id: 'se-d5', title: 'Dynamic Programming', diff: 'Advanced', hours: '20 hours' },
        ]
      },
      {
        id: 'se-s3', title: 'CORE COMPUTER SCIENCE',
        topics: [
          { id: 'se-c1', title: 'Operating Systems Fundamentals', diff: 'Intermediate', hours: '15 hours' },
          { id: 'se-c2', title: 'Computer Networks Basics', diff: 'Intermediate', hours: '10 hours' },
          { id: 'se-c3', title: 'Databases (SQL & NoSQL)', diff: 'Intermediate', hours: '20 hours' },
          { id: 'se-c4', title: 'System Design Basics', diff: 'Advanced', hours: '20 hours' },
        ]
      },
      {
        id: 'se-s4', title: 'PROJECTS',
        topics: [
          { id: 'se-p1', title: 'CLI Task Manager Application', diff: 'Beginner', hours: 'Project' },
          { id: 'se-p2', title: 'RESTful API with Authentication', diff: 'Intermediate', hours: 'Project' },
          { id: 'se-p3', title: 'System Design: Design a URL Shortener', diff: 'Advanced', hours: 'Project' },
        ]
      },
      {
        id: 'se-s5', title: 'PLACEMENT PREPARATION',
        topics: [
          { id: 'se-pl1', title: 'Aptitude & Logical Reasoning', diff: 'Intermediate', hours: '20 hours' },
          { id: 'se-pl2', title: 'LeetCode Practice (Easy → Medium → Hard)', diff: 'Advanced', hours: '40 hours' },
          { id: 'se-pl3', title: 'Technical Interview Patterns (STAR method)', diff: 'Intermediate', hours: '10 hours' },
          { id: 'se-pl4', title: 'ATS Resume Building', diff: 'Beginner', hours: '5 hours' },
          { id: 'se-pl5', title: 'Mock Technical Interviews', diff: 'Advanced', hours: '10 hours' },
        ]
      },
    ]
  },

  // ═══════════════════════════════════════════════════
  // FULL STACK DEVELOPER
  // ═══════════════════════════════════════════════════
  'full-stack-developer': {
    title: 'Full Stack Developer',
    stages: [
      {
        id: 'fs-s1', title: 'WEB FOUNDATIONS',
        topics: [
          { id: 'fs-f1', title: 'How the Internet Works (HTTP, DNS, Browsers)', diff: 'Beginner', hours: '5 hours' },
          { id: 'fs-f2', title: 'HTML5 — Semantic Markup', diff: 'Beginner', hours: '10 hours' },
          { id: 'fs-f3', title: 'CSS3 — Layouts, Flexbox, Grid', diff: 'Beginner', hours: '15 hours' },
          { id: 'fs-f4', title: 'JavaScript ES6+ Fundamentals', diff: 'Beginner', hours: '25 hours' },
          { id: 'fs-f5', title: 'Git & GitHub', diff: 'Beginner', hours: '8 hours' },
        ]
      },
      {
        id: 'fs-s2', title: 'FRONTEND DEVELOPMENT',
        topics: [
          { id: 'fs-fe1', title: 'Advanced JavaScript (Async/Await, Closures, Promises)', diff: 'Intermediate', hours: '20 hours' },
          { id: 'fs-fe2', title: 'React.js — Components, Hooks, JSX', diff: 'Intermediate', hours: '30 hours' },
          { id: 'fs-fe3', title: 'State Management (Redux Toolkit / Zustand)', diff: 'Intermediate', hours: '15 hours' },
          { id: 'fs-fe4', title: 'Responsive Design & Tailwind CSS', diff: 'Beginner', hours: '10 hours' },
        ]
      },
      {
        id: 'fs-s3', title: 'BACKEND DEVELOPMENT',
        topics: [
          { id: 'fs-be1', title: 'Node.js & Express.js', diff: 'Intermediate', hours: '25 hours' },
          { id: 'fs-be2', title: 'RESTful API Design', diff: 'Intermediate', hours: '10 hours' },
          { id: 'fs-be3', title: 'Authentication (JWT, Sessions, OAuth)', diff: 'Intermediate', hours: '15 hours' },
          { id: 'fs-be4', title: 'Input Validation & Security Basics', diff: 'Intermediate', hours: '8 hours' },
        ]
      },
      {
        id: 'fs-s4', title: 'DATABASES',
        topics: [
          { id: 'fs-db1', title: 'SQL & Relational Databases (PostgreSQL)', diff: 'Intermediate', hours: '20 hours' },
          { id: 'fs-db2', title: 'NoSQL — MongoDB', diff: 'Intermediate', hours: '15 hours' },
          { id: 'fs-db3', title: 'ORMs & ODMs (Prisma, Mongoose)', diff: 'Advanced', hours: '12 hours' },
        ]
      },
      {
        id: 'fs-s5', title: 'PROJECTS',
        topics: [
          { id: 'fs-p1', title: 'Personal Portfolio Website', diff: 'Beginner', hours: 'Project' },
          { id: 'fs-p2', title: 'Full Stack Blog Platform', diff: 'Intermediate', hours: 'Project' },
          { id: 'fs-p3', title: 'Real-time Chat Application (Socket.io)', diff: 'Advanced', hours: 'Project' },
        ]
      },
      {
        id: 'fs-s6', title: 'PLACEMENT PREPARATION',
        topics: [
          { id: 'fs-pl1', title: 'Data Structures & Algorithms for Web Devs', diff: 'Advanced', hours: '30 hours' },
          { id: 'fs-pl2', title: 'System Design for Web Applications', diff: 'Advanced', hours: '15 hours' },
          { id: 'fs-pl3', title: 'ATS Resume Building', diff: 'Intermediate', hours: '5 hours' },
          { id: 'fs-pl4', title: 'Technical Mock Interviews', diff: 'Advanced', hours: '10 hours' },
        ]
      },
    ]
  },

  // ═══════════════════════════════════════════════════
  // MOBILE DEVELOPER
  // ═══════════════════════════════════════════════════
  'mobile-developer': {
    title: 'Mobile Developer',
    stages: [
      {
        id: 'mob-s1', title: 'FOUNDATIONS',
        topics: [
          { id: 'mob-f1', title: 'Programming Fundamentals (JavaScript or Dart)', diff: 'Beginner', hours: '20 hours' },
          { id: 'mob-f2', title: 'Mobile Ecosystem Overview (iOS vs Android)', diff: 'Beginner', hours: '5 hours' },
          { id: 'mob-f3', title: 'Git & GitHub', diff: 'Beginner', hours: '8 hours' },
          { id: 'mob-f4', title: 'UI/UX Principles for Mobile', diff: 'Beginner', hours: '10 hours' },
        ]
      },
      {
        id: 'mob-s2', title: 'CROSS-PLATFORM (REACT NATIVE / FLUTTER)',
        topics: [
          { id: 'mob-c1', title: 'React Native — Components, Navigation, Hooks', diff: 'Intermediate', hours: '30 hours' },
          { id: 'mob-c2', title: 'Flutter & Dart Basics', diff: 'Intermediate', hours: '25 hours' },
          { id: 'mob-c3', title: 'State Management (Redux / Provider / Riverpod)', diff: 'Intermediate', hours: '15 hours' },
          { id: 'mob-c4', title: 'Expo & App Bundling', diff: 'Intermediate', hours: '8 hours' },
        ]
      },
      {
        id: 'mob-s3', title: 'NATIVE DEVELOPMENT',
        topics: [
          { id: 'mob-n1', title: 'Android Development with Kotlin / Jetpack Compose', diff: 'Intermediate', hours: '30 hours' },
          { id: 'mob-n2', title: 'iOS Development with Swift / SwiftUI', diff: 'Intermediate', hours: '30 hours' },
          { id: 'mob-n3', title: 'Android Studio & Xcode Setup', diff: 'Beginner', hours: '5 hours' },
        ]
      },
      {
        id: 'mob-s4', title: 'ADVANCED MOBILE',
        topics: [
          { id: 'mob-a1', title: 'REST API Integration in Mobile', diff: 'Intermediate', hours: '12 hours' },
          { id: 'mob-a2', title: 'Firebase (Auth, Firestore, Push Notifications)', diff: 'Intermediate', hours: '15 hours' },
          { id: 'mob-a3', title: 'Local Storage (AsyncStorage / SQLite)', diff: 'Intermediate', hours: '8 hours' },
          { id: 'mob-a4', title: 'App Store & Play Store Publishing', diff: 'Intermediate', hours: '8 hours' },
          { id: 'mob-a5', title: 'App Performance Optimization', diff: 'Advanced', hours: '12 hours' },
        ]
      },
      {
        id: 'mob-s5', title: 'PROJECTS',
        topics: [
          { id: 'mob-p1', title: 'To-Do / Notes App (CRUD + Local Storage)', diff: 'Beginner', hours: 'Project' },
          { id: 'mob-p2', title: 'Weather App (REST API Integration)', diff: 'Intermediate', hours: 'Project' },
          { id: 'mob-p3', title: 'Chat App with Firebase (Real-time)', diff: 'Advanced', hours: 'Project' },
        ]
      },
      {
        id: 'mob-s6', title: 'PLACEMENT PREPARATION',
        topics: [
          { id: 'mob-pl1', title: 'DSA for Mobile Interviews', diff: 'Advanced', hours: '25 hours' },
          { id: 'mob-pl2', title: 'Mobile-Specific Interview Questions (lifecycle, memory)', diff: 'Advanced', hours: '12 hours' },
          { id: 'mob-pl3', title: 'ATS Resume Building', diff: 'Intermediate', hours: '5 hours' },
          { id: 'mob-pl4', title: 'Mock Interview Practice', diff: 'Advanced', hours: '10 hours' },
        ]
      },
    ]
  },

  // ═══════════════════════════════════════════════════
  // AI ENGINEER
  // ═══════════════════════════════════════════════════
  'ai-engineer': {
    title: 'AI Engineer',
    stages: [
      {
        id: 'ai-s1', title: 'FOUNDATIONS',
        topics: [
          { id: 'ai-f1', title: 'Python Programming (for AI)', diff: 'Beginner', hours: '20 hours' },
          { id: 'ai-f2', title: 'Linear Algebra & Calculus Refresher', diff: 'Beginner', hours: '15 hours' },
          { id: 'ai-f3', title: 'Probability & Statistics', diff: 'Intermediate', hours: '15 hours' },
          { id: 'ai-f4', title: 'Git & GitHub', diff: 'Beginner', hours: '5 hours' },
        ]
      },
      {
        id: 'ai-s2', title: 'MACHINE LEARNING FUNDAMENTALS',
        topics: [
          { id: 'ai-ml1', title: 'Core ML Algorithms (Regression, Classification, Clustering)', diff: 'Intermediate', hours: '25 hours' },
          { id: 'ai-ml2', title: 'scikit-learn & Data Preprocessing', diff: 'Intermediate', hours: '15 hours' },
          { id: 'ai-ml3', title: 'Model Evaluation & Validation', diff: 'Intermediate', hours: '10 hours' },
        ]
      },
      {
        id: 'ai-s3', title: 'DEEP LEARNING & LLMs',
        topics: [
          { id: 'ai-dl1', title: 'Neural Networks & Deep Learning', diff: 'Advanced', hours: '25 hours' },
          { id: 'ai-dl2', title: 'Transformers & Attention Mechanism', diff: 'Advanced', hours: '20 hours' },
          { id: 'ai-dl3', title: 'Working with LLMs (GPT, Gemini, Claude APIs)', diff: 'Intermediate', hours: '15 hours' },
          { id: 'ai-dl4', title: 'Prompt Engineering Techniques', diff: 'Intermediate', hours: '12 hours' },
        ]
      },
      {
        id: 'ai-s4', title: 'AI APPLICATION ENGINEERING',
        topics: [
          { id: 'ai-ae1', title: 'LangChain & Orchestration Frameworks', diff: 'Advanced', hours: '20 hours' },
          { id: 'ai-ae2', title: 'Vector Databases (Pinecone, Chroma)', diff: 'Advanced', hours: '15 hours' },
          { id: 'ai-ae3', title: 'RAG (Retrieval-Augmented Generation)', diff: 'Advanced', hours: '20 hours' },
          { id: 'ai-ae4', title: 'Fine-Tuning & Model Customization', diff: 'Advanced', hours: '20 hours' },
          { id: 'ai-ae5', title: 'FastAPI — Serving AI Models as APIs', diff: 'Intermediate', hours: '12 hours' },
        ]
      },
      {
        id: 'ai-s5', title: 'PROJECTS',
        topics: [
          { id: 'ai-p1', title: 'AI Chatbot with LangChain + GPT', diff: 'Intermediate', hours: 'Project' },
          { id: 'ai-p2', title: 'RAG Document Q&A System', diff: 'Advanced', hours: 'Project' },
          { id: 'ai-p3', title: 'AI-powered Image Captioning App', diff: 'Advanced', hours: 'Project' },
        ]
      },
      {
        id: 'ai-s6', title: 'PLACEMENT PREPARATION',
        topics: [
          { id: 'ai-pl1', title: 'AI/ML Interview Questions', diff: 'Advanced', hours: '20 hours' },
          { id: 'ai-pl2', title: 'Python Coding Challenges (AI-focused)', diff: 'Advanced', hours: '25 hours' },
          { id: 'ai-pl3', title: 'ATS Resume Building (Highlight AI Projects)', diff: 'Intermediate', hours: '5 hours' },
          { id: 'ai-pl4', title: 'Mock Technical Interviews', diff: 'Advanced', hours: '10 hours' },
        ]
      },
    ]
  },

  // ═══════════════════════════════════════════════════
  // MACHINE LEARNING ENGINEER
  // ═══════════════════════════════════════════════════
  'machine-learning-engineer': {
    title: 'Machine Learning Engineer',
    stages: [
      {
        id: 'ml-s1', title: 'FOUNDATIONS',
        topics: [
          { id: 'ml-f1', title: 'Python for Data Science (NumPy, Pandas)', diff: 'Beginner', hours: '20 hours' },
          { id: 'ml-f2', title: 'Linear Algebra for ML', diff: 'Intermediate', hours: '15 hours' },
          { id: 'ml-f3', title: 'Statistics & Probability for ML', diff: 'Intermediate', hours: '15 hours' },
          { id: 'ml-f4', title: 'Data Visualization (Matplotlib, Seaborn)', diff: 'Beginner', hours: '10 hours' },
        ]
      },
      {
        id: 'ml-s2', title: 'CORE MACHINE LEARNING',
        topics: [
          { id: 'ml-c1', title: 'Supervised Learning (Regression & Classification)', diff: 'Intermediate', hours: '20 hours' },
          { id: 'ml-c2', title: 'Unsupervised Learning (Clustering, PCA)', diff: 'Intermediate', hours: '15 hours' },
          { id: 'ml-c3', title: 'Model Evaluation (Cross-validation, ROC, F1)', diff: 'Intermediate', hours: '12 hours' },
          { id: 'ml-c4', title: 'Feature Engineering & Selection', diff: 'Intermediate', hours: '15 hours' },
          { id: 'ml-c5', title: 'Ensemble Methods (Random Forest, XGBoost)', diff: 'Advanced', hours: '15 hours' },
        ]
      },
      {
        id: 'ml-s3', title: 'DEEP LEARNING',
        topics: [
          { id: 'ml-dl1', title: 'Neural Networks from Scratch', diff: 'Advanced', hours: '20 hours' },
          { id: 'ml-dl2', title: 'TensorFlow / PyTorch', diff: 'Advanced', hours: '25 hours' },
          { id: 'ml-dl3', title: 'CNNs for Computer Vision', diff: 'Advanced', hours: '20 hours' },
          { id: 'ml-dl4', title: 'RNNs & LSTMs for Sequences', diff: 'Advanced', hours: '15 hours' },
          { id: 'ml-dl5', title: 'Transfer Learning', diff: 'Advanced', hours: '12 hours' },
        ]
      },
      {
        id: 'ml-s4', title: 'MLOPS & DEPLOYMENT',
        topics: [
          { id: 'ml-ops1', title: 'ML Pipelines & Experiment Tracking (MLflow)', diff: 'Advanced', hours: '15 hours' },
          { id: 'ml-ops2', title: 'Model Serving (FastAPI, BentoML)', diff: 'Advanced', hours: '12 hours' },
          { id: 'ml-ops3', title: 'Docker for ML', diff: 'Intermediate', hours: '10 hours' },
          { id: 'ml-ops4', title: 'Cloud ML Services (SageMaker / Vertex AI)', diff: 'Advanced', hours: '15 hours' },
        ]
      },
      {
        id: 'ml-s5', title: 'PROJECTS',
        topics: [
          { id: 'ml-p1', title: 'House Price Prediction (Regression)', diff: 'Beginner', hours: 'Project' },
          { id: 'ml-p2', title: 'Image Classification with CNN', diff: 'Advanced', hours: 'Project' },
          { id: 'ml-p3', title: 'NLP Sentiment Analysis Pipeline', diff: 'Advanced', hours: 'Project' },
        ]
      },
      {
        id: 'ml-s6', title: 'PLACEMENT PREPARATION',
        topics: [
          { id: 'ml-pl1', title: 'ML Algorithm Theory Interview Questions', diff: 'Advanced', hours: '20 hours' },
          { id: 'ml-pl2', title: 'Statistics & Math for ML Interviews', diff: 'Advanced', hours: '15 hours' },
          { id: 'ml-pl3', title: 'Kaggle Competitions Practice', diff: 'Advanced', hours: '20 hours' },
          { id: 'ml-pl4', title: 'ATS Resume Building', diff: 'Intermediate', hours: '5 hours' },
          { id: 'ml-pl5', title: 'Mock ML Interviews', diff: 'Advanced', hours: '10 hours' },
        ]
      },
    ]
  },

  // ═══════════════════════════════════════════════════
  // DATA SCIENTIST
  // ═══════════════════════════════════════════════════
  'data-scientist': {
    title: 'Data Scientist',
    stages: [
      {
        id: 'ds-s1', title: 'FOUNDATIONS',
        topics: [
          { id: 'ds-f1', title: 'Python for Data Science (Pandas, NumPy)', diff: 'Beginner', hours: '20 hours' },
          { id: 'ds-f2', title: 'Statistics — Descriptive & Inferential', diff: 'Intermediate', hours: '20 hours' },
          { id: 'ds-f3', title: 'SQL for Data Analysis', diff: 'Intermediate', hours: '15 hours' },
          { id: 'ds-f4', title: 'Data Visualization (Matplotlib, Seaborn, Plotly)', diff: 'Beginner', hours: '12 hours' },
        ]
      },
      {
        id: 'ds-s2', title: 'EXPLORATORY DATA ANALYSIS',
        topics: [
          { id: 'ds-e1', title: 'Data Cleaning & Missing Value Handling', diff: 'Intermediate', hours: '10 hours' },
          { id: 'ds-e2', title: 'EDA Techniques & Visualization Storytelling', diff: 'Intermediate', hours: '15 hours' },
          { id: 'ds-e3', title: 'Feature Engineering', diff: 'Intermediate', hours: '12 hours' },
          { id: 'ds-e4', title: 'Hypothesis Testing (t-test, chi-square, ANOVA)', diff: 'Advanced', hours: '15 hours' },
        ]
      },
      {
        id: 'ds-s3', title: 'MACHINE LEARNING',
        topics: [
          { id: 'ds-m1', title: 'scikit-learn ML Algorithms', diff: 'Intermediate', hours: '25 hours' },
          { id: 'ds-m2', title: 'Model Selection & Cross-validation', diff: 'Intermediate', hours: '12 hours' },
          { id: 'ds-m3', title: 'NLP Basics (Text Classification)', diff: 'Advanced', hours: '15 hours' },
          { id: 'ds-m4', title: 'Time Series Analysis', diff: 'Advanced', hours: '15 hours' },
        ]
      },
      {
        id: 'ds-s4', title: 'BI & DASHBOARDS',
        topics: [
          { id: 'ds-b1', title: 'Tableau — Data Visualization & Dashboards', diff: 'Intermediate', hours: '15 hours' },
          { id: 'ds-b2', title: 'Power BI Fundamentals', diff: 'Intermediate', hours: '12 hours' },
          { id: 'ds-b3', title: 'Data Storytelling for Stakeholders', diff: 'Intermediate', hours: '10 hours' },
        ]
      },
      {
        id: 'ds-s5', title: 'PROJECTS',
        topics: [
          { id: 'ds-p1', title: 'Customer Churn Prediction Dashboard', diff: 'Intermediate', hours: 'Project' },
          { id: 'ds-p2', title: 'Sales Forecasting with Time Series', diff: 'Advanced', hours: 'Project' },
          { id: 'ds-p3', title: 'EDA Report — Kaggle Public Dataset', diff: 'Intermediate', hours: 'Project' },
        ]
      },
      {
        id: 'ds-s6', title: 'PLACEMENT PREPARATION',
        topics: [
          { id: 'ds-pl1', title: 'Statistics Interview Questions', diff: 'Advanced', hours: '15 hours' },
          { id: 'ds-pl2', title: 'SQL Interview Problems (Window Functions, CTEs)', diff: 'Advanced', hours: '15 hours' },
          { id: 'ds-pl3', title: 'Case Studies & Business Problems', diff: 'Advanced', hours: '15 hours' },
          { id: 'ds-pl4', title: 'ATS Resume Building', diff: 'Intermediate', hours: '5 hours' },
        ]
      },
    ]
  },

  // ═══════════════════════════════════════════════════
  // DATA ENGINEER
  // ═══════════════════════════════════════════════════
  'data-engineer': {
    title: 'Data Engineer',
    stages: [
      {
        id: 'de-s1', title: 'FOUNDATIONS',
        topics: [
          { id: 'de-f1', title: 'Python for Data Engineering', diff: 'Beginner', hours: '20 hours' },
          { id: 'de-f2', title: 'SQL — Advanced Queries & Optimization', diff: 'Intermediate', hours: '20 hours' },
          { id: 'de-f3', title: 'Linux & Bash Scripting', diff: 'Intermediate', hours: '12 hours' },
          { id: 'de-f4', title: 'Git & GitHub', diff: 'Beginner', hours: '5 hours' },
        ]
      },
      {
        id: 'de-s2', title: 'DATA STORAGE & DATABASES',
        topics: [
          { id: 'de-db1', title: 'Relational Databases (PostgreSQL) Deep Dive', diff: 'Intermediate', hours: '20 hours' },
          { id: 'de-db2', title: 'NoSQL Databases (MongoDB, Cassandra)', diff: 'Intermediate', hours: '15 hours' },
          { id: 'de-db3', title: 'Data Warehousing (Snowflake, BigQuery, Redshift)', diff: 'Advanced', hours: '20 hours' },
          { id: 'de-db4', title: 'Data Lake Architecture', diff: 'Advanced', hours: '12 hours' },
        ]
      },
      {
        id: 'de-s3', title: 'DATA PIPELINES & ETL',
        topics: [
          { id: 'de-p1', title: 'ETL vs ELT Concepts', diff: 'Beginner', hours: '8 hours' },
          { id: 'de-p2', title: 'Apache Airflow — Pipeline Orchestration', diff: 'Advanced', hours: '20 hours' },
          { id: 'de-p3', title: 'dbt (Data Build Tool)', diff: 'Advanced', hours: '15 hours' },
          { id: 'de-p4', title: 'Apache Kafka — Streaming Data', diff: 'Advanced', hours: '20 hours' },
          { id: 'de-p5', title: 'Apache Spark — Big Data Processing', diff: 'Advanced', hours: '25 hours' },
        ]
      },
      {
        id: 'de-s4', title: 'CLOUD DATA PLATFORMS',
        topics: [
          { id: 'de-c1', title: 'AWS Data Services (S3, Glue, Athena, EMR)', diff: 'Advanced', hours: '20 hours' },
          { id: 'de-c2', title: 'GCP Data Stack (BigQuery, Dataflow)', diff: 'Advanced', hours: '15 hours' },
          { id: 'de-c3', title: 'Docker for Data Engineering', diff: 'Intermediate', hours: '10 hours' },
        ]
      },
      {
        id: 'de-s5', title: 'PROJECTS',
        topics: [
          { id: 'de-pr1', title: 'Build an ETL Pipeline (CSV → PostgreSQL)', diff: 'Intermediate', hours: 'Project' },
          { id: 'de-pr2', title: 'Streaming Pipeline with Kafka + Spark', diff: 'Advanced', hours: 'Project' },
          { id: 'de-pr3', title: 'Data Warehouse with dbt + BigQuery', diff: 'Advanced', hours: 'Project' },
        ]
      },
      {
        id: 'de-s6', title: 'PLACEMENT PREPARATION',
        topics: [
          { id: 'de-pl1', title: 'SQL Interview Questions (Advanced)', diff: 'Advanced', hours: '20 hours' },
          { id: 'de-pl2', title: 'Data Engineering System Design', diff: 'Advanced', hours: '15 hours' },
          { id: 'de-pl3', title: 'Airflow / Spark Interview Questions', diff: 'Advanced', hours: '12 hours' },
          { id: 'de-pl4', title: 'ATS Resume Building', diff: 'Intermediate', hours: '5 hours' },
        ]
      },
    ]
  },

  // ═══════════════════════════════════════════════════
  // CLOUD ARCHITECT
  // ═══════════════════════════════════════════════════
  'cloud-architect': {
    title: 'Cloud Architect',
    stages: [
      {
        id: 'ca-s1', title: 'FOUNDATIONS',
        topics: [
          { id: 'ca-f1', title: 'Linux & Networking Fundamentals', diff: 'Beginner', hours: '15 hours' },
          { id: 'ca-f2', title: 'Virtualization & Containerization Concepts', diff: 'Beginner', hours: '10 hours' },
          { id: 'ca-f3', title: 'Cloud Computing Concepts (IaaS, PaaS, SaaS)', diff: 'Beginner', hours: '8 hours' },
          { id: 'ca-f4', title: 'Git & GitHub', diff: 'Beginner', hours: '5 hours' },
        ]
      },
      {
        id: 'ca-s2', title: 'CORE CLOUD PLATFORMS',
        topics: [
          { id: 'ca-aws1', title: 'AWS Core Services (EC2, S3, VPC, IAM, RDS)', diff: 'Intermediate', hours: '30 hours' },
          { id: 'ca-aws2', title: 'Azure Fundamentals (Virtual Machines, Azure AD, Storage)', diff: 'Intermediate', hours: '20 hours' },
          { id: 'ca-aws3', title: 'Google Cloud Platform (GCE, GCS, GKE, BigQuery)', diff: 'Intermediate', hours: '20 hours' },
        ]
      },
      {
        id: 'ca-s3', title: 'ARCHITECTURE & DESIGN',
        topics: [
          { id: 'ca-a1', title: 'Cloud Architecture Patterns (microservices, serverless, event-driven)', diff: 'Advanced', hours: '20 hours' },
          { id: 'ca-a2', title: 'High Availability & Disaster Recovery', diff: 'Advanced', hours: '15 hours' },
          { id: 'ca-a3', title: 'Cost Optimization Strategies', diff: 'Advanced', hours: '10 hours' },
          { id: 'ca-a4', title: 'Multi-Cloud & Hybrid Cloud', diff: 'Advanced', hours: '12 hours' },
        ]
      },
      {
        id: 'ca-s4', title: 'INFRASTRUCTURE AS CODE & DEVOPS',
        topics: [
          { id: 'ca-i1', title: 'Terraform (IaC)', diff: 'Advanced', hours: '20 hours' },
          { id: 'ca-i2', title: 'Docker & Kubernetes', diff: 'Advanced', hours: '25 hours' },
          { id: 'ca-i3', title: 'CI/CD on Cloud (GitHub Actions, AWS CodePipeline)', diff: 'Advanced', hours: '15 hours' },
          { id: 'ca-i4', title: 'Cloud Security & IAM Best Practices', diff: 'Advanced', hours: '15 hours' },
        ]
      },
      {
        id: 'ca-s5', title: 'PROJECTS',
        topics: [
          { id: 'ca-p1', title: 'Deploy a 3-Tier App on AWS with Terraform', diff: 'Advanced', hours: 'Project' },
          { id: 'ca-p2', title: 'Multi-Region High Availability Architecture Design', diff: 'Advanced', hours: 'Project' },
          { id: 'ca-p3', title: 'Serverless API on AWS Lambda + API Gateway', diff: 'Advanced', hours: 'Project' },
        ]
      },
      {
        id: 'ca-s6', title: 'PLACEMENT PREPARATION',
        topics: [
          { id: 'ca-pl1', title: 'AWS Solutions Architect Certification Prep', diff: 'Advanced', hours: '30 hours' },
          { id: 'ca-pl2', title: 'Cloud Architecture Case Studies', diff: 'Advanced', hours: '15 hours' },
          { id: 'ca-pl3', title: 'ATS Resume Building', diff: 'Intermediate', hours: '5 hours' },
          { id: 'ca-pl4', title: 'Mock Cloud Architecture Interviews', diff: 'Advanced', hours: '10 hours' },
        ]
      },
    ]
  },

  // ═══════════════════════════════════════════════════
  // DEVOPS ENGINEER
  // ═══════════════════════════════════════════════════
  'devops-engineer': {
    title: 'DevOps Engineer',
    stages: [
      {
        id: 'dv-s1', title: 'FOUNDATIONS',
        topics: [
          { id: 'dv-f1', title: 'Linux Administration & Bash Scripting', diff: 'Beginner', hours: '20 hours' },
          { id: 'dv-f2', title: 'Networking Fundamentals (TCP/IP, DNS, HTTP)', diff: 'Beginner', hours: '12 hours' },
          { id: 'dv-f3', title: 'Git & GitHub Advanced (branching, PRs, hooks)', diff: 'Intermediate', hours: '10 hours' },
          { id: 'dv-f4', title: 'Programming Basics (Python or Go)', diff: 'Beginner', hours: '15 hours' },
        ]
      },
      {
        id: 'dv-s2', title: 'CONTAINERS & ORCHESTRATION',
        topics: [
          { id: 'dv-c1', title: 'Docker — Images, Containers, Networking', diff: 'Intermediate', hours: '20 hours' },
          { id: 'dv-c2', title: 'Docker Compose', diff: 'Intermediate', hours: '10 hours' },
          { id: 'dv-c3', title: 'Kubernetes — Pods, Services, Deployments', diff: 'Advanced', hours: '30 hours' },
          { id: 'dv-c4', title: 'Helm Charts', diff: 'Advanced', hours: '10 hours' },
        ]
      },
      {
        id: 'dv-s3', title: 'CI/CD PIPELINES',
        topics: [
          { id: 'dv-ci1', title: 'GitHub Actions — Workflows & Automation', diff: 'Intermediate', hours: '15 hours' },
          { id: 'dv-ci2', title: 'Jenkins — Pipelines, Jenkinsfile', diff: 'Intermediate', hours: '12 hours' },
          { id: 'dv-ci3', title: 'GitLab CI/CD', diff: 'Intermediate', hours: '10 hours' },
          { id: 'dv-ci4', title: 'Continuous Testing & Quality Gates', diff: 'Advanced', hours: '10 hours' },
        ]
      },
      {
        id: 'dv-s4', title: 'INFRASTRUCTURE & MONITORING',
        topics: [
          { id: 'dv-i1', title: 'Terraform (IaC)', diff: 'Advanced', hours: '20 hours' },
          { id: 'dv-i2', title: 'Ansible — Configuration Management', diff: 'Advanced', hours: '15 hours' },
          { id: 'dv-i3', title: 'Cloud Platforms (AWS/GCP/Azure)', diff: 'Advanced', hours: '20 hours' },
          { id: 'dv-i4', title: 'Prometheus & Grafana — Monitoring & Alerting', diff: 'Advanced', hours: '15 hours' },
          { id: 'dv-i5', title: 'ELK Stack — Centralized Logging', diff: 'Advanced', hours: '12 hours' },
        ]
      },
      {
        id: 'dv-s5', title: 'PROJECTS',
        topics: [
          { id: 'dv-p1', title: 'Full CI/CD Pipeline: GitHub → Docker → Kubernetes', diff: 'Advanced', hours: 'Project' },
          { id: 'dv-p2', title: 'Infrastructure Provisioning with Terraform on AWS', diff: 'Advanced', hours: 'Project' },
          { id: 'dv-p3', title: 'Monitoring Dashboard with Prometheus + Grafana', diff: 'Advanced', hours: 'Project' },
        ]
      },
      {
        id: 'dv-s6', title: 'PLACEMENT PREPARATION',
        topics: [
          { id: 'dv-pl1', title: 'Linux & Bash Interview Questions', diff: 'Advanced', hours: '15 hours' },
          { id: 'dv-pl2', title: 'Docker/Kubernetes Interview Questions', diff: 'Advanced', hours: '15 hours' },
          { id: 'dv-pl3', title: 'DevOps Architecture Case Studies', diff: 'Advanced', hours: '12 hours' },
          { id: 'dv-pl4', title: 'ATS Resume Building', diff: 'Intermediate', hours: '5 hours' },
          { id: 'dv-pl5', title: 'Mock DevOps Interviews', diff: 'Advanced', hours: '10 hours' },
        ]
      },
    ]
  },

  // ═══════════════════════════════════════════════════
  // CYBERSECURITY ENGINEER
  // ═══════════════════════════════════════════════════
  'cybersecurity-engineer': {
    title: 'Cybersecurity Engineer',
    stages: [
      {
        id: 'cs-s1', title: 'FOUNDATIONS',
        topics: [
          { id: 'cs-f1', title: 'Computer Fundamentals & Hardware', diff: 'Beginner', hours: '10 hours' },
          { id: 'cs-f2', title: 'Operating Systems (Windows & Linux)', diff: 'Beginner', hours: '15 hours' },
          { id: 'cs-f3', title: 'Linux Administration & Bash', diff: 'Intermediate', hours: '20 hours' },
          { id: 'cs-f4', title: 'Networking Concepts (TCP/IP, DNS, HTTP/S)', diff: 'Beginner', hours: '25 hours' },
          { id: 'cs-f5', title: 'Git & GitHub', diff: 'Beginner', hours: '5 hours' },
        ]
      },
      {
        id: 'cs-s2', title: 'SECURITY FUNDAMENTALS',
        topics: [
          { id: 'cs-sf1', title: 'CIA Triad & Security Principles', diff: 'Beginner', hours: '5 hours' },
          { id: 'cs-sf2', title: 'Authentication, Authorization & Identity', diff: 'Intermediate', hours: '10 hours' },
          { id: 'cs-sf3', title: 'Cryptography (Encryption, Hashing, PKI)', diff: 'Intermediate', hours: '15 hours' },
          { id: 'cs-sf4', title: 'Common Vulnerabilities & Attack Types', diff: 'Intermediate', hours: '12 hours' },
          { id: 'cs-sf5', title: 'Security Standards (ISO 27001, NIST)', diff: 'Intermediate', hours: '8 hours' },
        ]
      },
      {
        id: 'cs-s3', title: 'DEFENSIVE SECURITY',
        topics: [
          { id: 'cs-ds1', title: 'SOC Operations & Workflow', diff: 'Intermediate', hours: '10 hours' },
          { id: 'cs-ds2', title: 'SIEM Tools (Splunk, Microsoft Sentinel)', diff: 'Advanced', hours: '20 hours' },
          { id: 'cs-ds3', title: 'Log Analysis & Threat Detection', diff: 'Advanced', hours: '15 hours' },
          { id: 'cs-ds4', title: 'Incident Response Procedures', diff: 'Advanced', hours: '15 hours' },
          { id: 'cs-ds5', title: 'Threat Intelligence & Hunting', diff: 'Advanced', hours: '12 hours' },
        ]
      },
      {
        id: 'cs-s4', title: 'OFFENSIVE SECURITY',
        topics: [
          { id: 'cs-os1', title: 'Reconnaissance (OSINT, Nmap, Recon-ng)', diff: 'Intermediate', hours: '10 hours' },
          { id: 'cs-os2', title: 'Vulnerability Assessment (Nessus, OpenVAS)', diff: 'Advanced', hours: '15 hours' },
          { id: 'cs-os3', title: 'Web Security & OWASP Top 10', diff: 'Intermediate', hours: '20 hours' },
          { id: 'cs-os4', title: 'Penetration Testing Basics (Metasploit)', diff: 'Advanced', hours: '30 hours' },
          { id: 'cs-os5', title: 'Burp Suite for Web Application Testing', diff: 'Advanced', hours: '15 hours' },
        ]
      },
      {
        id: 'cs-s5', title: 'PROJECTS',
        topics: [
          { id: 'cs-p1', title: 'Build a Home SOC Lab (VMs + Splunk)', diff: 'Advanced', hours: 'Project' },
          { id: 'cs-p2', title: 'Web App Vulnerability Assessment (DVWA)', diff: 'Advanced', hours: 'Project' },
          { id: 'cs-p3', title: 'Network Packet Analysis with Wireshark', diff: 'Intermediate', hours: 'Project' },
        ]
      },
      {
        id: 'cs-s6', title: 'PLACEMENT PREPARATION',
        topics: [
          { id: 'cs-pl1', title: 'Aptitude & Logical Reasoning', diff: 'Beginner', hours: '20 hours' },
          { id: 'cs-pl2', title: 'Security Interview Questions (Networking, Linux, Crypto)', diff: 'Advanced', hours: '15 hours' },
          { id: 'cs-pl3', title: 'Security Scenario-Based Problems', diff: 'Advanced', hours: '12 hours' },
          { id: 'cs-pl4', title: 'ATS Resume Building', diff: 'Intermediate', hours: '5 hours' },
          { id: 'cs-pl5', title: 'Mock Interview Practice', diff: 'Advanced', hours: '10 hours' },
        ]
      },
    ]
  },

  // ═══════════════════════════════════════════════════
  // NETWORK ENGINEER
  // ═══════════════════════════════════════════════════
  'network-engineer': {
    title: 'Network Engineer',
    stages: [
      {
        id: 'ne-s1', title: 'FOUNDATIONS',
        topics: [
          { id: 'ne-f1', title: 'Computer Hardware & Electronics Basics', diff: 'Beginner', hours: '10 hours' },
          { id: 'ne-f2', title: 'Operating Systems (Linux & Windows Server)', diff: 'Beginner', hours: '15 hours' },
          { id: 'ne-f3', title: 'Binary, Hexadecimal & Number Systems', diff: 'Beginner', hours: '5 hours' },
          { id: 'ne-f4', title: 'Git & Basic Scripting (Python/Bash)', diff: 'Beginner', hours: '8 hours' },
        ]
      },
      {
        id: 'ne-s2', title: 'NETWORKING FUNDAMENTALS',
        topics: [
          { id: 'ne-n1', title: 'OSI & TCP/IP Model (all 7 layers)', diff: 'Beginner', hours: '10 hours' },
          { id: 'ne-n2', title: 'IP Addressing, Subnetting & CIDR', diff: 'Intermediate', hours: '20 hours' },
          { id: 'ne-n3', title: 'Ethernet, VLANs & LAN Technologies', diff: 'Intermediate', hours: '12 hours' },
          { id: 'ne-n4', title: 'DNS, DHCP, NAT & HTTP/S Protocols', diff: 'Intermediate', hours: '12 hours' },
          { id: 'ne-n5', title: 'Wireless Networking (Wi-Fi, WPA)', diff: 'Intermediate', hours: '10 hours' },
        ]
      },
      {
        id: 'ne-s3', title: 'ROUTING & SWITCHING',
        topics: [
          { id: 'ne-r1', title: 'Static vs Dynamic Routing', diff: 'Intermediate', hours: '10 hours' },
          { id: 'ne-r2', title: 'OSPF — Open Shortest Path First', diff: 'Advanced', hours: '15 hours' },
          { id: 'ne-r3', title: 'BGP — Border Gateway Protocol', diff: 'Advanced', hours: '20 hours' },
          { id: 'ne-r4', title: 'VLAN Trunking & STP (Spanning Tree)', diff: 'Advanced', hours: '12 hours' },
          { id: 'ne-r5', title: 'WAN Technologies (MPLS, SD-WAN)', diff: 'Advanced', hours: '15 hours' },
        ]
      },
      {
        id: 'ne-s4', title: 'NETWORK SECURITY & MANAGEMENT',
        topics: [
          { id: 'ne-s1', title: 'Firewalls, ACLs & Security Policies', diff: 'Intermediate', hours: '15 hours' },
          { id: 'ne-s2', title: 'VPNs (IPSec, SSL/TLS, Site-to-Site)', diff: 'Intermediate', hours: '12 hours' },
          { id: 'ne-s3', title: 'IDS / IPS Systems', diff: 'Advanced', hours: '15 hours' },
          { id: 'ne-s4b', title: 'Network Monitoring (SNMP, Nagios, PRTG)', diff: 'Advanced', hours: '12 hours' },
          { id: 'ne-s5', title: 'Wireshark & Packet Analysis', diff: 'Advanced', hours: '15 hours' },
        ]
      },
      {
        id: 'ne-s5', title: 'PROJECTS',
        topics: [
          { id: 'ne-p1', title: 'Design & Configure a Corporate LAN (Cisco Packet Tracer)', diff: 'Intermediate', hours: 'Project' },
          { id: 'ne-p2', title: 'Configure BGP Peering between Two Routers', diff: 'Advanced', hours: 'Project' },
          { id: 'ne-p3', title: 'Build a Site-to-Site VPN Tunnel', diff: 'Advanced', hours: 'Project' },
        ]
      },
      {
        id: 'ne-s6', title: 'PLACEMENT PREPARATION',
        topics: [
          { id: 'ne-pl1', title: 'Aptitude & Logical Reasoning', diff: 'Beginner', hours: '20 hours' },
          { id: 'ne-pl2', title: 'Networking Interview Questions (CCNA Level)', diff: 'Advanced', hours: '15 hours' },
          { id: 'ne-pl3', title: 'Subnetting Speed Practice', diff: 'Intermediate', hours: '8 hours' },
          { id: 'ne-pl4', title: 'ATS Resume Building', diff: 'Intermediate', hours: '5 hours' },
          { id: 'ne-pl5', title: 'Mock Interview Practice', diff: 'Advanced', hours: '10 hours' },
        ]
      },
    ]
  },

  // ═══════════════════════════════════════════════════
  // QA ENGINEER
  // ═══════════════════════════════════════════════════
  'qa-engineer': {
    title: 'QA Engineer',
    stages: [
      {
        id: 'qa-s1', title: 'FOUNDATIONS',
        topics: [
          { id: 'qa-f1', title: 'SDLC & STLC Overview', diff: 'Beginner', hours: '10 hours' },
          { id: 'qa-f2', title: 'Types of Testing (Functional, Non-functional, Regression)', diff: 'Beginner', hours: '8 hours' },
          { id: 'qa-f3', title: 'QA Mindset & Bug Lifecycle', diff: 'Beginner', hours: '5 hours' },
          { id: 'qa-f4', title: 'Git & GitHub', diff: 'Beginner', hours: '5 hours' },
        ]
      },
      {
        id: 'qa-s2', title: 'MANUAL TESTING',
        topics: [
          { id: 'qa-m1', title: 'Writing Test Cases & Test Plans', diff: 'Beginner', hours: '15 hours' },
          { id: 'qa-m2', title: 'Black-box, White-box & Grey-box Testing', diff: 'Intermediate', hours: '12 hours' },
          { id: 'qa-m3', title: 'Equivalence Partitioning & Boundary Value Analysis', diff: 'Intermediate', hours: '10 hours' },
          { id: 'qa-m4', title: 'Bug Tracking Tools (Jira, Bugzilla, TestRail)', diff: 'Beginner', hours: '8 hours' },
          { id: 'qa-m5', title: 'Exploratory Testing & Usability Testing', diff: 'Intermediate', hours: '8 hours' },
        ]
      },
      {
        id: 'qa-s3', title: 'API TESTING',
        topics: [
          { id: 'qa-api1', title: 'REST API Fundamentals (HTTP Methods, Status Codes)', diff: 'Intermediate', hours: '10 hours' },
          { id: 'qa-api2', title: 'Postman — API Testing & Collections', diff: 'Intermediate', hours: '12 hours' },
          { id: 'qa-api3', title: 'JSON Schema Validation', diff: 'Intermediate', hours: '8 hours' },
        ]
      },
      {
        id: 'qa-s4', title: 'AUTOMATION TESTING',
        topics: [
          { id: 'qa-a1', title: 'Python / Java for Test Automation', diff: 'Intermediate', hours: '20 hours' },
          { id: 'qa-a2', title: 'Selenium WebDriver', diff: 'Intermediate', hours: '25 hours' },
          { id: 'qa-a3', title: 'Cypress — Modern UI Automation', diff: 'Intermediate', hours: '15 hours' },
          { id: 'qa-a4', title: 'Test Frameworks (TestNG, PyTest)', diff: 'Intermediate', hours: '15 hours' },
          { id: 'qa-a5', title: 'CI/CD Integration for QA (GitHub Actions)', diff: 'Advanced', hours: '12 hours' },
        ]
      },
      {
        id: 'qa-s5', title: 'PERFORMANCE & ADVANCED TESTING',
        topics: [
          { id: 'qa-adv1', title: 'Performance Testing with JMeter', diff: 'Advanced', hours: '15 hours' },
          { id: 'qa-adv2', title: 'Mobile Testing (Appium)', diff: 'Advanced', hours: '12 hours' },
          { id: 'qa-adv3', title: 'Security Testing Basics', diff: 'Advanced', hours: '10 hours' },
        ]
      },
      {
        id: 'qa-s6', title: 'PROJECTS',
        topics: [
          { id: 'qa-p1', title: 'Full Test Plan for a Sample Web Application', diff: 'Intermediate', hours: 'Project' },
          { id: 'qa-p2', title: 'Selenium E2E Test Suite for a Live Site', diff: 'Advanced', hours: 'Project' },
          { id: 'qa-p3', title: 'API Test Suite with Postman + Newman in CI', diff: 'Advanced', hours: 'Project' },
        ]
      },
      {
        id: 'qa-s7', title: 'PLACEMENT PREPARATION',
        topics: [
          { id: 'qa-pl1', title: 'Aptitude & Logical Reasoning', diff: 'Beginner', hours: '20 hours' },
          { id: 'qa-pl2', title: 'QA Interview Questions (Bug lifecycle, Test types, Automation)', diff: 'Advanced', hours: '15 hours' },
          { id: 'qa-pl3', title: 'ATS Resume Building', diff: 'Intermediate', hours: '5 hours' },
          { id: 'qa-pl4', title: 'Mock Interview Practice', diff: 'Advanced', hours: '10 hours' },
        ]
      },
    ]
  },

  'business-analyst': {
    title: 'Business Analyst',
    stages: [
      { id: 'ba-s1', title: 'FOUNDATIONS', topics: [{ id: 'ba-f1', title: 'Business Fundamentals', diff: 'Beginner', hours: '10 hours' }, { id: 'ba-f2', title: 'Excel for Analytics', diff: 'Intermediate', hours: '15 hours' }] },
      { id: 'ba-s2', title: 'DATA & SQL', topics: [{ id: 'ba-d1', title: 'SQL Basics', diff: 'Beginner', hours: '15 hours' }, { id: 'ba-d2', title: 'Data Visualization', diff: 'Intermediate', hours: '10 hours' }] },
      { id: 'ba-s3', title: 'PLACEMENT PREPARATION', topics: [{ id: 'ba-pl1', title: 'BA Interview Prep', diff: 'Advanced', hours: '10 hours' }] }
    ]
  },
  'financial-analyst': {
    title: 'Financial Analyst',
    stages: [
      { id: 'fa-s1', title: 'FOUNDATIONS', topics: [{ id: 'fa-f1', title: 'Accounting Basics', diff: 'Beginner', hours: '15 hours' }] },
      { id: 'fa-s2', title: 'FINANCIAL MODELING', topics: [{ id: 'fa-m1', title: 'Excel Modeling', diff: 'Intermediate', hours: '20 hours' }] },
      { id: 'fa-s3', title: 'PLACEMENT PREPARATION', topics: [{ id: 'fa-pl1', title: 'Finance Interview Prep', diff: 'Advanced', hours: '10 hours' }] }
    ]
  },
  'hr-specialist': {
    title: 'HR Specialist',
    stages: [
      { id: 'hr-s1', title: 'FOUNDATIONS', topics: [{ id: 'hr-f1', title: 'HR Principles', diff: 'Beginner', hours: '10 hours' }] },
      { id: 'hr-s2', title: 'RECRUITMENT', topics: [{ id: 'hr-r1', title: 'Talent Acquisition', diff: 'Intermediate', hours: '15 hours' }] },
      { id: 'hr-s3', title: 'PLACEMENT PREPARATION', topics: [{ id: 'hr-pl1', title: 'HR Interview Prep', diff: 'Advanced', hours: '10 hours' }] }
    ]
  },
  'digital-marketing-specialist': {
    title: 'Digital Marketing Specialist',
    stages: [
      { id: 'dm-s1', title: 'FOUNDATIONS', topics: [{ id: 'dm-f1', title: 'Marketing Basics', diff: 'Beginner', hours: '10 hours' }] },
      { id: 'dm-s2', title: 'SEO & SEM', topics: [{ id: 'dm-s1', title: 'SEO Optimization', diff: 'Intermediate', hours: '20 hours' }] },
      { id: 'dm-s3', title: 'PLACEMENT PREPARATION', topics: [{ id: 'dm-pl1', title: 'Marketing Interview Prep', diff: 'Advanced', hours: '10 hours' }] }
    ]
  },
  'graphic-designer': {
    title: 'Graphic Designer',
    stages: [
      { id: 'gd-s1', title: 'FOUNDATIONS', topics: [{ id: 'gd-f1', title: 'Design Theory', diff: 'Beginner', hours: '15 hours' }] },
      { id: 'gd-s2', title: 'TOOLS', topics: [{ id: 'gd-t1', title: 'Adobe Creative Suite / Figma', diff: 'Intermediate', hours: '25 hours' }] },
      { id: 'gd-s3', title: 'PLACEMENT PREPARATION', topics: [{ id: 'gd-pl1', title: 'Portfolio Building', diff: 'Advanced', hours: '15 hours' }] }
    ]
  },
  'accountant': {
    title: 'Accountant',
    stages: [
      { id: 'ac-s1', title: 'FOUNDATIONS', topics: [{ id: 'ac-f1', title: 'Accounting Principles', diff: 'Beginner', hours: '20 hours' }] },
      { id: 'ac-s2', title: 'TOOLS & TAX', topics: [{ id: 'ac-t1', title: 'Tally / QuickBooks', diff: 'Intermediate', hours: '15 hours' }] },
      { id: 'ac-s3', title: 'PLACEMENT PREPARATION', topics: [{ id: 'ac-pl1', title: 'Accounting Interview Prep', diff: 'Advanced', hours: '10 hours' }] }
    ]
  },
};

// Alias: machine-learning maps to machine-learning-engineer
ROADMAP_TEMPLATES['machine-learning'] = ROADMAP_TEMPLATES['machine-learning-engineer'];
ROADMAP_TEMPLATES['default'] = ROADMAP_TEMPLATES['software-engineer'];

/**
 * Get a roadmap template by career ID.
 * Returns null (not a fallback) if the career is unknown, 
 * so the caller can decide what to do (show error, trigger AI generation, etc.)
 */
export const getRoadmapTemplate = (roleKey) => {
  if (!roleKey) return null;
  const normalizedKey = roleKey.toLowerCase().replace(/\s+/g, '-');
  return ROADMAP_TEMPLATES[normalizedKey] || null;
};

/**
 * Get career metadata for display (description, responsibilities, tools, etc.)
 */
export const getCareerMetadata = (roleKey) => {
  if (!roleKey) return null;
  const normalizedKey = roleKey.toLowerCase().replace(/\s+/g, '-');
  return CAREER_METADATA[normalizedKey] || null;
};

/**
 * Get all known career IDs
 */
export const KNOWN_CAREER_IDS = Object.keys(ROADMAP_TEMPLATES).filter(k => k !== 'default' && k !== 'machine-learning');
