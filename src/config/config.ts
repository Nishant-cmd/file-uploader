import path from 'node:path';
import { loadEnvFile } from 'node:process';

loadEnvFile(path.join(__dirname, '../../.env'));

interface Config {
  port: number;
  nodeEnv: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
};

export default config;
