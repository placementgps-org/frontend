// Shared data & constants for PlacementGPS

export const SKILLS = [
  { id: 'dsa', name: 'Data Structures & Algorithms', category: 'CS Fundamentals', icon: '🧩' },
  { id: 'system_design', name: 'System Design', category: 'CS Fundamentals', icon: '🏗️' },
  { id: 'oop', name: 'Object-Oriented Programming', category: 'CS Fundamentals', icon: '📦' },
  { id: 'dbms', name: 'DBMS & SQL', category: 'CS Fundamentals', icon: '🗄️' },
  { id: 'os', name: 'Operating Systems', category: 'CS Fundamentals', icon: '💻' },
  { id: 'networks', name: 'Computer Networks', category: 'CS Fundamentals', icon: '🌐' },
  { id: 'react', name: 'React.js', category: 'Frontend', icon: '⚛️' },
  { id: 'nodejs', name: 'Node.js', category: 'Backend', icon: '🟢' },
  { id: 'python', name: 'Python', category: 'Languages', icon: '🐍' },
  { id: 'java', name: 'Java', category: 'Languages', icon: '☕' },
  { id: 'ml', name: 'Machine Learning', category: 'AI/ML', icon: '🤖' },
  { id: 'cloud', name: 'Cloud (AWS/GCP)', category: 'DevOps', icon: '☁️' },
];

export const COMPANIES = [
  { id: 'google', name: 'Google', tier: 'FAANG', icon: '🔵' },
  { id: 'microsoft', name: 'Microsoft', tier: 'FAANG', icon: '🪟' },
  { id: 'amazon', name: 'Amazon', tier: 'FAANG', icon: '📦' },
  { id: 'meta', name: 'Meta', tier: 'FAANG', icon: '🌐' },
  { id: 'apple', name: 'Apple', tier: 'FAANG', icon: '🍎' },
  { id: 'flipkart', name: 'Flipkart', tier: 'Tier-1', icon: '🛒' },
  { id: 'atlassian', name: 'Atlassian', tier: 'Tier-1', icon: '🔷' },
  { id: 'adobe', name: 'Adobe', tier: 'Tier-1', icon: '🎨' },
  { id: 'infosys', name: 'Infosys', tier: 'Tier-2', icon: '💼' },
  { id: 'wipro', name: 'Wipro', tier: 'Tier-2', icon: '🔶' },
];

export const ROLES = [
  'Software Development Engineer (SDE)',
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
  'Data Scientist',
  'ML Engineer',
  'DevOps Engineer',
  'Product Manager',
];

export const INTERVIEW_QUESTIONS = {
  dsa: [
    { q: 'Explain the time complexity of QuickSort in best, average, and worst cases.', level: 'Medium' },
    { q: 'How would you detect a cycle in a linked list?', level: 'Easy' },
    { q: 'Design an LRU Cache. What data structures would you use?', level: 'Hard' },
    { q: 'What is dynamic programming? Explain with the Fibonacci example.', level: 'Easy' },
    { q: 'Explain the concept of a balanced BST and give an example.', level: 'Medium' },
  ],
  system_design: [
    { q: 'Design a URL shortener like bit.ly. Walk me through the architecture.', level: 'Hard' },
    { q: 'How would you design a notification system for millions of users?', level: 'Hard' },
    { q: 'Explain CAP theorem with a real-world example.', level: 'Medium' },
    { q: 'How does a CDN work? When would you use one?', level: 'Medium' },
    { q: `Design Twitter's trending topics feature.`, level: 'Hard' },
  ],
  behavioral: [
    { q: 'Tell me about a time you had a conflict with a team member. How did you resolve it?', level: 'Easy' },
    { q: 'Describe a project where you had to learn something completely new under a tight deadline.', level: 'Medium' },
    { q: 'What is your greatest technical achievement and why?', level: 'Easy' },
    { q: 'How do you prioritize tasks when everything seems equally urgent?', level: 'Medium' },
    { q: 'Tell me about a time you failed and what you learned from it.', level: 'Easy' },
  ],
};

export const ROADMAP_WEEKS = [
  {
    week: 1,
    title: 'Foundation & Assessment',
    tasks: ['Complete skill gap analysis', 'Set up LeetCode profile', 'Solve 10 easy DSA problems'],
    status: 'completed',
  },
  {
    week: 2,
    title: 'Arrays, Strings & Hashing',
    tasks: ['Study array manipulation techniques', 'Practice 15 medium problems', 'Review time complexity'],
    status: 'in-progress',
  },
  {
    week: 3,
    title: 'Trees, Graphs & BFS/DFS',
    tasks: ['Binary trees & traversals', 'Graph algorithms (BFS, DFS, Dijkstra)', '20 medium/hard problems'],
    status: 'upcoming',
  },
  {
    week: 4,
    title: 'Dynamic Programming',
    tasks: ['DP patterns (knapsack, LCS, LIS)', 'Solve 15 DP problems', 'Practice memoization'],
    status: 'upcoming',
  },
  {
    week: 5,
    title: 'System Design Basics',
    tasks: ['Study scalability concepts', 'Design 3 systems from scratch', 'Learn about databases'],
    status: 'upcoming',
  },
  {
    week: 6,
    title: 'Mock Interviews & Polish',
    tasks: ['5 mock interviews', 'Behavioral prep (STAR method)', 'Resume review & optimization'],
    status: 'upcoming',
  },
];
