const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { detectMood, getMoodHistory, getSessionSongs, deleteMoodSession, aiAnalysis, hybridAnalysis, getMoodInsights } = require('../controllers/moodController');
// Route: POST /api/mood/detect
// Protected by JWT middleware
router.post('/detect', protect, detectMood);
router.get('/history', protect, getMoodHistory);
router.get('/history/:id/songs', protect, getSessionSongs);
router.delete('/:id', protect, deleteMoodSession);
router.post('/ai-analysis', protect, aiAnalysis);
router.post('/hybrid', protect, hybridAnalysis);
router.get('/insights', protect, getMoodInsights);

module.exports = router;
