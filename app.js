const express = require('express');
const connectDB = require('./config/db');
const Item = require('./models/Item');
const demoRoutes = require('./routes/demoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Health Check Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'MongoDB Indexing Types API is running.'
  });
});

// API Routes
app.use('/api', demoRoutes);

// Return a consistent client error for malformed JSON request bodies.
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Request body must contain valid JSON.'
    });
  }

  next(error);
});

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Server Initialization
const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Create schema indexes that are missing without dropping unrelated indexes.
  await Item.createIndexes();
  console.log('Mongoose indexes created or already present.');

  app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
  });
};

startServer();
