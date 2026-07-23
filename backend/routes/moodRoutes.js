const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { detectMood, getMoodHistory, deleteMoodSession, aiAnalysis } = require('../controllers/moodController');
// Route: POST /api/mood/detect
// Protected by JWT middleware
router.post('/detect', protect, detectMood);
router.get('/history', protect, getMoodHistory);
router.delete('/:id', protect, deleteMoodSession);
router.post('/ai-analysis', protect, aiAnalysis);

module.exports = router;
