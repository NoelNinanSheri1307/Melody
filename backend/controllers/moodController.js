const MoodSession = require('../models/MoodSession');
const { getRecommendations, getRecommendationExplanation } = require('../services/recommendationService');
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
    const allowedMoods = ["happy", "sad", "angry", "calm", "energetic", "neutral", "stressed", "excited", "lonely", "relaxed", "romantic", "focus"];

    let detectedMood;
    let explanation;
    let confidence;
    let modelVersion = "groq_llama_v1";

    try {
        const { text, history } = req.body;

        if (!text) {
            return res.status(400).json({ message: "Please provide text input" });
        }

        const messages = [
            {
                role: "system",
                content: "You are a mood classifier. Your job is to classify the user's emotional state based on their conversation history and latest statement. Respond ONLY with a JSON object in this format: {\"mood\": \"happy\", \"explanation\": \"brief explanation referencing specific sentiment markers (e.g. positive/negative wording, optimistic/anxious tone, reflective language)\", \"confidence\": 0.9}. The mood MUST be one of these exact words: happy, sad, angry, calm, energetic, neutral, stressed, excited, lonely, relaxed, romantic, focus."
            }
        ];

        if (history && Array.isArray(history)) {
            history.forEach(msg => {
                if (msg.content && msg.role) {
                    messages.push({ role: msg.role, content: msg.content });
                }
            });
        }

        messages.push({ role: "user", content: text });

        const aiResponse = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: messages,
            temperature: 0,
            response_format: { type: "json_object" }
        });

        const parsedResponse = JSON.parse(aiResponse.choices[0].message.content.trim());
        detectedMood = parsedResponse.mood ? parsedResponse.mood.toLowerCase().trim() : "neutral";
        explanation = parsedResponse.explanation || "Analyzed text sentiment";
        confidence = parsedResponse.confidence !== undefined ? parsedResponse.confidence : 0.8;

        if (!allowedMoods.includes(detectedMood)) {
            detectedMood = "neutral";
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
        const recExplanation = getRecommendationExplanation(detectedMood);

        const moodSession = await MoodSession.create({
            user: req.user._id,
            mood: detectedMood,
            songs: recommendedSongs,
            confidence: confidence,
            explanation: explanation,
            recommendationExplanation: recExplanation,
            modelVersion,
        });

        return res.status(201).json({
            mood: detectedMood,
            confidence,
            explanation,
            recommendationExplanation: recExplanation,
            modelVersion,
            recommendedSongs,
        });

    } 
    catch (dbError) {
        console.error("Database Error:", dbError.message);
        return res.status(500).json({ message: "Database Error", error: dbError.message });
    }
};

