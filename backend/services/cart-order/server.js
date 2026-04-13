require('dotenv').config({ path: '../../../.env' });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFound } = require('../../shared/middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'Cart/Order Service is running', timestamp: new Date() });
});

// Routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.CART_ORDER_SERVICE_PORT || 5004;

// Connect to MongoDB then start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Cart/Order Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
