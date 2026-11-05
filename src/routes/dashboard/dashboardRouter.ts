import { Router, Request, Response } from 'express';
import requireAuth from '../../middlewares/requireAuth';
import { logout } from '../../controllers/authController';

const dashboardRouter = Router();

dashboardRouter.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard_view/dashboard');
});

dashboardRouter.get('/log-out', requireAuth, logout);

export default dashboardRouter;
