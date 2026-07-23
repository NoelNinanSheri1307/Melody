const MoodSession = require('../models/MoodSession');
const Song = require('../models/Song');
const Groq = require("groq-sdk");
const axios = require("axios");

// @desc    Detect mood and recommend songs
// @route   POST /api/mood/detect
// @access  Private
const detectMood = async (req, res) => {
    try {
        const { mood } = req.body;

        if (!mood) {
            return res.status(400).json({ message: 'Please provide a mood' });
        }

        const normalizedMood = mood.toLowerCase();

        // Fetch songs matching the mood
        const recommendedSongs = await Song.find({ mood: normalizedMood });

        // Save the mood session
        const moodSession = await MoodSession.create({
            user: req.user._id,
            mood: normalizedMood,
            songs: recommendedSongs.map((song) => song._id),
            modelVersion: 'mock_v1',
        });

        res.status(201).json({
            mood: moodSession.mood,
            modelVersion: moodSession.modelVersion,
            recommendedSongs,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
// @desc    Get mood history for logged in user
// @route   GET /api/mood/history
// @access  Private
const getMoodHistory = async (req, res) => {
    try {
        const sessions = await MoodSession.find({ user: req.user._id })
            .populate('songs')
            .sort({ createdAt: -1 });

        res.status(200).json(sessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a mood session
// @route   DELETE /api/mood/history/:id
// @access  Private
const deleteMoodSession = async (req, res) => {
    try {
        const session = await MoodSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Check user ownership
        if (session.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await MoodSession.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Session removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const aiAnalysis = async (req, res) => {
    const allowedMoods = ["happy", "sad", "angry", "calm", "energetic", "neutral"];

    let detectedMood;
    let modelVersion = "groq_llama_v1";

    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: "Please provide text input" });
        }

        const aiResponse = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "You are a mood classifier. Respond with only one word: happy, sad, angry, calm, energetic, or neutral."
                },
                {
                    role: "user",
                    content: text
                }
            ],
            temperature: 0,
            max_tokens: 5,
        });

        detectedMood = aiResponse.choices[0].message.content
            .trim()
            .toLowerCase()
            .replace(/[^a-z]/g, "");

        if (!allowedMoods.includes(detectedMood)) {
            throw new Error("Invalid mood");
        }

    } 
    catch (error){
        console.log("Groq failed, falling back to BERT:", error.message);
        try {
            const { text } = req.body;

            const bertResponse = await axios.post(
                "http://localhost:8002/predict",
                { text }
            );

            detectedMood = bertResponse.data.emotion.toLowerCase();
            modelVersion = "bert_fallback_v1";

            if (!allowedMoods.includes(detectedMood)) {
                return res.status(500).json({ message: "BERT returned invalid mood: " + detectedMood });
            }

        } 
        catch (bertError){
            console.error("BERT Error:", bertError.message || bertError);
            console.error("BERT Error Code:", bertError.code);
            return res.status(500).json({ message: "Both Groq and BERT failed", error: bertError.message || "Unknown BERT error" });
        }
    }

    try {
        const recommendedSongs = await Song.find({ mood: detectedMood });

        const moodSession = await MoodSession.create({
            user: req.user._id,
            mood: detectedMood,
            songs: recommendedSongs.map(song => song._id),
            modelVersion,
        });

        return res.status(201).json({
            mood: detectedMood,
            modelVersion,
            recommendedSongs,
        });

    } 
    catch (dbError){
        console.error("Database Error:", dbError.message);
        return res.status(500).json({ message: "Database Error", error: dbError.message });
    }
};


module.exports = {
    detectMood,
    getMoodHistory,
    deleteMoodSession,
    aiAnalysis,
};
