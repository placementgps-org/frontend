/**
 * Placement GPS Canonical Career Taxonomy
 * 
 * Maps course keywords to official domains, roles, and skills.
 * Used by the deterministic matching engine for course enrichment.
 */

export const TAXONOMY_RULES = [
  // --- CYBERSECURITY ---
  {
    keywords: ['cybersecurity', 'security', 'penetration testing', 'ethical hacking', 'soc', 'wireshark', 'owasp', 'cryptography', 'firewall'],
    domains: ['Cybersecurity', 'IT & Infrastructure'],
    roles: ['cybersecurity-engineer', 'SOC Analyst', 'Penetration Tester'],
    skills: ['Cybersecurity Fundamentals', 'Network Security', 'Offensive Security', 'Defensive Security']
  },
  {
    keywords: ['linux', 'ubuntu', 'kali linux', 'bash scripting', 'command line'],
    domains: ['Cybersecurity', 'DevOps', 'Cloud Computing', 'IT & Infrastructure'],
    roles: ['cybersecurity-engineer', 'DevOps Engineer', 'Cloud Engineer', 'Systems Administrator'],
    skills: ['Linux', 'Operating Systems', 'System Administration']
  },
  {
    keywords: ['network', 'networking', 'tcp/ip', 'cisco', 'ccna'],
    domains: ['Networking', 'Cybersecurity', 'Cloud Computing', 'IT & Infrastructure'],
    roles: ['Network Engineer', 'cybersecurity-engineer', 'Cloud Engineer'],
    skills: ['Networking Concepts', 'Network Security', 'Computer Networks']
  },

  // --- FULL STACK & WEB DEVELOPMENT ---
  {
    keywords: ['web development', 'html', 'css', 'javascript', 'frontend', 'front end', 'react', 'bootstrap', 'tailwind'],
    domains: ['Web Development', 'Software Development'],
    roles: ['full-stack-developer', 'Frontend Developer', 'Web Developer'],
    skills: ['Frontend Development', 'HTML5 & CSS3', 'JavaScript', 'React.js', 'UI/UX']
  },
  {
    keywords: ['backend', 'back end', 'node.js', 'express', 'api', 'restful'],
    domains: ['Web Development', 'Software Development'],
    roles: ['full-stack-developer', 'Backend Developer'],
    skills: ['Backend Development', 'Node.js', 'RESTful APIs', 'Server-side Programming']
  },
  {
    keywords: ['database', 'sql', 'mysql', 'postgresql', 'mongodb', 'nosql', 'mongoose'],
    domains: ['Database Engineering', 'Web Development', 'Data Engineering'],
    roles: ['full-stack-developer', 'Database Administrator', 'Data Engineer', 'Backend Developer'],
    skills: ['Databases', 'SQL', 'NoSQL', 'Database Design']
  },
  {
    keywords: ['git', 'github', 'version control'],
    domains: ['Software Development', 'DevOps', 'Web Development'],
    roles: ['full-stack-developer', 'default', 'DevOps Engineer', 'Software Engineer'],
    skills: ['Git & Version Control', 'Git & GitHub']
  },

  // --- GENERAL SOFTWARE ENGINEERING (Default) ---
  {
    keywords: ['python', 'programming with python'],
    domains: ['Software Development', 'Data Science', 'AI/ML', 'Cybersecurity'],
    roles: ['default', 'cybersecurity-engineer', 'Data Scientist', 'AI Engineer', 'Backend Developer'],
    skills: ['Python', 'Programming Fundamentals']
  },
  {
    keywords: ['data structures', 'algorithms', 'dsa', 'competitive programming', 'leetcode'],
    domains: ['Software Development', 'Computer Science'],
    roles: ['default', 'full-stack-developer', 'Software Engineer'],
    skills: ['Data Structures & Algorithms', 'Problem Solving']
  },
  {
    keywords: ['c++', 'java ', 'object oriented', 'oop'],
    domains: ['Software Development', 'Computer Science'],
    roles: ['default', 'Software Engineer', 'Backend Developer'],
    skills: ['Object-Oriented Programming', 'Programming Fundamentals']
  },
  {
    keywords: ['computer science', 'cs50', 'introduction to programming', 'basics'],
    domains: ['Computer Science', 'Software Development'],
    roles: ['default', 'full-stack-developer', 'cybersecurity-engineer'],
    skills: ['Computer Fundamentals', 'Programming Fundamentals']
  },
  {
    keywords: ['aptitude', 'logical reasoning', 'quantitative', 'interview'],
    domains: ['Placement Preparation', 'Soft Skills'],
    roles: ['default', 'full-stack-developer', 'cybersecurity-engineer'],
    skills: ['Aptitude & Logical Reasoning', 'Mock Interview Practice']
  },

  // --- CLOUD & DEVOPS ---
  {
    keywords: ['cloud', 'aws', 'azure', 'gcp', 'google cloud'],
    domains: ['Cloud Computing', 'DevOps'],
    roles: ['Cloud Engineer', 'Cloud Architect', 'DevOps Engineer'],
    skills: ['Cloud Infrastructure', 'AWS', 'Azure', 'GCP']
  },
  {
    keywords: ['devops', 'docker', 'kubernetes', 'ci/cd', 'jenkins'],
    domains: ['DevOps', 'Cloud Computing'],
    roles: ['DevOps Engineer', 'Site Reliability Engineer (SRE)'],
    skills: ['Containerization', 'CI/CD', 'Infrastructure as Code']
  },

  // --- DATA & AI ---
  {
    keywords: ['data science', 'machine learning', 'artificial intelligence', 'deep learning', 'nlp', 'pandas', 'tensorflow'],
    domains: ['Data Science', 'Artificial Intelligence', 'Machine Learning'],
    roles: ['Data Scientist', 'ML Engineer', 'AI Engineer'],
    skills: ['Machine Learning', 'Data Analysis', 'Deep Learning', 'AI Fundamentals']
  }
];

export const classifyCourse = (courseTitle, courseCategory, courseDepartment) => {
  const textToAnalyze = `${courseTitle} ${courseCategory} ${courseDepartment}`.toLowerCase();
  
  const result = {
    domains: new Set(),
    roles: new Set(),
    skills: new Set()
  };

  TAXONOMY_RULES.forEach(rule => {
    // If any keyword matches the text
    const matches = rule.keywords.some(keyword => textToAnalyze.includes(keyword.toLowerCase()));
    if (matches) {
      rule.domains.forEach(d => result.domains.add(d));
      rule.roles.forEach(r => result.roles.add(r));
      rule.skills.forEach(s => result.skills.add(s));
    }
  });

  return {
    domains: Array.from(result.domains),
    roles: Array.from(result.roles),
    skills: Array.from(result.skills)
  };
};
