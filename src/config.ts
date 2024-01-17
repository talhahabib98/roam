import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  fare: {
    baseCents: Number(process.env.FARE_BASE_CENTS || 250),
    perKmCents: Number(process.env.FARE_PER_KM_CENTS || 120),
    minimumCents: Number(process.env.FARE_MINIMUM_CENTS || 500),
  },
};
