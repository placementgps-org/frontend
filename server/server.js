import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import { getTransporter } from './utils/sendEmail.js';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import aptitudeRoutes from './routes/aptitudeRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Validate critical configurations
const criticalEnv = [];
if (!process.env.MONGO_URI) criticalEnv.push('MONGO_URI');
if (!process.env.JWT_SECRET) criticalEnv.push('JWT_SECRET');

if (criticalEnv.length > 0) {
  console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.error(`❌ CRITICAL ENVIRONMENT CONFIGURATION ERROR:`);
  console.error(`   Missing critical variables: ${criticalEnv.join(', ')}`);
  console.error(`   The application cannot start without these configurations.`);
  console.error(`   Please check your server/.env file.`);
  console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  process.exit(1);
}

// Helper to verify SMTP credentials on startup
const verifySMTP = async () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromEmail = process.env.EMAIL_FROM || process.env.FROM_EMAIL;

  const missing = [];
  if (!host) missing.push('SMTP_HOST');
  if (!port) missing.push('SMTP_PORT');
  if (!user) missing.push('SMTP_USER');
  if (!pass) missing.push('SMTP_PASS');
  if (!fromEmail) missing.push('EMAIL_FROM');

  if (missing.length > 0) {
    console.warn(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.warn(`⚠️  SMTP Configuration Warning (Email OTP will fail):`);
    console.warn(`   Missing variables: ${missing.join(', ')}`);
    console.warn(`   Please configure these inside server/.env`);
    console.warn(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    return;
  }

  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log('✅ SMTP Server Connection verified successfully');
  } catch (error) {
    console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.error(`❌ SMTP verification failed: ${error.message}`);
    console.error(`   Please check your SMTP credentials in server/.env`);
    console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  }
};

// Helper to verify Twilio config on startup
const verifySMSConfig = () => {
  const apiKey = process.env.SMS_PROVIDER_API_KEY || process.env.TWILIO_SID;
  const secret = process.env.SMS_PROVIDER_SECRET || process.env.TWILIO_AUTH_TOKEN;
  const senderId = process.env.SMS_SENDER_ID || process.env.TWILIO_PHONE;

  const missing = [];
  if (!apiKey) missing.push('SMS_PROVIDER_API_KEY / TWILIO_SID');
  if (!secret) missing.push('SMS_PROVIDER_SECRET / TWILIO_AUTH_TOKEN');
  if (!senderId) missing.push('SMS_SENDER_ID / TWILIO_PHONE');

  if (missing.length > 0) {
    console.warn(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.warn(`⚠️  SMS Configuration Warning (SMS OTP will fail):`);
    console.warn(`   Missing variables: ${missing.join(', ')}`);
    console.warn(`   Please configure these inside server/.env`);
    console.warn(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  } else {
    console.log('✅ SMS Provider Configuration detected successfully');
  }
};

// Connect to MongoDB
connectDB();

// Validate SMTP and SMS configurations
verifySMTP();
verifySMSConfig();

const app = express();

// ── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet());
app.use(mongoSanitize());

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/aptitude', aptitudeRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/resume', resumeRoutes);

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Placement GPS Server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
