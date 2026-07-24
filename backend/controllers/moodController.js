const MoodSession = require('../models/MoodSession');
const { getRecommendations } = require('../services/recommendationService');
const Groq = require("groq-sdk");

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

        // Fetch dynamic songs from Deezer matching the mood
        const recommendedSongs = await getRecommendations(normalizedMood);

        // Save the mood session
        const moodSession = await MoodSession.create({
            user: req.user._id,
            mood: normalizedMood,
            songs: recommendedSongs,
            modelVersion: 'deezer_v1',
        });

        res.status(201).json({
            mood: moodSession.mood,
            modelVersion: moodSession.modelVersion,
            recommendedSongs,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
// @desc    Get mood history for logged in user (excluding songs)
// @route   GET /api/mood/history
// @access  Private
const getMoodHistory = async (req, res) => {
    try {
        const sessions = await MoodSession.find({ user: req.user._id })
            .select('-songs')
            .sort({ createdAt: -1 });
 
        res.status(200).json(sessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get songs for a specific mood session (on demand)
// @route   GET /api/mood/history/:id/songs
// @access  Private
const getSessionSongs = async (req, res) => {
    try {
        const session = await MoodSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Check user ownership
        if (session.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        res.status(200).json(session.songs || []);
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
            throw new Error("Invalid mood classification returned by AI");
        }

    } 
    catch (error) {
        console.error("Groq AI Analysis failed:", error.message);
        return res.status(500).json({ 
            message: "AI Analysis failed", 
            error: error.message 
        });
    }

    try {
        const recommendedSongs = await getRecommendations(detectedMood);

        const moodSession = await MoodSession.create({
            user: req.user._id,
            mood: detectedMood,
            songs: recommendedSongs,
            modelVersion,
        });

        return res.status(201).json({
            mood: detectedMood,
            modelVersion,
            recommendedSongs,
        });

    } 
    catch (dbError) {
        console.error("Database Error:", dbError.message);
        return res.status(500).json({ message: "Database Error", error: dbError.message });
    }
};


module.exports = {
    detectMood,
    getMoodHistory,
    getSessionSongs,
    deleteMoodSession,
    aiAnalysis,
};
