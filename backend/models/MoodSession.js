const mongoose = require('mongoose');

const songMetadataSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String, required: true },
    coverImage: { type: String, default: '' },
    previewUrl: { type: String, default: '' },
    deezerUrl: { type: String, default: '' },
    duration: { type: Number, default: 0 },
    artistImage: { type: String, default: '' },
    albumImage: { type: String, default: '' },
    ranking: { type: Number, default: 0 },
    genre: { type: String, default: '' }
});

const moodSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    mood: {
        type: String,
        required: [true, 'Please add a mood'],
        lowercase: true,
        trim: true,
        enum: ["happy","sad","angry","calm","energetic","neutral","stressed","excited","lonely","relaxed","romantic","focus"]
    },
    songs: [songMetadataSchema],
    confidence: {
        type: Number,
        default: 1.0,
    },
    explanation: {
        type: String,
        default: '',
    },
    recommendationExplanation: {
        type: String,
        default: '',
    },
    modelVersion: {
        type: String,
        default: 'mock_v1',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('MoodSession', moodSessionSchema);
