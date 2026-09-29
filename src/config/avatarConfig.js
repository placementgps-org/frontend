/**
 * Avatar Configuration System for Placement GPS Interview Practice
 * Modular architecture allowing interchangeable HR interviewer personas and AI coach avatars.
 */

export const INTERVIEWER_AVATARS = [
  // ── FEMALE INTERVIEWERS ──
  {
    id: 'sarah',
    didPersonaId: 'amy',
    name: 'Sarah Jenkins',
    title: 'Senior Talent Acquisition Partner',
    company: 'Global Tech & Enterprise Hiring',
    badge: 'HR Specialist',
    gender: 'female',
    avatarImg: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
    voice: {
      pitch: 1.0,
      rate: 0.95,
      preferredGender: 'female',
      cloudVoice: 'nova',
      didVoice: 'en-US-JennyNeural',
      browserKeywords: ['zira', 'samantha', 'victoria', 'karen', 'female', 'google us english', 'natural']
    },
    bio: 'Specializes in behavioral, leadership, and cultural alignment interviews.',
    faceLandmarks: {
      mouthX: 0.48,
      mouthY: 0.63,
      mouthWidth: 0.13,
      eyeY: 0.43,
    },
  },
  {
    id: 'priya',
    name: 'Priya Sharma',
    title: 'Campus Hiring Director',
    company: 'InnovateX Solutions',
    badge: 'Campus Expert',
    gender: 'female',
    avatarImg: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop',
    voice: {
      pitch: 1.05,
      rate: 0.98,
      preferredGender: 'female',
      cloudVoice: 'shimmer',
      didVoice: 'en-IN-NeerjaNeural',
      browserKeywords: ['heera', 'veena', 'ananya', 'indian', 'en-in', 'female', 'google uk english female']
    },
    bio: 'Expert at university placement assessments, aptitude-to-role fit, and soft skills.',
    faceLandmarks: {
      mouthX: 0.50,
      mouthY: 0.62,
      mouthWidth: 0.14,
      eyeY: 0.41,
    },
  },
  {
    id: 'ananya',
    name: 'Ananya Patel',
    title: 'Technical Recruiter & Placement Lead',
    company: 'Nexus Cloud Systems',
    badge: 'Tech Recruiter',
    gender: 'female',
    avatarImg: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=600&auto=format&fit=crop',
    voice: {
      pitch: 1.02,
      rate: 0.96,
      preferredGender: 'female',
      cloudVoice: 'alloy',
      didVoice: 'en-IN-HeeraNeural',
      browserKeywords: ['neerja', 'veena', 'heera', 'female', 'en-in', 'google us english']
    },
    bio: 'Evaluates system architecture, practical project contributions, and analytical problem-solving.',
    faceLandmarks: {
      mouthX: 0.49,
      mouthY: 0.63,
      mouthWidth: 0.13,
      eyeY: 0.42,
    },
  },
  {
    id: 'elena',
    name: 'Elena Rostova',
    title: 'Global Operations & Leadership HR',
    company: 'Vanguard Partners',
    badge: 'Executive Talent',
    gender: 'female',
    avatarImg: 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?q=80&w=600&auto=format&fit=crop',
    voice: {
      pitch: 0.98,
      rate: 0.94,
      preferredGender: 'female',
      cloudVoice: 'nova',
      didVoice: 'en-GB-SoniaNeural',
      browserKeywords: ['hazel', 'susan', 'catherine', 'female', 'google uk english female', 'samantha']
    },
    bio: 'Experienced in international corporate governance, managerial communication, and cross-functional leadership.',
    faceLandmarks: {
      mouthX: 0.50,
      mouthY: 0.62,
      mouthWidth: 0.13,
      eyeY: 0.42,
    },
  },

  // ── MALE INTERVIEWERS ──
  {
    id: 'david',
    didPersonaId: 'matt',
    name: 'David Miller',
    title: 'Executive Recruiter',
    company: 'Talent Acquisition Group',
    badge: 'Placement Lead',
    gender: 'male',
    avatarImg: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop',
    voice: {
      pitch: 0.9,
      rate: 0.95,
      preferredGender: 'male',
      cloudVoice: 'onyx',
      didVoice: 'en-US-GuyNeural',
      browserKeywords: ['david', 'mark', 'george', 'male', 'google us english male', 'microsoft david']
    },
    bio: 'Focuses on communication clarity, project execution, and problem solving.',
    faceLandmarks: {
      mouthX: 0.50,
      mouthY: 0.63,
      mouthWidth: 0.13,
      eyeY: 0.44,
    },
  },
  {
    id: 'alex',
    didPersonaId: 'jack',
    name: 'Alex Rivera',
    title: 'Engineering Hiring Manager',
    company: 'Apex FinTech Labs',
    badge: 'Tech Lead',
    gender: 'male',
    avatarImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    voice: {
      pitch: 0.92,
      rate: 0.97,
      preferredGender: 'male',
      cloudVoice: 'echo',
      didVoice: 'en-US-DavisNeural',
      browserKeywords: ['mark', 'ryan', 'male', 'google us english', 'microsoft mark']
    },
    bio: 'Interviews for core engineering depth, agile collaboration, and pragmatic debugging.',
    faceLandmarks: {
      mouthX: 0.50,
      mouthY: 0.61,
      mouthWidth: 0.14,
      eyeY: 0.43,
    },
  },
  {
    id: 'marcus',
    name: 'Marcus Vance',
    title: 'VP of Talent & People Operations',
    company: 'Horizon Strategy Group',
    badge: 'Culture Director',
    gender: 'male',
    avatarImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
    voice: {
      pitch: 0.88,
      rate: 0.93,
      preferredGender: 'male',
      cloudVoice: 'fable',
      didVoice: 'en-GB-RyanNeural',
      browserKeywords: ['george', 'oliver', 'daniel', 'male', 'google uk english male']
    },
    bio: 'Assesses executive maturity, ethical decision making, and long-term candidate vision.',
    faceLandmarks: {
      mouthX: 0.49,
      mouthY: 0.62,
      mouthWidth: 0.13,
      eyeY: 0.43,
    },
  },
  {
    id: 'james',
    name: 'James Cole',
    title: 'Behavioral Assessment Specialist',
    company: 'Core Placement Advisory',
    badge: 'Behavioral Expert',
    gender: 'male',
    avatarImg: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop',
    voice: {
      pitch: 0.91,
      rate: 0.95,
      preferredGender: 'male',
      cloudVoice: 'onyx',
      didVoice: 'en-IN-PrabhatNeural',
      browserKeywords: ['ravi', 'prabhat', 'david', 'male', 'microsoft david', 'en-in']
    },
    bio: 'Specializes in STAR method scenarios, team dynamics, stress handling, and accountability.',
    faceLandmarks: {
      mouthX: 0.50,
      mouthY: 0.62,
      mouthWidth: 0.13,
      eyeY: 0.44,
    },
  }
];

export const AI_COACH_CONFIG = {
  id: 'coach_gps',
  name: 'Placement Coach',
  title: 'Real-Time AI Interview Coach',
  avatarImg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop',
  states: {
    idle: '🤖',
    listening: '👂',
    thinking: '🧠',
    coaching: '💡',
    warning: '⚠️',
    praise: '🌟'
  }
};

export const getInterviewerById = (id) => {
  return INTERVIEWER_AVATARS.find((a) => a.id === id) || INTERVIEWER_AVATARS[0];
};
