import path from 'path';
import { fileURLToPath } from 'url';
import UploadService from '../services/uploadService.js';
import logger from '../config/logger.js';
import { validateUploadFile, sanitizeString } from '../utils/validation.js';
import { sendErrorResponse, sendValidationError, sendUploadError, logError } from '../utils/errorHandler.js';
import { sendCreatedResponse } from '../utils/responseHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UploadController {
    constructor() {
        this.uploadService = new UploadService();
    }

    async uploadFile(req, res) {
        try {
            // Detailed logging for debugging
            logger.info('Upload request received:', {
                hasFile: !!req.file,
                fileSize: req.file?.size,
                fileType: req.file?.mimetype,
                originalName: req.file?.originalname,
                bufferExists: !!req.file?.buffer,
                bufferLength: req.file?.buffer?.length,
                bodyKeys: Object.keys(req.body || {}),
                body: req.body,
                headers: {
                    contentType: req.headers['content-type'],
                    contentLength: req.headers['content-length']
                }
            });

            // Validate file using utility
            const fileValidation = validateUploadFile(req.file);
            if (!fileValidation.isValid) {
                return sendValidationError(res, fileValidation.errors);
            }

            // Additional buffer validation with detailed logging
            logger.info('File buffer details:', {
                bufferExists: !!req.file.buffer,
                bufferType: typeof req.file.buffer,
                bufferLength: req.file.buffer ? req.file.buffer.length : 'no buffer',
                bufferConstructor: req.file.buffer ? req.file.buffer.constructor.name : 'no buffer'
            });

            // Extract and sanitize metadata from request body
            const title = sanitizeString(req.body.title);
            const customFilename = sanitizeString(req.body.customFilename);
            
            logger.info('Processing upload with metadata:', {
                title: title,
                customFilename: customFilename,
                originalName: req.file.originalname,
                bufferSize: req.file.buffer.length
            });

            // Validate required fields
            if (!title && !req.file.originalname) {
                return sendErrorResponse(res, 400, 'Either title or original filename must be provided', 'MISSING_TITLE');
            }
            
            // Add metadata to file object
            const fileWithMetadata = {
                ...req.file,
                customTitle: title || req.file.originalname,
                customFilename: customFilename
            };

            logger.info('Attempting to save recording with metadata:', {
                customTitle: fileWithMetadata.customTitle,
                customFilename: fileWithMetadata.customFilename,
                fileSize: fileWithMetadata.size,
                bufferSize: fileWithMetadata.buffer.length
            });

            const result = await this.uploadService.saveRecording(fileWithMetadata);
            
            logger.info('Recording saved successfully:', result);
            
            // Send response in format expected by frontend
            res.status(201).json({
                message: 'File uploaded successfully',
                file: result
            });

        } catch (error) {
            // Enhanced error logging
            logError(error, 'Upload Controller - uploadFile', {
                fileInfo: req.file ? {
                    originalname: req.file.originalname,
                    mimetype: req.file.mimetype,
                    size: req.file.size,
                    hasBuffer: !!req.file.buffer,
                    bufferLength: req.file.buffer?.length
                } : 'no file'
            });
            
            // Use error handling utility
            sendUploadError(res, error);
        }
    }
}

export default new UploadController(); 