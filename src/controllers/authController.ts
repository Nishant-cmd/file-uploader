import passport from '../config/passport';
import { Request, Response, NextFunction } from 'express';

const validateLogin = passport.authenticate('local', {
  successRedirect: '/dashboard/dashboard',
  failureRedirect: '/auth/log-in',
  failureMessage: true,
});

const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/auth/log-in');
  });
};

export { validateLogin, logout };
