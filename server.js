const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON request bodies for optional API extensions
app.use(express.json());

// Basic CORS headers so Vite dev server can communicate with Express if needed
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Campus Lost and Found Portal is running'
  });
});

// Serve static assets from /public (maps /css/*, /js/*, /assets/*)
app.use(express.static(path.join(__dirname, 'public')));

// Serve subpages from /pages (maps /pages/*.html)
app.use('/pages', express.static(path.join(__dirname, 'pages')));

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

app.listen(PORT, () => {
  console.log(`Campus Lost & Found Express server running at http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});
