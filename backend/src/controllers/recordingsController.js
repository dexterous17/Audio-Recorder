import UploadService from '../services/uploadService.js';
import logger from '../config/logger.js';
import { isValidId, isValidTitle, sanitizeString } from '../utils/validation.js';
import { sendErrorResponse, sendNotFoundError, sendDatabaseError, sendValidationError } from '../utils/errorHandler.js';
import { sendListResponse, sendItemResponse, sendUpdateResponse, sendDeleteResponse } from '../utils/responseHelper.js';

class RecordingsController {
    constructor() {
        this.uploadService = new UploadService();
    }

    async getAllRecordings(req, res) {
        try {
            logger.info('Fetching all recordings');
            
            const recordings = await this.uploadService.getAllRecordings();
            
            logger.info('Recordings fetched successfully:', {
                count: Array.isArray(recordings) ? recordings.length : 0
            });
            
            sendListResponse(res, recordings, {}, 'Recordings retrieved successfully');
        } catch (error) {
            sendDatabaseError(res, error, 'Fetch recordings');
        }
    }

    async getRecordingById(req, res) {
        try {
            const recordingId = req.params.id;
            
            logger.info('Fetching recording by ID:', {
                recordingId: recordingId
            });

            // Validate ID format using utility
            if (!isValidId(recordingId)) {
                return sendValidationError(res, ['Invalid recording ID']);
            }
            
            const recording = await this.uploadService.getRecordingById(recordingId);
            
            if (!recording || recording.id == null) {
                return sendNotFoundError(res, 'Recording');
            }
            
            logger.info('Recording fetched successfully:', {
                recordingId: recording.id,
                title: recording.title
            });
            
            sendItemResponse(res, recording, 'Recording retrieved successfully');
        } catch (error) {
            sendDatabaseError(res, error, 'Fetch recording by ID');
        }
    }

    async updateRecordingTitle(req, res) {
        try {
            const recordingId = req.params.id;
            const title = req.body.title;
            
            logger.info('Updating recording title:', {
                recordingId: recordingId,
                newTitle: title
            });

            // Validate inputs using utilities
            const validationErrors = [];
            
            if (!isValidId(recordingId)) {
                validationErrors.push('Invalid recording ID');
            }
            
            if (!isValidTitle(title)) {
                validationErrors.push('Title is required and must be a non-empty string');
            }
            
            if (validationErrors.length > 0) {
                return sendValidationError(res, validationErrors);
            }

            const trimmedTitle = sanitizeString(title);
            const updated = await this.uploadService.updateRecordingTitle(recordingId, trimmedTitle);
            
            if (!updated || updated.id == null) {
                return sendNotFoundError(res, 'Recording');
            }
            
            logger.info('Recording title updated successfully:', {
                recordingId: updated.id,
                newTitle: updated.title
            });
            
            sendUpdateResponse(res, updated, 'Recording updated successfully');
        } catch (error) {
            sendDatabaseError(res, error, 'Update recording title');
        }
    }

    async deleteRecording(req, res) {
        try {
            const recordingId = req.params.id;
            
            logger.info('Deleting recording:', {
                recordingId: recordingId
            });

            // Validate ID format using utility
            if (!isValidId(recordingId)) {
                return sendValidationError(res, ['Invalid recording ID']);
            }

            const deletedId = await this.uploadService.deleteRecording(recordingId);
            
            if (!deletedId || isNaN(deletedId)) {
                return sendNotFoundError(res, 'Recording');
            }
            
            logger.info('Recording deleted successfully:', {
                deletedId: deletedId
            });
            
            sendDeleteResponse(res, recordingId, 'Recording deleted successfully');
        } catch (error) {
            sendDatabaseError(res, error, 'Delete recording');
        }
    }
}

export default new RecordingsController(); 