const hybridAnalysis = async (req, res) => {
    const allowedMoods = ["happy", "sad", "angry", "calm", "energetic", "neutral", "stressed", "excited", "lonely", "relaxed", "romantic", "focus"];
    let detectedMood = "neutral";
    let explanation = "";
    let confidence = 0.8;
    let modelVersion = "hybrid_v1";

    try {
        const { image, text, history } = req.body;

        const hasImage = !!image;
        const hasText = !!(text && text.trim());

        if (!hasImage && !hasText) {
            return res.status(400).json({ message: "Please provide either chat text or a biometric image scan." });
        }

        if (hasImage && hasText) {
            // Fused Hybrid Mode
            const { detectEmotionFromML } = require("../services/mlService");
            const imgRes = await detectEmotionFromML(image);

            const messages = [
                {
                    role: "system",
                    content: "You are an advanced hybrid emotional intelligence sensor. Your job is to classify the user's final emotional state by fusing two inputs: (1) a webcam/image expression prediction, and (2) their latest conversational text statement and history. Respond ONLY with a JSON object in this format: {\"mood\": \"happy\", \"explanation\": \"brief explanation describing how the conversation context and facial cues combined to make this decision\", \"confidence\": 0.9}. The mood MUST be one of these exact words: happy, sad, angry, calm, energetic, neutral, stressed, excited, lonely, relaxed, romantic, focus."
                }
            ];

            if (history && Array.isArray(history)) {
                history.forEach(msg => {
                    if (msg.content && msg.role) messages.push({ role: msg.role, content: msg.content });
                });
            }

            messages.push({
                role: "user",
                content: `Conversation input: "${text}". Biometric expression input: "${imgRes.mood}" with confidence ${Math.round(imgRes.confidence * 100)}%.`
            });

            const aiResponse = await groq.chat.completions.create({
                model: "llama-3.1-8b-instant",
                messages: messages,
                temperature: 0,
                response_format: { type: "json_object" }
            });

            const parsedResponse = JSON.parse(aiResponse.choices[0].message.content.trim());
            detectedMood = parsedResponse.mood ? parsedResponse.mood.toLowerCase().trim() : "neutral";
            explanation = parsedResponse.explanation || "Fused hybrid biometric and chat analysis";
            confidence = parsedResponse.confidence !== undefined ? parsedResponse.confidence : 0.8;

        } else if (hasText) {
            // Text-only Fallback
            const messages = [
                {
                    role: "system",
                    content: "You are a mood classifier. Respond ONLY with a JSON object in this format: {\"mood\": \"happy\", \"explanation\": \"brief explanation referencing specific sentiment markers (e.g. positive/negative wording, optimistic/anxious tone, reflective language)\", \"confidence\": 0.9}. The mood MUST be one of these exact words: happy, sad, angry, calm, energetic, neutral, stressed, excited, lonely, relaxed, romantic, focus."
                }
            ];

            if (history && Array.isArray(history)) {
                history.forEach(msg => {
                    if (msg.content && msg.role) messages.push({ role: msg.role, content: msg.content });
                });
            }

            messages.push({ role: "user", content: text });

            const aiResponse = await groq.chat.completions.create({
                model: "llama-3.1-8b-instant",
                messages: messages,
                temperature: 0,
                response_format: { type: "json_object" }
            });

            const parsedResponse = JSON.parse(aiResponse.choices[0].message.content.trim());
            detectedMood = parsedResponse.mood ? parsedResponse.mood.toLowerCase().trim() : "neutral";
            explanation = parsedResponse.explanation || "Fallback text sentiment analysis";
            confidence = parsedResponse.confidence !== undefined ? parsedResponse.confidence : 0.8;

        } else {
            // Image-only Fallback
            const { detectEmotionFromML } = require("../services/mlService");
            const imgRes = await detectEmotionFromML(image);
            detectedMood = imgRes.mood;
            confidence = imgRes.confidence;
            explanation = `Fallback biometric expression match with ${Math.round(confidence * 100)}% classification confidence.`;
        }

        if (!allowedMoods.includes(detectedMood)) {
            detectedMood = "neutral";
        }

    } catch (error) {
        console.error("Hybrid Analysis failed:", error.message);
        return res.status(500).json({ 
            message: "Hybrid Analysis failed", 
            error: error.message 
        });
    }

    try {
        const recommendedSongs = await getRecommendations(detectedMood);
        const recExplanation = getRecommendationExplanation(detectedMood);

        const moodSession = await MoodSession.create({
            user: req.user._id,
            mood: detectedMood,
            songs: recommendedSongs,
            confidence: confidence,
            explanation: explanation,
            recommendationExplanation: recExplanation,
            modelVersion,
        });

        return res.status(201).json({
            mood: detectedMood,
            confidence,
            explanation,
            recommendationExplanation: recExplanation,
            modelVersion,
            recommendedSongs,
        });

    } catch (dbError) {
        console.error("Database Error:", dbError.message);
        return res.status(500).json({ message: "Database Error", error: dbError.message });
    }
};

