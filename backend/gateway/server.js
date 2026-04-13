require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Security middleware - configure to allow cross-origin resources
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});

app.use('/api/', (req, res, next) => {
    next()
});

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Service URLs
const services = {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
    user: process.env.USER_SERVICE_URL || 'http://localhost:5002',
    product: process.env.PRODUCT_SERVICE_URL || 'http://localhost:5003',
    cartOrder: process.env.CART_ORDER_SERVICE_URL || 'http://localhost:5004',
    payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:5005'
};

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'API Gateway is running',
        timestamp: new Date(),
        services: {
            auth: `${services.auth}/health`,
            user: `${services.user}/health`,
            product: `${services.product}/health`,
            cartOrder: `${services.cartOrder}/health`,
            payment: `${services.payment}/health`
        }
    });
});

// Route: Product Service - Use http-proxy-middleware to properly handle multipart form data
app.use('/api/products', createProxyMiddleware({
    target: services.product,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl, // Preserve the full path including /api/products
    onError: (err, req, res) => {
        res.status(503).json({
            success: false,
            message: 'Product service unavailable',
            error: err.message
        });
    }
}));

// Serve product images via proxy
app.use('/uploads', createProxyMiddleware({
    target: services.product,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl, // Preserve the full path including /uploads
    onProxyRes: (proxyRes, req, res) => {
        // Add CORS headers for images
        proxyRes.headers['Access-Control-Allow-Origin'] = process.env.FRONTEND_URL || 'http://localhost:3000';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
        proxyRes.headers['Cross-Origin-Resource-Policy'] = 'cross-origin';
    },
    onError: (err, req, res) => {
        res.status(404).json({ success: false, message: 'Image not found' });
    }
}));

// Body parser - Apply AFTER proxy routes to avoid breaking multipart streams
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Proxy middleware for JSON-based services
const proxyRequest = async (req, res, serviceUrl) => {
    try {
        const url = `${serviceUrl}${req.originalUrl}`;
        const method = req.method.toLowerCase();

        const config = {
            method: method,
            url: url,
            headers: {
                ...req.headers,
                host: new URL(serviceUrl).host
            },
            data: req.body
        };

        // Remove content-length header to avoid conflicts
        delete config.headers['content-length'];

        const response = await axios(config);

        // Forward response
        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            // Service responded with error
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            // No response from service
            res.status(503).json({
                success: false,
                message: 'Service unavailable',
                error: error.message
            });
        } else {
            // Other errors
            res.status(500).json({
                success: false,
                message: 'Internal gateway error',
                error: error.message
            });
        }
    }
};

// Route: Auth Service
app.use('/api/auth', (req, res) => {
    proxyRequest(req, res, services.auth);
});

// Route: User Service
app.use('/api/users', (req, res) => {
    proxyRequest(req, res, services.user);
});

// Route: Cart Service
app.use('/api/cart', (req, res) => {
    proxyRequest(req, res, services.cartOrder);
});

// Route: Order Service
app.use('/api/orders', (req, res) => {
    proxyRequest(req, res, services.cartOrder);
});

// Route: Payment Service
app.use('/api/payments', (req, res) => {
    proxyRequest(req, res, services.payment);
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Gateway error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.GATEWAY_PORT || 5000;

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log('Routing to services:');
    console.log(`  Auth: ${services.auth}`);
    console.log(`  User: ${services.user}`);
    console.log(`  Product: ${services.product}`);
    console.log(`  Cart/Order: ${services.cartOrder}`);
    console.log(`  Payment: ${services.payment}`);
});
