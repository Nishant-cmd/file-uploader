import multer from 'multer';
import type { Request } from 'express';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'application/pdf']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const extensionAllowed = /\.(jpeg|jpg|png|pdf)$/i.test(file.originalname);
    if (extensionAllowed && allowedMimeTypes.has(file.mimetype)) return cb(null, true);
    return cb(new Error('Only JPEG, PNG, and PDF files are allowed.'));
  },
});

export default upload.single('uploadFile');
