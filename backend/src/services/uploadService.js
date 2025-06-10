import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import database from '../config/database.js';
import logger from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

class UploadService {
    constructor() {
        this.db = database;
        this.uploadsDir = path.join(process.cwd(), 'uploads');
        this.allowedExtensions = ['.wav', '.mp3', '.ogg', '.m4a', '.webm'];
        this.ensureUploadsDirectory();
    }

    ensureUploadsDirectory() {
        if (!fs.existsSync(this.uploadsDir)) {
            fs.mkdirSync(this.uploadsDir, { recursive: true });
        }
    }

    async ensureDatabase() {
        try {
            if (!this.db.getConnection) {
                await this.db.initialize();
            }
            // Test the connection to make sure it's working
            await this.db.testConnection();
        } catch (error) {
            logger.error('Database connection failed, attempting to reinitialize:', error);
        await this.db.initialize();
        }
    }

    validateFileExtension(filename) {
        const ext = path.extname(filename).toLowerCase();
        if (!this.allowedExtensions.includes(ext)) {
            throw new Error(`Invalid file type. Allowed types: ${this.allowedExtensions.join(', ')}`);
        }
        return ext;
    }

    async saveRecording(file) {
        try {
        await this.ensureDatabase();

            if (!file || !file.buffer) {
                throw new Error('Empty file buffer');
            }

            logger.info('Starting recording save process:', {
                originalName: file.originalname,
                customTitle: file.customTitle,
                bufferSize: file.buffer.length,
                mimeType: file.mimetype
            });

            // Validate file extension - fix the validation check
            try {
                this.validateFileExtension(file.originalname);
            } catch (validationError) {
                logger.error('File validation failed:', validationError.message);
                throw validationError;
            }

            // Generate unique filename with current timestamp in ISO format
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const extension = path.extname(file.originalname);
            const filename = `recording-${timestamp}${extension}`;
            const filepath = path.join(this.uploadsDir, filename);
            
            logger.info('Generated filename:', {
                filename: filename,
                filepath: filepath
            });

            // Write file to disk
            fs.writeFileSync(filepath, file.buffer);
            
            // Verify file was written
            if (!fs.existsSync(filepath)) {
                throw new Error('File was not saved to disk successfully');
            }

            logger.info('File written to disk successfully');

            // Use custom title if provided, otherwise use original filename
            const title = file.customTitle || file.originalname;
            
            if (!title) {
                throw new Error('No title provided for recording');
            }

            // Create ISO timestamp for created_at
            const createdAt = new Date().toISOString();

            logger.info('Preparing database insert:', {
                title: title,
                filename: filename,
                createdAt: createdAt
            });

            // Save to database with created_at field
            return new Promise((resolve, reject) => {
                const query = 'INSERT INTO recording (title, source, created_at) VALUES (?, ?, ?)';
                const params = [title, filename, createdAt];
                
                logger.info('Executing database query:', {
                    query: query,
                    params: params
                });

                // Get database connection
                let dbConnection;
                try {
                    dbConnection = this.db.getConnection();
                    if (!dbConnection) {
                        throw new Error('Database connection is not available');
                    }
                } catch (connectionError) {
                    logger.error('Failed to get database connection:', connectionError);
                    reject(new Error(`Database connection error: ${connectionError.message}`));
                    return;
                }

                dbConnection.run(query, params, function(err) {
                        if (err) {
                        logger.error('Database insert failed with detailed error:', {
                                error: err.message,
                                code: err.code,
                            errno: err.errno,
                                title: title,
                            filename: filename,
                            createdAt: createdAt,
                            query: query,
                            params: params
                            });
                            
                            // Clean up file if database insert fails
                            try {
                                if (fs.existsSync(filepath)) {
                                    fs.unlinkSync(filepath);
                                    logger.info('Cleaned up file after database error:', filepath);
                                }
                            } catch (cleanupError) {
                                logger.error('Failed to cleanup file after database error:', cleanupError);
                            }
                            
                        reject(new Error(`Database error: ${err.message} (Code: ${err.code})`));
                            return;
                        }
                        
                    // Use the correct context for lastID
                    const insertId = this.lastID; // 'this' refers to the sqlite3 statement
                        const result = {
                        id: insertId,
                            title: title,
                        source: filename,
                        created_at: createdAt
                        };
                        
                        logger.info('Recording saved successfully:', result);
                        resolve(result);
                });
            });
        } catch (error) {
            logger.error('Upload service error:', {
                message: error.message,
                stack: error.stack,
                fileInfo: {
                    originalName: file?.originalname,
                    customTitle: file?.customTitle,
                    bufferSize: file?.buffer?.length
                }
            });
            throw error;
        }
    }

