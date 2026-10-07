/**
 * Intelligent Interview Question Bank for PlacementGPS
 * These questions contain metadata to support heuristic relevance checking and contextual follow-ups.
 */

export const HR_QUESTIONS = [
  {
    question: "Tell me about yourself.",
    category: "introduction",
    expectedTopics: ["student", "study", "university", "background", "experience", "skill", "passion", "technology", "degree", "learning", "developer", "engineer"],
    followUpTemplates: [
      { type: "technology", template: "You mentioned {entity}. How did you first get interested in that?" },
      { type: "role", template: "What aspects of being a {entity} appeal to you the most?" },
      { type: "generic", template: "What would you say is the most defining part of your background?" }
    ]
  },
  {
    question: "What are your greatest strengths?",
    category: "strengths",
    expectedTopics: ["strength", "good", "best", "skill", "ability", "fast", "learner", "problem", "solving", "teamwork", "communication", "adapt"],
    followUpTemplates: [
      { type: "concept", template: "Can you give an example of a time when your {entity} really helped a project succeed?" },
      { type: "generic", template: "How do you actively apply that strength in your day-to-day work?" }
    ]
  },
  {
    question: "What is one weakness you are currently working on?",
    category: "weakness",
    expectedTopics: ["weakness", "improve", "struggle", "bad", "time", "management", "perfectionist", "delegate", "focus", "learning", "working"],
    followUpTemplates: [
      { type: "concept", template: "What specific steps are you taking to improve regarding {entity}?" },
      { type: "generic", template: "How has that weakness challenged you recently?" }
    ]
  },
  {
    question: "Why should we hire you for this role?",
    category: "motivation",
    expectedTopics: ["hire", "fit", "perfect", "skills", "value", "bring", "company", "role", "experience", "motivated", "dedication"],
    followUpTemplates: [
      { type: "technology", template: "How do you see your experience with {entity} contributing to our team?" },
      { type: "role", template: "What do you think makes a great {entity}?" },
      { type: "generic", template: "What unique perspective do you think you bring?" }
    ]
  },
  {
    question: "Why do you want to join our company specifically?",
    category: "motivation",
    expectedTopics: ["company", "culture", "product", "mission", "vision", "team", "grow", "learn", "opportunity", "environment"],
    followUpTemplates: [
      { type: "concept", template: "What about our {entity} stands out to you the most?" },
      { type: "generic", template: "How does our company align with your long-term goals?" }
    ]
  },
  {
    question: "Where do you see your career going in the next few years?",
    category: "goals",
    expectedTopics: ["career", "goal", "years", "future", "manager", "lead", "senior", "expert", "learn", "grow", "architect"],
    followUpTemplates: [
      { type: "role", template: "What steps are you taking now to eventually become a {entity}?" },
      { type: "technology", template: "Do you see yourself continuing to focus on {entity} in the future?" },
      { type: "generic", template: "What is the biggest milestone you hope to achieve along that path?" }
    ]
  },
  {
    question: "Could you tell me about a recent project you have worked on?",
    category: "project",
    expectedTopics: ["project", "built", "develop", "code", "app", "system", "web", "design", "team", "using", "used", "created"],
    followUpTemplates: [
      { type: "technology", template: "Why did you choose to use {entity} for that project?" },
      { type: "role", template: "What was your specific role when developing that project?" },
      { type: "generic", template: "What was the most challenging technical part of that project?" }
    ]
  },
  {
    question: "Tell me about a significant challenge you faced during a project and how you handled it.",
    category: "challenge",
    expectedTopics: ["challenge", "problem", "difficult", "bug", "error", "issue", "fix", "resolve", "team", "deadline", "communication"],
    followUpTemplates: [
      { type: "technology", template: "How did your knowledge of {entity} help you overcome that?" },
      { type: "generic", template: "What did you learn from handling that challenge?" }
    ]
  },
  {
    question: "How do you handle pressure and tight deadlines?",
    category: "pressure",
    expectedTopics: ["pressure", "deadline", "stress", "prioritize", "time", "management", "planning", "calm", "task", "workload", "schedule", "organize"],
    followUpTemplates: [
      { type: "concept", template: "Can you give an example of a time when your {entity} was really tested by a deadline?" },
      { type: "generic", template: "Has there ever been a time when your strategy for handling pressure failed?" }
    ]
  },
  {
    question: "Do you prefer working independently or as part of a team?",
    category: "teamwork",
    expectedTopics: ["team", "independent", "alone", "collaborate", "together", "both", "depend", "pair", "group", "communicate"],
    followUpTemplates: [
      { type: "concept", template: "What is the biggest advantage of {entity} for you?" },
      { type: "generic", template: "How do you adapt if the work environment forces the opposite of your preference?" }
    ]
  },
  {
    question: "Describe a time when you had a disagreement with a team member. How did you resolve it?",
    category: "conflict",
    expectedTopics: ["disagree", "conflict", "argue", "resolve", "talk", "listen", "compromise", "understand", "perspective", "solution", "team"],
    followUpTemplates: [
      { type: "concept", template: "How did the {entity} ultimately improve the outcome?" },
      { type: "generic", template: "Did that experience change how you approach teamwork now?" }
    ]
  },
  {
    question: "Do you have any questions for us?",
    category: "closing",
    expectedTopics: ["question", "role", "team", "culture", "next", "steps", "no", "all", "good", "clear"],
    followUpTemplates: [
      { type: "generic", template: "Is there anything else you'd like to know before we wrap up?" }
    ]
  }
];

