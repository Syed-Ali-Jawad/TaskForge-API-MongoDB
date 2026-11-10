import dotenv from "dotenv";
dotenv.config();

type ENV = {
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  seedPassword: string;
  vercel: boolean;
  mongoUri: string;
};

const env: ENV = {
  port: Number(process.env.PORT!),
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN!,
  seedPassword: process.env.SEED_PASSWORD!,
  vercel: !!process.env.VERCEL || false,
  mongoUri: process.env.MONGO_URI!,
};

export default env;
