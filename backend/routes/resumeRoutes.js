import express from 'express';
import multer from 'multer';
import {
  uploadAndAnalyzeResume,
  getMyResume,
  deleteMyResume,
  chatWithCareerAssistant
} from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer memory storage configuration (Max 5MB)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ];

  const ext = (file.originalname || '').toLowerCase();
  const isAllowedExt = ext.endsWith('.pdf') || ext.endsWith('.docx') || ext.endsWith('.doc') || ext.endsWith('.txt');

  if (allowedMimeTypes.includes(file.mimetype) || isAllowedExt) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Please upload a PDF (.pdf) or Word document (.docx).'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  },
  fileFilter
});

// Middleware to handle multer file upload errors gracefully
const handleUploadMiddleware = (req, res, next) => {
  const uploadSingle = upload.single('resume');
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds the 5MB limit. Please upload a smaller file.'
        });
      }
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// All resume routes are protected
router.use(protect);

router.post('/upload', handleUploadMiddleware, uploadAndAnalyzeResume);
router.get('/me', getMyResume);
router.delete('/me', deleteMyResume);
router.post('/assistant/chat', chatWithCareerAssistant);

export default router;
