import express from 'express';
import uploadController from '../controllers/uploadController.js';
import recordingsController from '../controllers/recordingsController.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Upload Operations (Create new recordings)
router.post('/upload', upload.single('audio'), uploadController.uploadFile.bind(uploadController));

// Recordings CRUD Operations (Manage existing recordings)
router.get('/recordings', recordingsController.getAllRecordings.bind(recordingsController));
router.get('/recordings/:id', recordingsController.getRecordingById.bind(recordingsController));
router.patch('/recordings/:id', recordingsController.updateRecordingTitle.bind(recordingsController));
router.delete('/recordings/:id', recordingsController.deleteRecording.bind(recordingsController));

export default router; 