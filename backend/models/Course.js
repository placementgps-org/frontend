import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    unique: true
  },
  courseName: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  courseLink: {
    type: String,
    required: true
  },
  category: {
    type: String
  },
  department: {
    type: String
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', '']
  },
  skills: {
    type: String
  },
  skillsArray: {
    type: [String],
    default: []
  },
  domains: {
    type: [String],
    default: []
  },
  roles: {
    type: [String],
    default: []
  },
  roadmapStages: {
    type: [String],
    default: []
  },
  prerequisites: {
    type: String
  },
  certificateAvailable: {
    type: String
  },
  sourceFiles: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create compound text index for search
courseSchema.index({
  courseName: 'text',
  provider: 'text',
  category: 'text',
  skills: 'text',
  department: 'text'
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
