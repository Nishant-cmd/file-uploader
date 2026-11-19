import path from 'node:path';
import express from 'express';
import index from './routes/index';
import expressSession from 'express-session';
import 'dotenv/config';
import { prisma } from './lib/prisma';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import authRouter from './routes/auth/authRouter';
import passport from 'passport';
import dashboardRouter from './routes/dashboard/dashboardRouter';
import errorHandler from './middlewares/errorHandler';

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

const assetsPath = path.join(__dirname, '../public');
app.use(express.static(assetsPath));

app.use(
  expressSession({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
    store: new PrismaSessionStore(prisma as any, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
    }),
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/auth', authRouter);
app.use('/dashboard', dashboardRouter);
app.use(errorHandler);

export default app;
