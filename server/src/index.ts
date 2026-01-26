import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import characterRoutes from './routes/characterRoutes';
import shopRoutes from './routes/shopRoutes';
import zoneRoutes from './routes/zoneRoutes';
import { BattleService } from './services/BattleService';
import { setupBattleHandlers } from './websocket/battleHandlers';

dotenv.config();

// Server entry point
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // В продакшене заменить на конкретный домен клиента
    methods: ['GET', 'POST']
  }
});

// Services
const battleService = new BattleService(io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/character', characterRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/zone', zoneRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong' 
  });
});

// WebSocket logic
setupBattleHandlers(io, battleService);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Пример обработки событий
  socket.on('join_city', (cityId) => {
    socket.join(cityId);
    console.log(`User ${socket.id} joined city ${cityId}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
