const mongoose = require("mongoose");

const likedSongSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    album: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,
        default: ""
    },
    previewUrl: {
        type: String,
        default: ""
    },
    deezerUrl: {
        type: String,
        default: ""
    },
    duration: {
        type: Number,
        default: 0
    },
    artistImage: {
        type: String,
        default: ""
    },
    albumImage: {
        type: String,
        default: ""
    },
    ranking: {
        type: Number,
        default: 0
    },
    genre: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Avoid duplicate likes by the same user for the same title+artist
likedSongSchema.index({ user: 1, title: 1, artist: 1 }, { unique: true });

module.exports = mongoose.model("LikedSong", likedSongSchema);
