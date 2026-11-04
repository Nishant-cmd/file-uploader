import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { validationResult, matchedData } from 'express-validator';
import { createUser } from '../db/queries';

export default async function registerUser(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render('auth_view/sign-up', {
        errors: errors.array(),
      });
    }

    const { username, email, password } = matchedData(req);

    const hashedPassword = await bcrypt.hash(password, 10);

    await createUser(username, email, hashedPassword);

    return res.status(201).redirect('auth_view/login');
  } catch (err) {
    next(err);
  }
}