export const PERSONAL_QUESTIONS = [
  {
    question: "To start off, please tell me a little bit about yourself.",
    category: "introduction",
    expectedTopics: ["background", "grew", "from", "enjoy", "hobby", "student", "passion", "interested"],
    followUpTemplates: [
      { type: "generic", template: "How did you originally discover your passion for that?" }
    ]
  },
  {
    question: "What do you enjoy doing outside of your academic or professional work?",
    category: "hobbies",
    expectedTopics: ["hobby", "outside", "enjoy", "play", "read", "sports", "music", "art", "game", "travel", "relax", "weekend"],
    followUpTemplates: [
      { type: "concept", template: "Does your interest in {entity} help you in your professional life at all?" },
      { type: "generic", template: "How long have you been doing that?" }
    ]
  },
  {
    question: "What core values motivate you the most?",
    category: "motivation",
    expectedTopics: ["value", "motivate", "drive", "impact", "learn", "help", "success", "integrity", "honesty", "hard", "work"],
    followUpTemplates: [
      { type: "concept", template: "Why is {entity} so important to you?" },
      { type: "generic", template: "Can you give an example of when you demonstrated that value?" }
    ]
  },
  {
    question: "What is a new skill or topic you are currently learning?",
    category: "learning",
    expectedTopics: ["learn", "skill", "topic", "reading", "course", "studying", "exploring", "new", "try", "practice"],
    followUpTemplates: [
      { type: "technology", template: "What has been the most difficult part of learning {entity} so far?" },
      { type: "generic", template: "How do you plan to apply what you are learning?" }
    ]
  },
  {
    question: "Tell me about an accomplishment that you are particularly proud of.",
    category: "achievement",
    expectedTopics: ["proud", "accomplish", "achieve", "success", "win", "award", "grade", "project", "overcame", "completed"],
    followUpTemplates: [
      { type: "technology", template: "How did using {entity} contribute to that accomplishment?" },
      { type: "generic", template: "What was the biggest obstacle you had to overcome to achieve that?" }
    ]
  },
  {
    question: "Can you share an example of a difficult personal situation you successfully managed?",
    category: "challenge",
    expectedTopics: ["difficult", "situation", "manage", "handle", "tough", "personal", "struggle", "overcome", "time", "family", "friend"],
    followUpTemplates: [
      { type: "generic", template: "Looking back, would you handle that situation any differently now?" }
    ]
  },
  {
    question: "How do you typically react when you make a mistake?",
    category: "mistakes",
    expectedTopics: ["mistake", "react", "fix", "learn", "admit", "apologize", "own", "responsibility", "correct", "improve", "prevent"],
    followUpTemplates: [
      { type: "concept", template: "Has there been a time when {entity} was especially hard to do after a mistake?" },
      { type: "generic", template: "Can you share a specific example of a mistake you learned from recently?" }
    ]
  },
  {
    question: "How do you handle constructive criticism?",
    category: "feedback",
    expectedTopics: ["criticism", "feedback", "handle", "listen", "improve", "accept", "open", "mind", "learn", "grow", "defensive"],
    followUpTemplates: [
      { type: "generic", template: "Can you recall a time when you received feedback that was hard to hear?" }
    ]
  },
  {
    question: "What kind of work environment helps you be the most productive?",
    category: "environment",
    expectedTopics: ["environment", "productive", "quiet", "team", "collaborative", "remote", "office", "focus", "supportive", "fast", "paced"],
    followUpTemplates: [
      { type: "generic", template: "How do you adapt if an environment is the exact opposite of what you prefer?" }
    ]
  },
  {
    question: "If you could improve one professional skill right now, what would it be?",
    category: "improvement",
    expectedTopics: ["improve", "skill", "communication", "technical", "coding", "public", "speaking", "leadership", "management"],
    followUpTemplates: [
      { type: "technology", template: "Are there any specific projects you want to build to improve your {entity}?" },
      { type: "concept", template: "How would improving your {entity} impact your career?" },
      { type: "generic", template: "What is holding you back from mastering that skill right now?" }
    ]
  }
];

export default {
  HR_QUESTIONS,
  PERSONAL_QUESTIONS
};
