import logger from '../config/logger.js';

const errorHandler = (err, req, res, next) => {
    logger.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
};

export default errorHandler; 