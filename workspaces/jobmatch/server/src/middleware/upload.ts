import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { ENV } from '../config/env.js';
import { AppError } from './errorHandler.js';

if (!fs.existsSync(ENV.UPLOAD_DIR)) {
  fs.mkdirSync(ENV.UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ENV.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const parsed = path.parse(file.originalname);
    const sanitizedBase = parsed.name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    // Security: Strictly enforce .pdf extension to prevent executable/HTML execution
    cb(null, `${uniqueSuffix}-${sanitizedBase || 'resume'}.pdf`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExtension = file.originalname.toLowerCase().endsWith('.pdf');

  if (isPdfMime && isPdfExtension) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file format. Only legitimate PDF (.pdf) files are accepted.', 400));
  }
};

export const resumeUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter
});
