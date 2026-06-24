import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  url: string;
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
}

export default registerAs(
  'database',
  (): DatabaseConfig => ({
    url: process.env.DATABASE_URL as string,
    host: process.env.DATABASE_HOST as string,
    port: Number(process.env.DATABASE_PORT),
    name: process.env.DATABASE_NAME as string,
    user: process.env.DATABASE_USER as string,
    password: process.env.DATABASE_PASSWORD as string,
  }),
);
