/**
 * Validation utilities for input validation
 */

/**
 * Validates if a value is a valid positive integer ID
 * @param {string|number} id - The ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidId(id) {
    if (!id) return false;
    const numId = Number(id);
    return !isNaN(numId) && numId > 0 && Number.isInteger(numId);
}

/**
 * Validates if a title is valid (non-empty string)
 * @param {string} title - The title to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidTitle(title) {
    return typeof title === 'string' && title.trim().length > 0;
}

/**
 * Validates if a file buffer exists and has content
 * @param {Buffer} buffer - The buffer to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidFileBuffer(buffer) {
    return buffer && buffer instanceof Buffer && buffer.length > 0;
}

/**
 * Validates if a file has required properties
 * @param {Object} file - The file object to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export function validateUploadFile(file) {
    const errors = [];
    
    if (!file) {
        errors.push('No file provided');
        return { isValid: false, errors };
    }
    
    if (!file.originalname) {
        errors.push('File must have an original name');
    }
    
    if (!file.buffer || !isValidFileBuffer(file.buffer)) {
        errors.push('File buffer is missing or empty');
    }
    
    if (!file.mimetype || !file.mimetype.includes('audio')) {
        errors.push('File must be an audio file');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Sanitizes and trims a string
 * @param {string} str - The string to sanitize
 * @returns {string} - The sanitized string
 */
export function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.trim();
}

/**
 * Validates audio file MIME types
 * @param {string} mimetype - The MIME type to validate
 * @returns {boolean} - True if valid audio type, false otherwise
 */
export function isValidAudioMimeType(mimetype) {
    const validTypes = [
        'audio/wav',
        'audio/webm',
        'audio/ogg',
        'audio/mp3',
        'audio/mpeg',
        'audio/mp4',
        'audio/m4a'
    ];
    
    return validTypes.includes(mimetype);
} 