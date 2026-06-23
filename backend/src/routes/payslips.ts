import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { uploadPayslip, getPayslip, listPayslips } from '../services/payslipService.js';
import { sendSuccess } from '../utils/response.js';
import { uploadLimiter } from '../middleware/rateLimit.js';
import { loadEnv } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export const payslipsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: loadEnv().MAX_UPLOAD_MB * 1024 * 1024 },
});

payslipsRouter.use(authenticate);

payslipsRouter.get('/', (req, res, next) => {
  try {
    sendSuccess(res, listPayslips(req.auth!.userId));
  } catch (err) {
    next(err);
  }
});

payslipsRouter.get('/:id', (req, res, next) => {
  try {
    sendSuccess(res, getPayslip(req.auth!.userId, req.params.id));
  } catch (err) {
    next(err);
  }
});

payslipsRouter.post('/upload', uploadLimiter, (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        throw new AppError('PAYLOAD_TOO_LARGE', 'File exceeds maximum upload size', 413);
      }
      if (err) throw err;
      if (!req.file) throw new AppError('VALIDATION_ERROR', 'No file uploaded', 400);
      const result = await uploadPayslip(
        req.auth!.userId,
        req.file.originalname,
        req.file.mimetype,
        req.file.buffer,
      );
      sendSuccess(res, result, 201);
    } catch (e) {
      next(e);
    }
  });
});
