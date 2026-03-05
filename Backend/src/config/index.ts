import dotenv from "dotenv";
dotenv.config();

export const PORT: number = 
    process.env.PORT ? parseInt(process.env.PORT) : 3001;
export const MONGODB_URI: string = 
    process.env.MONGODB_URI || 'mongodb://localhost:27017/35a_backend';
export const JWT_SECRET: string = 
    process.env.JWT_SECRET || 'default_secret';

export const CLIENT_URL: string =
    process.env.CLIENT_URL || 'http://localhost:3000';

export const SMTP_HOST: string = process.env.SMTP_HOST || '';
export const SMTP_PORT: number = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
export const SMTP_USER: string = process.env.SMTP_USER || '';
export const SMTP_PASS: string = process.env.SMTP_PASS || '';
export const SMTP_FROM: string = process.env.SMTP_FROM || 'no-reply@matchaura.com';
