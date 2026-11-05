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

const app = express();

//Configure views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Parse incoming request bodies
app.use(express.urlencoded({ extended: true }));

//Serve static assets
const assetsPath = path.join(__dirname, 'public');
app.use(express.static(assetsPath));

// Create & load the session
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
    store: new PrismaSessionStore(prisma as any, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
    }),
  }),
);

//Initialize passport
app.use(passport.initialize());
app.use(passport.session());

//Routes
app.get('/', index);
app.use('/auth', authRouter);
app.use('/dashboard', dashboardRouter);

export default app;
