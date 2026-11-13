import dotenv from 'dotenv';
dotenv.config();

const required = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'WHATSAPP_NUMBER',
  'UPLOAD_DIR',
  'CORS_ORIGIN',
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  NODE_ENV: process.env['NODE_ENV'] as string,
  PORT: parseInt(process.env['PORT'] as string, 10),
  DATABASE_URL: process.env['DATABASE_URL'] as string,
  JWT_SECRET: process.env['JWT_SECRET'] as string,
  JWT_EXPIRES_IN: process.env['JWT_EXPIRES_IN'] as string,
  WHATSAPP_NUMBER: process.env['WHATSAPP_NUMBER'] as string,
  UPLOAD_DIR: process.env['UPLOAD_DIR'] as string,
  MAX_FILE_SIZE: parseInt(process.env['MAX_FILE_SIZE'] ?? '5242880', 10),
  CORS_ORIGIN: process.env['CORS_ORIGIN'] as string,
};
