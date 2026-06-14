const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

// Environment validation
const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS',
];

const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

// Only exit in production if critical vars are missing
// In CI/CD, allow missing vars (they'll be set by the platform)
const criticalVars = ['JWT_SECRET', 'MONGODB_URI'];
const missingCritical = criticalVars.filter((varName) => !process.env[varName]);

if (missingCritical.length > 0 && process.env.NODE_ENV === 'production' && !process.env.CI) {
  console.error('❌ Missing critical environment variables:');
  missingCritical.forEach((varName) => console.error(`   - ${varName}`));
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

if (missingEnvVars.length > 0 && !process.env.CI) {
  console.warn('⚠️ Missing optional environment variables:');
  missingEnvVars.forEach((varName) => console.warn(`   - ${varName}`));
  console.warn('Some features may not work correctly.');
}

if (!process.env.CI) {
  console.log('✅ Environment variables validated');
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
// Optional error tracking (Sentry)
let Sentry;
if (process.env.SENTRY_DSN) {
  try {
    Sentry = require('@sentry/node');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (err) {
    console.warn('Sentry not installed or failed to initialize:', err.message);
    Sentry = null;
  }
}
// express-mongo-sanitize is incompatible with Express 5 (req.query is read-only).
// Inline sanitizer that strips $ and . keys from req.body and req.params only.
const sanitizeValue = (val) => {
  if (val && typeof val === 'object' && !Array.isArray(val)) {
    return Object.fromEntries(
      Object.entries(val)
        .filter(([k]) => !k.startsWith('$') && !k.includes('.'))
        .map(([k, v]) => [k, sanitizeValue(v)])
    );
  }
  if (Array.isArray(val)) return val.map(sanitizeValue);
  return val;
};
const mongoSanitize = () => (req, _res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};
const passport = require('./config/passport');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const lostfoundRoutes = require('./routes/lostfound');
const profileRoutes = require('./routes/profile');
const complaintsRoutes = require('./routes/complaints');
const startDeletionCronJob = require('./cron/deleteItems');
const { startKeepAlive } = require('./cron/keepAlive');
const http = require('http');
const { Server } = require('socket.io');
const newsRoutes = require('./routes/news');
const eventsRoutes = require('./routes/events');
const facilitiesRoutes = require('./routes/facilities');
const chatRoutes = require('./routes/chat');
const clubsRoutes = require('./routes/clubs');
const Chat = require('./models/Chat');
const User = require('./models/User');
const aiRoutes = require('./routes/ai');

const app = express();

// Request ID middleware and lightweight structured logger
const requestId = require('./middleware/requestId');
const logger = require('./utils/logger');
app.use(requestId);

// Attach Sentry request handler early if configured
if (Sentry) app.use(Sentry.Handlers.requestHandler());

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // handled separately if needed
  })
);
app.use(mongoSanitize()); // prevent NoSQL injection
app.use(hpp()); // prevent HTTP parameter pollution

// Middleware
// Build allowed origins from env var (comma-separated) plus localhost defaults
const getAllowedOrigins = () => {
  const base = ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5173'];
  const extra = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    : [];
  return [...base, ...extra];
};

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};

app.use(cors(corsOptions));
// Explicitly handle preflight requests for all routes (Express 5 / path-to-regexp v8 syntax)
app.options('/{*path}', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/lostfound', lostfoundRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/facilities', facilitiesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint (used by keep-alive and monitoring services)
app.get('/api/health', (req, res) => {
  const isKeepAlive = req.headers['x-keep-alive'] === 'true';
  const response = {
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  };

  // Include keep-alive stats if this is a keep-alive ping
  if (isKeepAlive) {
    try {
      const { getStats } = require('./cron/keepAlive');
      response.keepAlive = getStats();
    } catch (err) {
      // Keep-alive not initialized yet
    }
  }

  res.status(200).json(response);
});

// Server startup status endpoint
app.get('/api/server-status', (req, res) => {
  res.status(200).json({
    status: 'ready',
    message: 'Server is ready to handle requests',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Global error handling middleware
app.use((err, req, res, _next) => {
  // Structured log with request id
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    requestId: req.requestId,
  });

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
    ...(isDevelopment && { error: err }),
  });
});

// Sentry error handler (must be after all routes and before other error handlers)
if (Sentry) {
  app.use(Sentry.Handlers.errorHandler());
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the cron job after successful DB connection
    startDeletionCronJob();
    // Start keep-alive service to prevent Render from spinning down
    startKeepAlive();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    // Exit the process if DB connection fails
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;

// Create HTTP server and attach Socket.io
const server = http.createServer(app);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = getAllowedOrigins();
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  },
  transports: ['websocket', 'polling'],
  maxHttpBufferSize: 1e6, // 1MB
});

