const express = require('express');
const router = express.Router();
const {
    createSong,
    getSongsByMood,
} = require('../controllers/songController');

// Route: POST /api/songs
router.post('/', createSong);

// Route: GET /api/songs/mood/:mood
router.get('/mood/:mood', getSongsByMood);

module.exports = router;
