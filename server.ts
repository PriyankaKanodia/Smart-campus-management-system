import express from 'express';
import path from 'path';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { connectDB, isConnected } from './server/config/db.js';
import apiRouter from './server/routes/api.js';
import { setupSocketIO } from './server/socket/chatSocket.js';

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const PORT = 3000;

  // Create upload dir if not existing
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Security Middleware: Helmet (configured for Vite iframe & dev mode compatibility)
  app.use(
    helmet({
      contentSecurityPolicy: false, // Turned off CSP restrictions so Vite dev overlay and inline styles work smoothly
      crossOriginEmbedderPolicy: false
    })
  );

  // Security Middleware: Rate Limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per windowMs
    message: { message: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api', apiLimiter);

  // Enable CORS and JSON Parsing
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static serving for chat uploads
  app.use('/uploads', express.static(uploadsDir));

  // Connect to Database
  await connectDB();

  // Socket.io Setup
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
  setupSocketIO(io);

  // Register Backend REST APIs
  app.use('/api', apiRouter);

  // Health Check Endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      databaseConnected: isConnected(),
      security: {
        helmet: true,
        rateLimiter: true,
        socketServer: true
      }
    });
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    console.log('⚡ Starting development server with Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('📦 Serving production static bundle...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Smart Campus Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Fatal Server Boot Error:', error);
});

