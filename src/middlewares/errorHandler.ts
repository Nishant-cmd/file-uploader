import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File size cannot exceed 10 MB',
      });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Only one file is allowed',
      });
    }

    return res.status(400).json({
      message: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      message: err.message || 'File upload failed',
    });
  }

  next();
};

export default errorHandler;
