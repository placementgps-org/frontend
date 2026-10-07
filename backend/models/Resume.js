import mongoose from 'mongoose';

/**
 * Resume Schema for Placement GPS.
 * Stores extracted text, AI analysis evaluation, and course recommendations
 * associated with a specific student/user.
 */
const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      default: 'application/pdf'
    },
    fileSize: {
      type: Number,
      default: 0
    },
    extractedText: {
      type: String,
      default: ''
    },
    analysis: {
      overallScore: { type: Number, default: 0 },
      atsScore: { type: Number, default: 0 },
      skillsScore: { type: Number, default: 0 },
      projectsScore: { type: Number, default: 0 },

      overallImpression: { type: String, default: '' },
      strengths: { type: [String], default: [] },

      atsCompatibility: {
        score: { type: Number, default: 0 },
        goodPractices: { type: [String], default: [] },
        potentialIssues: { type: [String], default: [] },
        improvements: { type: [String], default: [] }
      },

      skillsAnalysis: {
        score: { type: Number, default: 0 },
        detected: { type: [String], default: [] },
        strong: { type: [String], default: [] },
        weakOrInsufficient: { type: [String], default: [] },
        missingForTargetRoles: { type: [String], default: [] },
        employabilityBoosters: { type: [String], default: [] },
        explanation: { type: String, default: '' }
      },

      projectsAnalysis: {
        score: { type: Number, default: 0 },
        projectCount: { type: Number, default: 0 },
        hasProjects: { type: Boolean, default: false },
        detectedProjects: [
          {
            name: { type: String, default: '' },
            technologies: { type: [String], default: [] },
            feedback: { type: String, default: '' },
            strengths: { type: [String], default: [] },
            missingElements: { type: [String], default: [] }
          }
        ],
        technicalDepthFeedback: { type: String, default: '' },
        measurableOutcomesFeedback: { type: String, default: '' },
        explanation: { type: String, default: '' }
      },

      profileEvaluation: {
        education: {
          degree: { type: String, default: '' },
          relevance: { type: String, default: '' },
          feedback: { type: String, default: '' }
        },
        certifications: {
          detected: { type: [String], default: [] },
          relevance: { type: String, default: '' },
          missingRecommendations: { type: [String], default: [] }
        },
        experience: {
          internships: { type: [String], default: [] },
          workExperience: { type: [String], default: [] },
          qualityFeedback: { type: String, default: '' }
        }
      },

      suitableRoles: [
        {
          role: { type: String, required: true },
          matchPercentage: { type: Number, default: 0 },
          reason: { type: String, default: '' },
          missingSkills: { type: [String], default: [] },
          priority: { type: String, default: 'High' }
        }
      ],

      internshipReadiness: {
        isReady: { type: Boolean, default: false },
        readinessLevel: { type: String, default: 'Moderate' },
        suitableDomains: { type: [String], default: [] },
        recommendedInternshipTypes: { type: [String], default: [] },
        prerequisiteSkillsToBuild: { type: [String], default: [] },
        summary: { type: String, default: '' }
      },

      thingsToImprove: {
        resumeContent: { type: [String], default: [] },
        technicalProfile: { type: [String], default: [] },
        projects: { type: [String], default: [] },
        atsOptimization: { type: [String], default: [] },
        careerReadiness: { type: [String], default: [] }
      },

      courseRecommendations: [
        {
          courseId: { type: String, default: '' },
          courseName: { type: String, required: true },
          provider: { type: String, default: '' },
          courseLink: { type: String, required: true },
          difficulty: { type: String, default: 'All Levels' },
          category: { type: String, default: '' },
          priority: {
            type: String,
            enum: ['high', 'recommended', 'optional'],
            default: 'recommended'
          },
          reason: { type: String, default: '' },
          relatedRole: { type: String, default: '' },
          relatedSkills: { type: [String], default: [] }
        }
      ]
    },
    analyzedAt: {
      type: Date,
      default: Date.now
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;
