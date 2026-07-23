const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a song title'],
        trim: true,
    },
    artist: {
        type: String,
        required: [true, 'Please add an artist'],
        trim: true,
    },
    genre: {
        type: String,
        required: [true, 'Please add a genre'],
        trim: true,
    },
    mood: {
    type: String,
    required: [true, 'Please add a mood'],
    lowercase: true,
    trim: true,
    enum: ["happy","sad","angry","calm","energetic","neutral"]
    },
    coverImage: {
        type: String,
        default: '',
    },
    audioUrl: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Song', songSchema);
