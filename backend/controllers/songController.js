const Song = require('../models/Song');

// @desc    Create a new song
// @route   POST /api/songs
// @access  Public (or Private if you add auth middleware later)
const createSong = async (req, res) => {
    try {
        const { title, artist, genre, mood, coverImage, audioUrl } = req.body;

        if (!title || !artist || !genre || !mood) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const song = await Song.create({
            title,
            artist,
            genre,
            mood: mood.toLowerCase(), // Store as lowercase for easier searching
            coverImage,
            audioUrl,
        });

        res.status(201).json(song);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get songs by mood
// @route   GET /api/songs/mood/:mood
// @access  Public
const getSongsByMood = async (req, res) => {
    try {
        const moodQuery = req.params.mood.toLowerCase();

        // Find songs where mood matches (case-insensitive search if they weren't lowercase, 
        // but we normalized them on save for performance)
        const songs = await Song.find({ mood: moodQuery });

        if (!songs || songs.length === 0) {
            return res.status(404).json({ message: `No songs found for mood: ${req.params.mood}` });
        }

        res.status(200).json(songs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createSong,
    getSongsByMood,
};
