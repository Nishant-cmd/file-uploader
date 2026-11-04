import { Router, Request, Response } from 'express';
import registerUser from '../../controllers/userController';
import validateUser from '../../config/validation';
import validateLogin from '../../controllers/authController';

const authRouter = Router();

authRouter.get('/log-in', (req: Request, res: Response) => {
  const errors = req.session.messages || [];
  req.session.messages = [];
  res.render('auth_view/log-in', { errors });
});

authRouter.get('/sign-up', (req: Request, res: Response) => {
  res.render('auth_view/sign-up', { errors: [] });
});

authRouter.post('/log-in', validateLogin);
authRouter.post('/sign-up', validateUser, registerUser);

export default authRouter;