const getMoodInsights = async (req, res) => {
    try {
        const sessions = await MoodSession.find({ user: req.user._id });

        if (!sessions || sessions.length === 0) {
            return res.json({
                totalSessions: 0,
                mostFrequentMood: "None",
                streak: 0,
                diversity: 0,
                weeklyDistribution: {},
                monthlyDistribution: {},
                sourceDistribution: {},
                topArtists: [],
                topAlbums: [],
                topGenres: [],
                aiInsights: ["No mood logs found yet. Start tracking your emotions on the dashboard!"]
            });
        }

        // 1. Basic Stats & Distribution
        const moodCounts = {};
        const sourceCounts = {
            manual: 0,
            text: 0,
            camera: 0,
            hybrid: 0
        };

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const weeklyCounts = {};
        const monthlyCounts = {};

        const mapSource = (version) => {
            if (!version) return "manual";
            if (version.includes("camera")) return "camera";
            if (version.includes("groq_llama")) return "text";
            if (version.includes("hybrid")) return "hybrid";
            return "manual";
        };

        const allArtists = {};
        const allAlbums = {};
        const allGenres = {};

        const moodToGenreFallback = {
            happy: "Pop",
            sad: "Singer-Songwriter",
            angry: "Rock",
            calm: "Ambient",
            energetic: "Electronic",
            neutral: "Pop",
            stressed: "Chillout",
            excited: "Dance",
            lonely: "Indie",
            relaxed: "Smooth Jazz",
            romantic: "R&B",
            focus: "Acoustic"
        };

        sessions.forEach(s => {
            const m = s.mood.toLowerCase();
            moodCounts[m] = (moodCounts[m] || 0) + 1;

            const source = mapSource(s.modelVersion);
            sourceCounts[source] = (sourceCounts[source] || 0) + 1;

            const created = new Date(s.createdAt);
            if (created >= sevenDaysAgo) {
                weeklyCounts[m] = (weeklyCounts[m] || 0) + 1;
            }
            if (created >= thirtyDaysAgo) {
                monthlyCounts[m] = (monthlyCounts[m] || 0) + 1;
            }

            if (s.songs && Array.isArray(s.songs)) {
                s.songs.forEach(song => {
                    if (song.artist) {
                        allArtists[song.artist] = (allArtists[song.artist] || 0) + 1;
                    }
                    if (song.album) {
                        const albumKey = `${song.album} - ${song.artist}`;
                        allAlbums[albumKey] = (allAlbums[albumKey] || 0) + 1;
                    }
                    
                    const g = song.genre || moodToGenreFallback[m] || "Pop";
                    allGenres[g] = (allGenres[g] || 0) + 1;
                });
            }
        });

        let mostFrequentMood = "neutral";
        let maxMoodCount = 0;
        Object.entries(moodCounts).forEach(([mood, count]) => {
            if (count > maxMoodCount) {
                maxMoodCount = count;
                mostFrequentMood = mood;
            }
        });

        const topArtists = Object.entries(allArtists)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const topAlbums = Object.entries(allAlbums)
            .map(([key, count]) => {
                const [album, artist] = key.split(" - ");
                return { album, artist, count };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const topGenres = Object.entries(allGenres)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const uniqueDays = Array.from(new Set(sessions.map(s => {
            const d = new Date(s.createdAt);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        }))).map(dStr => {
            const parts = dStr.split('-');
            const d = new Date(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
            d.setHours(0,0,0,0);
            return d;
        });

        uniqueDays.sort((a, b) => b.getTime() - a.getTime());

        let streak = 0;
        const today = new Date();
        today.setHours(0,0,0,0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const hasSessionToday = uniqueDays.some(d => d.getTime() === today.getTime());
        const hasSessionYesterday = uniqueDays.some(d => d.getTime() === yesterday.getTime());

        if (hasSessionToday || hasSessionYesterday) {
            let checkDate = hasSessionToday ? today : yesterday;
            while (true) {
                const hasSession = uniqueDays.some(d => d.getTime() === checkDate.getTime());
                if (hasSession) {
                    streak++;
                    checkDate = new Date(checkDate);
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        }

        const aiInsights = [];
        const capitalizedPeak = mostFrequentMood.charAt(0).toUpperCase() + mostFrequentMood.slice(1);
        aiInsights.push(`You most often use the app in ${mostFrequentMood} moods.`);

        if (sessions.length > 4) {
            const mid = Math.floor(sessions.length / 2);
            const chronoSessions = [...sessions].sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
            const firstHalf = chronoSessions.slice(0, mid);
            const secondHalf = chronoSessions.slice(mid);

            const countMoods = (arr) => {
                const counts = {};
                arr.forEach(s => { counts[s.mood] = (counts[s.mood] || 0) + 1; });
                return counts;
            };

            const firstCounts = countMoods(firstHalf);
            const secondCounts = countMoods(secondHalf);

            let firstTop = "neutral";
            let maxFirst = 0;
            Object.entries(firstCounts).forEach(([m, count]) => {
                if (count > maxFirst) { maxFirst = count; firstTop = m; }
            });

            let secondTop = "neutral";
            let maxSecond = 0;
            Object.entries(secondCounts).forEach(([m, count]) => {
                if (count > maxSecond) { maxSecond = count; secondTop = m; }
            });

            if (firstTop !== secondTop) {
                aiInsights.push(`Your recent sessions have shifted from feeling more ${firstTop} toward more ${secondTop} emotions.`);
            } else {
                aiInsights.push(`Your emotional spectrum has remained consistently aligned with ${secondTop} vibes.`);
            }
        } else {
            aiInsights.push("Record a few more sessions to map your long-term emotional shift trend.");
        }

        if (topGenres.length > 0) {
            aiInsights.push(`${topGenres[0].name} and related frequencies appear frequently in your sound tracks.`);
        }

        res.json({
            totalSessions: sessions.length,
            mostFrequentMood: capitalizedPeak,
            streak,
            diversity: new Set(sessions.map(s => s.mood)).size,
            weeklyDistribution: weeklyCounts,
            monthlyDistribution: monthlyCounts,
            sourceDistribution: sourceCounts,
            topArtists,
            topAlbums,
            topGenres,
            aiInsights
        });

    } catch (error) {
        console.error("Failed to generate analytics:", error.message);
        res.status(500).json({ message: "Failed to generate analytics" });
    }
};


module.exports = {
    detectMood,
    getMoodHistory,
    getSessionSongs,
    deleteMoodSession,
    aiAnalysis,
    hybridAnalysis,
    getMoodInsights,
};