// Make io accessible in routes
app.set('io', io);

// Keep track of online users
const onlineUsers = new Map();

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication error: token required'));
  }

  // Validate JWT_SECRET is configured
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET not configured for Socket.IO authentication');
    return next(new Error('Server configuration error'));
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Verify user still exists in DB
    const user = await User.findById(decoded.userId).select('_id');
    if (!user) {
      return next(new Error('Authentication error: user not found'));
    }
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    console.error('Socket.IO authentication error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return next(new Error('Authentication error: token expired'));
    }
    return next(new Error('Authentication error: invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');

  // User joins the chat
  socket.on('join', async () => {
    try {
      if (!socket.userId) {
        socket.emit('error', 'Authentication required');
        return;
      }

      const authenticatedUser = await User.findById(socket.userId).select('name profilePicture');
      if (!authenticatedUser) {
        socket.emit('error', 'User not found');
        return;
      }

      const userData = {
        _id: authenticatedUser._id,
        name: authenticatedUser.name,
        profilePicture: authenticatedUser.profilePicture,
      };

      onlineUsers.set(socket.id, userData);
      socket.join('global-chat');

      // Send online users list to all clients
      io.emit('online-users', Array.from(onlineUsers.values()));

      // Send last 50 messages to the new user
      const messages = await Chat.find({ isDeleted: false })
        .sort({ timestamp: -1 })
        .limit(50)
        .populate('sender', 'name profilePicture')
        .lean();

      socket.emit('previous-messages', messages.reverse());
    } catch (error) {
      console.error('Error in socket join handler:', error);
      socket.emit('error', 'Failed to join chat');
    }
  });

  // Handle new messages (this is a fallback, main message handling is via HTTP API)
  socket.on('send-message', async (messageData) => {
    try {
      if (!messageData || !messageData.message || !messageData.message.trim()) {
        socket.emit('error', 'Invalid message data');
        return;
      }

      // Always use the authenticated socket.userId, never trust client-provided senderId
      const chatMessage = new Chat({
        sender: socket.userId,
        message: messageData.message,
      });

      await chatMessage.save();

      const populatedMessage = await Chat.findById(chatMessage._id)
        .populate('sender', 'name profilePicture')
        .lean();

      // Emit to all clients except sender to prevent duplicates
      socket.to('global-chat').emit('new-message', populatedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', 'Failed to send message');
    }
  });

  // Handle typing indicator
  socket.on('typing', (userData) => {
    try {
      if (userData) {
        socket.to('global-chat').emit('user-typing', userData);
      }
    } catch (error) {
      console.error('Error handling typing event:', error);
    }
  });

  // Handle stop typing
  socket.on('stop-typing', (userData) => {
    try {
      if (userData) {
        socket.to('global-chat').emit('user-stop-typing', userData);
      }
    } catch (error) {
      console.error('Error handling stop-typing event:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    try {
      const userData = onlineUsers.get(socket.id);
      if (userData) {
        onlineUsers.delete(socket.id);
        io.emit('online-users', Array.from(onlineUsers.values()));
        io.emit('user-left', userData);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log to error tracking service in production
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to error tracking service (e.g., Sentry)
  }
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Log to error tracking service in production
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to error tracking service (e.g., Sentry)
  }
  // Give the server time to finish current requests before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});
