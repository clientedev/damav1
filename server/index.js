require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initSchema } = require('./db');
const { seedDatabase } = require('./seed');
const { loginHandler, meHandler, changePasswordHandler, authMiddleware } = require('./auth');

// Route modules
const publicRouter = require('./routes/public');
const heroRouter = require('./routes/hero');
const albumsRouter = require('./routes/albums');
const instagramRouter = require('./routes/instagram');
const contentRouter = require('./routes/content');
const settingsRouter = require('./routes/settings');
const mediaRouter = require('./routes/media');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploads statically
const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Auth routes
app.post('/api/auth/login', loginHandler);
app.get('/api/auth/me', authMiddleware, meHandler);
app.post('/api/auth/change-password', authMiddleware, changePasswordHandler);

// Public API
app.use('/api/public', publicRouter);

// Admin API (protected)
app.use('/api/admin/hero', heroRouter);
app.use('/api/admin/albums', albumsRouter);
app.use('/api/admin/instagram', instagramRouter);
app.use('/api/admin/content', contentRouter);
app.use('/api/admin/settings', settingsRouter);
app.use('/api/admin/media', mediaRouter);
app.use('/api/admin/stats', statsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend build if exists (for production)
const clientBuildDir = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildDir));

app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const indexPath = path.join(clientBuildDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Erro interno no servidor.' });
});

// Initialize and start server
async function startServer() {
  try {
    await initSchema();
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 G11 API Server running on http://localhost:${PORT}`);
      console.log(`📂 Uploads served from ${uploadsDir}`);
      console.log(`===============================================`);
    });
  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
}

startServer();
