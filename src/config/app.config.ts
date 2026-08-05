import { registerAs } from '@nestjs/config';

export type NodeEnvironment = 'development' | 'test' | 'production';

export interface AppConfig {
  nodeEnv: NodeEnvironment;
  port: number;
  isProduction: boolean;
  corsAllowedOrigins: string[];
}

const getNodeEnvironment = (): NodeEnvironment => {
  const value = process.env.NODE_ENV;

  if (value === 'development' || value === 'test' || value === 'production') {
    return value;
  }

  throw new Error('NODE_ENV must be development, test, or production.');
};

export default registerAs(
  'app',
  (): AppConfig => ({
    nodeEnv: getNodeEnvironment(),
    port: Number(process.env.PORT),
    isProduction: process.env.NODE_ENV === 'production',
    corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  }),
);
