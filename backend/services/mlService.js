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

    const response = await axios.post(
      "http://localhost:5001/detect-emotion",
      { image: imageBase64 }
    )

    const rawEmotion = response.data.emotion

    const mappedEmotion = mapEmotion(rawEmotion)

    return mappedEmotion

  } catch (error) {

    console.error("ML Service Error:", error.message)

    return "neutral"

  }

}

module.exports = {
  detectEmotionFromML
}