import logger from '../config/logger.js';

/**
 * Error response utilities
 */

/**
 * Creates a standardized error response
 * @param {Object} res - Express response object
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {Object} additionalData - Additional error data
 */
export function sendErrorResponse(res, status, message, code = 'GENERAL_ERROR', additionalData = {}) {
    const errorResponse = {
        error: message,
        code: code,
        timestamp: new Date().toISOString(),
        ...additionalData
    };
    
    logger.error('Error response sent:', {
        status,
        ...errorResponse
    });
    
    res.status(status).json(errorResponse);
}

/**
 * Handles validation errors
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation error messages
 */
export function sendValidationError(res, errors) {
    sendErrorResponse(res, 400, 'Validation failed', 'VALIDATION_ERROR', {
        validationErrors: errors
    });
}

/**
 * Handles not found errors
 * @param {Object} res - Express response object
 * @param {string} resource - The resource that was not found
 */
export function sendNotFoundError(res, resource = 'Resource') {
    sendErrorResponse(res, 404, `${resource} not found`, 'NOT_FOUND');
}

/**
 * Handles database errors
 * @param {Object} res - Express response object
 * @param {Error} error - The database error
 * @param {string} operation - The operation that failed
 */
export function sendDatabaseError(res, error, operation = 'Database operation') {
    logger.error('Database error:', {
        operation,
        message: error.message,
        stack: error.stack,
        code: error.code
    });
    
    sendErrorResponse(res, 500, `${operation} failed`, 'DATABASE_ERROR');
}

/**
 * Handles file upload errors
 * @param {Object} res - Express response object
 * @param {Error} error - The upload error
 */
export function sendUploadError(res, error) {
    let message = 'File upload failed';
    let code = 'UPLOAD_ERROR';
    
    if (error.message.includes('Invalid file type')) {
        code = 'INVALID_FILE_TYPE';
        message = error.message;
    } else if (error.message.includes('ENOENT')) {
        code = 'DIRECTORY_ERROR';
        message = 'Upload directory not accessible';
    } else if (error.message.includes('ENOSPC')) {
        code = 'DISK_SPACE_ERROR';
        message = 'Insufficient disk space';
    }
    
    sendErrorResponse(res, 500, message, code);
}

/**
 * Logs and handles unexpected errors
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 * @param {Object} additionalInfo - Additional information for debugging
 */
export function logError(error, context = 'Unknown', additionalInfo = {}) {
    logger.error('Unexpected error:', {
        context,
        message: error.message,
        stack: error.stack,
        code: error.code,
        timestamp: new Date().toISOString(),
        ...additionalInfo
    });
} 