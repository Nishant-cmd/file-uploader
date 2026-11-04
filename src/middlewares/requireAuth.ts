import { Request, Response, NextFunction } from 'express';

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }

  req.session.messages = [...(req.session.messages || []), 'You need to log in to view dashboard'];
  return res.redirect('/');
}

export default requireAuth;
