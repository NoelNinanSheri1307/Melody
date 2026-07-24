const { detectEmotionFromML } = require("../services/mlService");
const { getRecommendations, getRecommendationExplanation } = require("../services/recommendationService");
const MoodSession = require("../models/MoodSession");

const detectCameraMood = async (req, res) => {

  try {

    const { image } = req.body;

    const { mood, confidence } = await detectEmotionFromML(image);

    // Fetch dynamic songs matching the emotion
    const songs = await getRecommendations(mood);
    const recExplanation = getRecommendationExplanation(mood);
    const explanation = `Biometric expression match with ${Math.round(confidence * 100)}% classification confidence.`;

    // save history
    const session = await MoodSession.create({
      user: req.user._id,
      mood: mood,
      songs: songs,
      confidence: confidence,
      explanation: explanation,
      recommendationExplanation: recExplanation,
      modelVersion: "camera_v1"
    });

    res.json({
      mood: mood,
      confidence: confidence,
      explanation: explanation,
      recommendationExplanation: recExplanation,
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