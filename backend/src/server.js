import express from 'express';
import cors from 'cors';
import path from 'path';
import logger from './config/logger.js';
import database from './config/database.js';
import uploadRoutes from './routes/uploadRoutes.js';
import errorHandler from './middleware/errorMiddleware.js';

const app = express();
const port = process.env.PORT || 3000;

// Initialize database and start server
async function startServer() {
    try {
        // Initialize database first
        logger.info('Initializing database...');
        await database.initialize();
        await database.testConnection();
        logger.info('Database initialized successfully');

        // Middleware
        app.use(cors());
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        // Routes
        app.use('/api', uploadRoutes);

        // Serve uploaded files
        app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

        // Error handling
        app.use(errorHandler);

        // Start server
        app.listen(port, () => {
            logger.info(`Server running on port ${port}`);
            logger.info('Application started successfully');
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    try {
        await database.close();
        logger.info('Database connection closed');
    } catch (error) {
        logger.error('Error closing database:', error);
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    try {
        await database.close();
        logger.info('Database connection closed');
    } catch (error) {
        logger.error('Error closing database:', error);
    }
    process.exit(0);
});

// Start the application
startServer();

export default app; 