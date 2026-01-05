import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { PORT } from './config';
import { connectDatabase } from './database/mongodb';

dotenv.config();
// Yo bhanda tala .env chalauna milcha
console.log(process.env.PORT); 
import authRoutes from './routes/auth.route';
import adminUserRouter from './routes/admin/user.route';
const app: Application = express();

app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminUserRouter);
async function start(){
    await connectDatabase();
        
    app.listen(PORT, () => {
        console.log(`Server: http://localhost:${PORT}`);
    });
}

start().catch((error) => console.log(error));