    async getAllRecordings() {
        try {
            await this.ensureDatabase();
            return new Promise((resolve, reject) => {
                this.db.getConnection().all('SELECT * FROM recording ORDER BY created_at DESC', [], (err, rows) => {
                    if (err) {
                        logger.error('Error getting recordings:', err);
                        return reject(err);
                    }
                    if (!rows || !Array.isArray(rows)) {
                        return resolve([]);
                    }
                    resolve(rows.map(row => ({
                        id: parseInt(row.id),
                        title: row.title,
                        source: row.source,
                        created_at: row.created_at
                    })));
                });
            });
        } catch (error) {
            logger.error('Error getting recordings:', error);
            return [];
        }
    }

    async getRecordingById(id) {
        try {
            await this.ensureDatabase();
            return new Promise((resolve, reject) => {
                this.db.getConnection().get('SELECT * FROM recording WHERE id = ?', [parseInt(id)], (err, row) => {
                    if (err) {
                        logger.error('Error getting recording:', err);
                        return reject(err);
                    }
                    if (!row || row.id == null) {
                        return resolve(null);
                    }
                    resolve({
                        id: parseInt(row.id),
                        title: row.title,
                        source: row.source,
                        created_at: row.created_at
                    });
                });
            });
        } catch (error) {
            logger.error('Error getting recording:', error);
            throw error;
        }
    }

    async updateRecordingTitle(id, title) {
        try {
            await this.ensureDatabase();
            const dbConnection = this.db.getConnection();
            return new Promise((resolve, reject) => {
                dbConnection.run(
                    'UPDATE recording SET title = ? WHERE id = ?',
                    [title, parseInt(id)],
                    function(err) {
                        if (err) {
                            logger.error('Error updating recording:', err);
                            return reject(err);
                        }
                        if (this.changes === 0) {
                            return resolve(null);
                        }
                        // Fetch the updated row
                        dbConnection.get('SELECT * FROM recording WHERE id = ?', [parseInt(id)], (err, row) => {
                            if (err) {
                                logger.error('Error fetching updated recording:', err);
                                return reject(err);
                            }
                            if (!row || row.id == null) {
                                return resolve(null);
                            }
                            resolve({
                                id: parseInt(row.id),
                                title: row.title,
                                source: row.source,
                                created_at: row.created_at
                            });
                        });
                    }
                );
            });
        } catch (error) {
            logger.error('Error updating recording:', error);
            throw error;
        }
    }

    async deleteRecording(id) {
        try {
            await this.ensureDatabase();
            // First get the recording to delete the file
            const recording = await this.getRecordingById(id);
            if (!recording || recording.id == null) {
                return null;
            }

            // Delete the file if it exists
            const filePath = path.join(this.uploadsDir, recording.source);
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    logger.info(`Deleted file: ${recording.source}`);
                } else {
                    logger.warn(`File not found for deletion: ${recording.source}`);
                }
            } catch (fileErr) {
                logger.error(`Error deleting file: ${recording.source}`, fileErr);
            }

            // Delete from database
            return new Promise((resolve, reject) => {
                this.db.getConnection().run('DELETE FROM recording WHERE id = ?', [parseInt(id)], function(err) {
                    if (err) {
                        logger.error('Error deleting recording:', err);
                        return reject(err);
                    }
                    resolve(parseInt(id));
                });
            });
        } catch (error) {
            logger.error('Error deleting recording:', error);
            throw error;
        }
    }
}

export default UploadService; 