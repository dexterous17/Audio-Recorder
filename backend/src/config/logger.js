import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Logger {
    constructor() {
        this.initialize();
    }

    /**
     * Initializes the logger with proper configuration
     * @throws {Error} If logger initialization fails
     */
    initialize() {
        try {
            // Ensure logs directory exists
            const logsDir = path.join(__dirname, '../../logs');
            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }

            // Configure log file paths
            const errorLogPath = path.join(logsDir, 'error.log');
            const combinedLogPath = path.join(logsDir, 'combined.log');

            // Create logger instance
            this.logger = winston.createLogger({
                level: process.env.LOG_LEVEL || 'info',
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json()
                ),
                transports: [
                    new winston.transports.File({
                        filename: errorLogPath,
                        level: 'error'
                    }),
                    new winston.transports.File({
                        filename: combinedLogPath
                    })
                ]
            });

            // Add console transport in non-production environments
            if (process.env.NODE_ENV !== 'production') {
                this.logger.add(new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                }));
            }

            // Log successful initialization
            this.info('Logger initialized successfully');
        } catch (error) {
            console.error('Failed to initialize logger:', error);
            throw error;
        }
    }

    /**
     * Logs an info level message
     * @param {string} message - Message to log
     */
    info(message) {
        this.logger.info(message);
    }

    /**
     * Logs an error level message
     * @param {string} message - Message to log
     */
    error(message) {
        this.logger.error(message);
    }

    /**
     * Logs a warning level message
     * @param {string} message - Message to log
     */
    warn(message) {
        this.logger.warn(message);
    }

    /**
     * Logs a debug level message
     * @param {string} message - Message to log
     */
    debug(message) {
        this.logger.debug(message);
    }
}

export default new Logger(); 