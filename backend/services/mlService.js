const axios = require("axios")

// Map ML emotions to our system moods
const mapEmotion = (emotion) => {

  const mapping = {
    happy: "happy",
    sad: "sad",
    angry: "angry",
    neutral: "neutral",

    surprise: "excited",
    fear: "stressed",
    disgust: "angry"
  }

  return mapping[emotion] || "neutral"
}

const detectEmotionFromML = async (imageBase64) => {

  try {

    const mlBaseUrl = process.env.ML_SERVICE_URL || "http://localhost:5001";
    const response = await axios.post(
      `${mlBaseUrl}/detect-emotion`,
      { image: imageBase64 }
    )

    const rawEmotion = response.data.emotion
    const confidence = response.data.confidence !== undefined ? response.data.confidence : 0.8
    const mappedEmotion = mapEmotion(rawEmotion)

    return { mood: mappedEmotion, confidence }

  } catch (error) {

    console.error("ML Service Error:", error.message)

    return { mood: "neutral", confidence: 0.5 }

  }

}

module.exports = {
  detectEmotionFromML
}