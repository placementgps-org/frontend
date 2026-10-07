import fs from 'fs';
import path from 'path';

const numerical = [
  "Percentages", "Ratio & Proportion", "Averages", "Profit, Loss & Discount", "Time, Speed & Distance",
  "Time & Work", "Number System", "Data Interpretation", "Simple Interest", "Compound Interest",
  "Probability", "Permutation & Combination", "Algebra", "Mixtures & Alligation", "Ages",
  "LCM & HCF", "Data Sufficiency", "Partnership", "Problems on Numbers", "Mensuration",
  "Geometry", "Simplification & Approximation", "Clocks", "Calendars", "Races",
  "Boats & Streams", "Pipes & Cisterns", "Fractions & Decimals", "Surds & Indices", "Progressions (AP/GP)",
  "Logarithms", "Statistics", "Set Theory", "Coordinate Geometry", "Stocks & Shares"
];

const logical = [
  "Number Series", "Coding-Decoding", "Logical Puzzles", "Seating Arrangement", "Syllogisms",
  "Blood Relations", "Direction & Distance", "Statement & Conclusion", "Ranking & Ordering", "Data Sufficiency",
  "Analogy", "Classification / Odd One Out", "Alphanumeric Series", "Statement & Assumption", "Statement & Argument",
  "Cause & Effect", "Course of Action", "Venn Diagrams", "Input-Output", "Mathematical Operations",
  "Logical Deduction", "Decision Making", "Assertion & Reason", "Logical Sequence", "Missing Characters",
  "Pattern Recognition", "Cryptarithms", "Calendar Reasoning", "Clock Reasoning", "Non-Verbal Reasoning",
  "Cube & Dice", "Mirror Images", "Water Images", "Paper Folding", "Paper Cutting",
  "Embedded Figures", "Figure Matrix", "Figure Completion", "Visual Reasoning", "Advanced Puzzle Problems"
];

const verbal = [
  "Reading Comprehension", "Sentence Correction", "Error Detection", "Fill in the Blanks", "Vocabulary",
  "Synonyms", "Antonyms", "Para Jumbles", "Sentence Rearrangement", "Sentence Completion",
  "Critical Reasoning", "Grammar", "Cloze Test", "Theme Detection", "Inference Questions",
  "Parts of Speech", "Tenses", "Subject-Verb Agreement", "Articles", "Prepositions",
  "Pronouns", "Conjunctions", "Active & Passive Voice", "Direct & Indirect Speech", "Idioms & Phrases",
  "One-Word Substitution", "Contextual Vocabulary", "Word Usage", "Spelling", "Homophones",
  "Phrasal Verbs", "Word Formation", "Sentence Transformation", "Advanced Vocabulary", "Paragraph Correction"
];

const situational = [
  "Workplace Ethics & Integrity", "Teamwork & Collaboration", "Communication", "Problem Solving", "Prioritization",
  "Customer Handling", "Ownership & Accountability", "Conflict Resolution", "Decision Making", "Adaptability",
  "Time Management", "Working Under Pressure", "Leadership", "Receiving Feedback", "Giving Constructive Feedback",
  "Handling Mistakes", "Dealing With Difficult Teammates", "Handling Ambiguous Situations", "Learning New Skills Quickly", "Managing Changing Requirements",
  "Professionalism", "Confidentiality & Data Handling", "Customer Escalation", "Resource Management", "Stakeholder Management",
  "Business Judgement", "Ethical Dilemmas", "Workplace Diversity & Inclusion", "Remote/Hybrid Workplace Scenarios", "Crisis Management"
];

const analytical = [
  "Critical Thinking", "Analytical Reasoning", "Problem Solving", "Data Analysis", "Data Interpretation",
  "Logical Deduction", "Decision Making", "Pattern Recognition", "Data Sufficiency", "Information Evaluation",
  "Estimation", "Case-Based Reasoning", "Constraint-Based Problems", "Optimization Problems", "Assumption Identification",
  "Argument Evaluation", "Cause & Effect Analysis", "Inference", "Evidence-Based Reasoning", "Scenario Analysis"
];

const idify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const structure = {
  categories: [
    {
      id: "numerical",
      name: "Numerical Practice",
      description: "Master quantitative aptitude and calculation skills.",
      icon: "Calculator",
      topicsCount: 35
    },
    {
      id: "logical",
      name: "Logical Reasoning",
      description: "Enhance your puzzle-solving and analytical thinking.",
      icon: "Brain",
      topicsCount: 40
    },
    {
      id: "verbal",
      name: "Verbal Ability",
      description: "Improve English grammar, vocabulary, and comprehension.",
      icon: "BookOpen",
      topicsCount: 35
    },
    {
      id: "situational",
      name: "Situational Judgement",
      description: "Tackle workplace scenarios and behavioral questions.",
      icon: "Users",
      topicsCount: 30
    },
    {
      id: "analytical",
      name: "Analytical & Critical Thinking",
      description: "Evaluate arguments and interpret complex data.",
      icon: "Lightbulb",
      topicsCount: 20
    }
  ],
  topics: {
    numerical: numerical.map((name, i) => ({ id: idify(name), name, priority: i + 1 })),
    logical: logical.map((name, i) => ({ id: idify(name), name, priority: i + 1 })),
    verbal: verbal.map((name, i) => ({ id: idify(name), name, priority: i + 1 })),
    situational: situational.map((name, i) => ({ id: idify(name), name, priority: i + 1 })),
    analytical: analytical.map((name, i) => ({ id: idify(name), name, priority: i + 1 }))
  }
};

// Preserve existing content if it exists
let existingData = {};
try {
  const jsonPath = path.join(process.cwd(), 'server', 'data', 'aptitudeContent.json');
  existingData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
} catch (e) {}

for (const cat of ['numerical', 'logical', 'verbal', 'situational', 'analytical']) {
  for (const topic of structure.topics[cat]) {
    const existingCat = existingData.topics?.[cat] || [];
    const existingTopic = existingCat.find(t => t.id === topic.id);
    if (existingTopic && existingTopic.content) {
      topic.content = existingTopic.content;
    }
  }
}

const jsonPath = path.join(process.cwd(), 'server', 'data', 'aptitudeContent.json');
fs.writeFileSync(jsonPath, JSON.stringify(structure, null, 2));
console.log('Successfully wrote 160 topics to aptitudeContent.json');
