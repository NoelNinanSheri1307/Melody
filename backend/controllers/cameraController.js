const { detectEmotionFromML } = require("../services/mlService");
const { getRecommendations } = require("../services/recommendationService");
const MoodSession = require("../models/MoodSession");

const detectCameraMood = async (req, res) => {

  try {

    const { image } = req.body;

    const emotion = await detectEmotionFromML(image);

    // Fetch dynamic songs from Deezer matching the emotion
    const songs = await getRecommendations(emotion);

    // save history
    const session = await MoodSession.create({
      user: req.user._id,
      mood: emotion,
      songs: songs,
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