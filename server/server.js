import express, { json, urlencoded } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

config();
connectDB();
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(json());
app.use(urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Newsroom CMS API',
    status: 'Server is running successfully',
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Newsroom CMS Server Started: http://localhost:${PORT}`);
});

export default app;