require('dotenv').config({ path: '../../../.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const productRoutes = require('./routes/productRoutes');
const { errorHandler, notFound } = require('../../shared/middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', async (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState;
  const statusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

  res.json({
    status: 'Product Service is running',
    timestamp: new Date(),
    database: statusMap[dbStatus] || 'unknown'
  });
});

// Routes
app.use('/api/products', productRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PRODUCT_SERVICE_PORT || 5003;

// Connect to MongoDB then start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Product Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
