import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Database {
    constructor() {
        this.db = null;
        this.dbPath = path.join(__dirname, '../../data/database-new.sqlite');
        this.dataDir = path.join(__dirname, '../../data');
        this.uploadsDir = path.join(__dirname, '../../uploads');
    }

    /**
     * Ensures required directories exist
     */
    ensureDirectories() {
        try {
            // Create data directory if it doesn't exist
            if (!fs.existsSync(this.dataDir)) {
                fs.mkdirSync(this.dataDir, { recursive: true });
                logger.info('Created data directory:', this.dataDir);
            }

            // Create uploads directory if it doesn't exist
            if (!fs.existsSync(this.uploadsDir)) {
                fs.mkdirSync(this.uploadsDir, { recursive: true });
                logger.info('Created uploads directory:', this.uploadsDir);
            }

            logger.info('Required directories verified/created');
        } catch (error) {
            logger.error('Error creating directories:', error);
            throw new Error(`Failed to create required directories: ${error.message}`);
        }
    }

    /**
     * Initializes the database connection and creates tables if needed
     */
    async initialize() {
        try {
            // Ensure directories exist first
            this.ensureDirectories();
            
            // Check if database file exists
            const dbExists = fs.existsSync(this.dbPath);
            logger.info('Database file exists:', dbExists);
            
            // Create database connection
            this.db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
                if (err) {
                    logger.error('Error opening database:', err);
                    throw err;
                }
                logger.info('Connected to SQLite database:', this.dbPath);
            });

            // Enable WAL mode for better concurrency
            this.db.run('PRAGMA journal_mode = WAL;', (err) => {
                if (err) {
                    logger.error('Error setting WAL mode:', err);
                } else {
                    logger.info('WAL mode enabled for database');
                }
            });

            // Set busy timeout to handle locks better
            this.db.run('PRAGMA busy_timeout = 30000;', (err) => {
                if (err) {
                    logger.error('Error setting busy timeout:', err);
                } else {
                    logger.info('Busy timeout set to 30 seconds');
                }
            });

            // Create tables if they don't exist
            await this.createTables();

            logger.info('Database initialization completed successfully');
            return this.db;
        } catch (error) {
            logger.error('Database initialization failed:', error);
            throw new Error(`Database initialization failed: ${error.message}`);
        }
    }

    /**
     * Creates the recording table if it doesn't exist
     */
    async createTables() {
        return new Promise((resolve, reject) => {
            const createTableSQL = `
                CREATE TABLE IF NOT EXISTS recording (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    source TEXT NOT NULL,
                    title TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
            `;

            this.db.run(createTableSQL, function(err) {
                if (err) {
                    logger.error('Error creating recording table:', err);
                    reject(err);
                    return;
                }
                
                logger.info('Recording table created or verified successfully');
                resolve();
            });
        });
    }

    /**
     * Gets the database connection
     */
    getConnection() {
        if (!this.db) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return this.db;
    }

    /**
     * Closes the database connection
     */
    async close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        logger.error('Error closing database:', err);
                        reject(err);
                        return;
                    }
                    logger.info('Database connection closed');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * Tests the database connection and table structure
     */
    async testConnection() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            this.db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='recording'", (err, row) => {
                if (err) {
                    logger.error('Error testing database connection:', err);
                    reject(err);
                    return;
                }

                if (row) {
                    logger.info('Database connection test successful - recording table exists');
                    resolve(true);
                } else {
                    reject(new Error('Recording table does not exist'));
                }
            });
        });
    }
}

// Create singleton instance
const database = new Database();

export default database; 