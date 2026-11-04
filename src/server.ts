import app from './app';
import config from './config/config';
import './types';

app.listen(config.port, (error) => {
  if (error) {
    throw error;
  }
  console.log(`App running on port ${config.port}`);
});
