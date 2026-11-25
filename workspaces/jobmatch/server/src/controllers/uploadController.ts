import { Request, Response, NextFunction } from 'express';
import fs from 'node:fs';
import { AppError } from '../middleware/errorHandler.js';
import { userRepository } from '../repositories/userRepository.js';

export class UploadController {
  uploadResume(req: Request, res: Response, next: NextFunction): void {
    try {
      if (!req.file) {
        throw new AppError('No PDF resume file uploaded.', 400);
      }

      // Security: Deep inspection of magic bytes (%PDF- = 0x25 0x50 0x44 0x46)
      const buffer = Buffer.alloc(5);
      const fd = fs.openSync(req.file.path, 'r');
      fs.readSync(fd, buffer, 0, 5, 0);
      fs.closeSync(fd);

      if (buffer.toString('utf-8', 0, 4) !== '%PDF') {
        // Quarantine / Delete corrupted or spoofed file immediately
        try {
          fs.unlinkSync(req.file.path);
        } catch {
          // ignore unlink error
        }
        throw new AppError('Security violation: File header magic bytes mismatch. Uploaded file is not a valid PDF.', 400);
      }

      const fileUrl = `/uploads/resumes/${req.file.filename}`;

      // If user is a seeker, update their profile resume_url automatically
      if (req.user && req.user.role === 'SEEKER') {
        userRepository.updateSeekerProfile(req.user.id, {
          resume_url: fileUrl
        });
      }

      res.status(201).json({
        success: true,
        fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      next(error);
    }
  }
}

export const uploadController = new UploadController();
