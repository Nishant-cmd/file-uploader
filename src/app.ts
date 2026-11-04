import path from 'node:path';
import express from 'express';
import index from './routes/index';
import session from 'express-session';
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
  session({
    secret: process.env.SESSION_SECRET || 'development-only-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
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
