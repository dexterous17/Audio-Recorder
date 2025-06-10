import logger from '../config/logger.js';

/**
 * Response helper utilities for standardized API responses
 */

/**
 * Sends a successful response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} status - HTTP status code (default: 200)
 */
export function sendSuccessResponse(res, data = null, message = 'Success', status = 200) {
    const response = {
        success: true,
        message,
        timestamp: new Date().toISOString()
    };
    
    if (data !== null) {
        response.data = data;
    }
    
    logger.info('Success response sent:', {
        status,
        message,
        hasData: data !== null
    });
    
    res.status(status).json(response);
}

/**
 * Sends a successful response for created resources
 * @param {Object} res - Express response object
 * @param {Object} data - Created resource data
 * @param {string} message - Success message
 */
export function sendCreatedResponse(res, data, message = 'Resource created successfully') {
    sendSuccessResponse(res, data, message, 201);
}

/**
 * Sends a successful response for operations without data
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 */
export function sendNoContentResponse(res, message = 'Operation completed successfully') {
    logger.info('No content response sent:', { message });
    res.status(204).json({
        success: true,
        message,
        timestamp: new Date().toISOString()
    });
}

/**
 * Sends a successful response for list operations
 * @param {Object} res - Express response object
 * @param {Array} items - Array of items
 * @param {Object} meta - Metadata (pagination, count, etc.)
 * @param {string} message - Success message
 */
export function sendListResponse(res, items = [], meta = {}, message = 'Data retrieved successfully') {
    const data = {
        items: Array.isArray(items) ? items : [],
        count: Array.isArray(items) ? items.length : 0,
        ...meta
    };
    
    sendSuccessResponse(res, data, message);
}

/**
 * Sends a successful response for single item operations
 * @param {Object} res - Express response object
 * @param {Object} item - Single item data
 * @param {string} message - Success message
 */
export function sendItemResponse(res, item, message = 'Item retrieved successfully') {
    sendSuccessResponse(res, item, message);
}

/**
 * Sends a successful response for update operations
 * @param {Object} res - Express response object
 * @param {Object} item - Updated item data
 * @param {string} message - Success message
 */
export function sendUpdateResponse(res, item, message = 'Item updated successfully') {
    sendSuccessResponse(res, item, message);
}

/**
 * Sends a successful response for delete operations
 * @param {Object} res - Express response object
 * @param {string|number} id - ID of deleted item
 * @param {string} message - Success message
 */
export function sendDeleteResponse(res, id, message = 'Item deleted successfully') {
    sendSuccessResponse(res, { id }, message);
} 