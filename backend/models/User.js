import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema for Placement GPS.
 * Stores user credentials, profile data, and progress tracking fields
 * used across modules (Practice, Resume, Roadmap, Interview).
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      match: [/^\d{10,15}$/, 'Please enter a valid phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    profileImage: {
      type: String,
      default: '',
    },
    resumeUploaded: {
      type: Boolean,
      default: false,
    },
    roadmapProgress: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Stores history of progress when switching between careers
    careerHistories: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Stores AI-generated custom career roadmaps (keyed by careerId slug)
    customRoadmaps: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    quizHistory: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    interviewHistory: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // ── OTP fields (temporary, cleared after verification) ──
    otp: {
      type: String,
      select: false, // Never returned in queries by default
    },
    otpExpires: {
      type: Date,
      select: false,
    },
    otpPurpose: {
      type: String,
      enum: ['registration', 'forgot-password', ''],
      default: '',
      select: false,
    },
    otpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

/**
 * Pre-save hook: hash password before saving.
 * Only runs when the password field has been modified.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Instance method: compare a candidate password with the stored hash.
 */
userSchema.methods.matchPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
