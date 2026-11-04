import { Router, Request, Response } from 'express';
import requireAuth from '../../middlewares/requireAuth';

const dashboardRouter = Router();

dashboardRouter.get("/dashboard", requireAuth, (req, res) => {
    res.render("dashboard_view/dashboard");
})

export default dashboardRouter
