const { detectEmotionFromML } = require("../services/mlService");
const Song = require("../models/Song");
const MoodSession = require("../models/MoodSession");

const detectCameraMood = async (req, res) => {

  try {

    const { image } = req.body;

    const emotion = await detectEmotionFromML(image);

    const songs = await Song.find({ mood: emotion });

    // save history
    const session = await MoodSession.create({
      user: req.user._id,
      mood: emotion,
      songs: songs.map(s => s._id),
      modelVersion: "camera_v1"
    });

    res.json({
      mood: emotion,
      recommendedSongs: songs
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Camera detection failed"
    });

  }

};

module.exports = { detectCameraMood };