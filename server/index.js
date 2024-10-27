import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';

import authrouter from './routes/auth.route.js';
import createTickets from './routes/create_ticket.route.js'; 
import profileRoute from './routes/profile_data.route.js';
import marketRoute from './routes/market.route.js';
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
  app.use(cors({
    origin: true, 
    credentials: true, 
  }));
  
app.use(cookieParser())
app.use('/public', express.static(path.join(process.cwd(), 'public')));

app.use('/api/auth', authrouter);
app.use('/api/createTickets', createTickets);
app.use('/api/profile', profileRoute);
app.use('/api/market',marketRoute);


app.use((err, req, res, next) => {
    res.status(500).send('Something broke!');
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log('Server is running');
  });
