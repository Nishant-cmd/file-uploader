import path from 'node:path';
import express from 'express';
import index from './routes/index';

const app = express();

//Configure views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Parse incoming request bodies
app.use(express.urlencoded({ extended: true }));

//Serve static assets
const assetsPath = path.join(__dirname, 'public');
app.use(express.static(assetsPath));

//Routes
app.get('/', index);

export default app;
