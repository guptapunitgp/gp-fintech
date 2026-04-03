import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { env } from './config/env.js';

const app = express();

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'https://gp-fintech.vercel.app',
];

const allowedOrigins = new Set([
  ...defaultAllowedOrigins,
  ...(env.clientUrls || []),
].map((origin) => origin.replace(/\/$/, '')));

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = origin.replace(/\/$/, '');

  if (allowedOrigins.has(normalizedOrigin)) {
    return true;
  }

  return /^https:\/\/gp-fintech(?:-[a-z0-9-]+)*\.vercel\.app$/i.test(normalizedOrigin);
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());
app.use(morgan('dev'));

app.all("/", (req, res) => {
  res.send("🚀 Finance API is running");
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/user', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stocks', stockRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

export default app;
