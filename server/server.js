import express, { json, urlencoded } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import http from 'http'; 

config();
connectDB();
const app = express();

// Create HTTP server
const httpServer = createServer(app);

// Setup Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
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
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      articles: '/api/articles'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);

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

// Socket.io connection handling
const userSockets = new Map();  

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // User joins with their ID
  socket.on('join', (userId) => {
    userSockets.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      userSockets.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    }
  });
});

// Export io and userSockets for use in controllers
export { io, userSockets };

const PORT = process.env.PORT || 5000;

/* Keep Alive Function */
const keepAlive = () => {
  const KEEPALIVE_URL = process.env.KEEPALIVE_URL;
  if (KEEPALIVE_URL) {
    // Ping every 10 minutes
    setInterval(() => {
      console.log('--- Pinging server for keep-alive ---');
      http.get(KEEPALIVE_URL, (res) => {
        if (res.statusCode === 200) {
          console.log(`Keep-alive successful: Status ${res.statusCode}`);
        } else {
          console.error(`Keep-alive failed: Status ${res.statusCode}`);
        }
      }).on('error', (err) => {
        console.error('Keep-alive error:', err.message);
      });
    }, 600000); 
  } else {
    console.log('KEEPALIVE_URL not set. Keep-alive function is disabled.');
  }
};

httpServer.listen(PORT, () => {
  console.log(`Newsroom CMS Server Started: http://localhost:${PORT}`);
  console.log("Socket.io is ready!");
  
  // Start the keep-alive function after the server starts listening
  keepAlive();
});

export default app;