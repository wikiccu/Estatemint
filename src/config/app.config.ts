import { registerAs } from '@nestjs/config';

export type NodeEnvironment = 'development' | 'test' | 'production';

export interface AppConfig {
  nodeEnv: NodeEnvironment;
  port: number;
  isProduction: boolean;
}

export default registerAs(
  'app',
  (): AppConfig => ({
    nodeEnv: process.env.NODE_ENV as NodeEnvironment,
    port: Number(process.env.PORT),
    isProduction: process.env.NODE_ENV === 'production',
  }),
);
