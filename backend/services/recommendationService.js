const axios = require("axios");

const cache = new Map();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache

const emotionMappings = {
    happy: ["upbeat", "feel good", "dance pop", "summer", "energetic"],
    sad: ["acoustic", "piano", "ambient", "emotional", "indie"],
    calm: ["lo-fi", "chill", "jazz", "instrumental", "meditation"],
    energetic: ["workout", "EDM", "electronic", "rock", "gym"],
    angry: ["metal", "hard rock", "alternative", "punk"],
    neutral: ["popular", "trending", "soft pop", "indie"],
    stressed: ["calm", "relaxing", "peaceful", "soft acoustic", "lullaby"],
    excited: ["party", "club hits", "dance", "electronic upbeat", "hype"],
    lonely: ["melancholy", "indie folk", "slow acoustic", "sad songs", "comforting"],
    relaxed: ["chillout", "ambient", "slow jazz", "nature sounds", "relaxing"],
    romantic: ["love songs", "romantic pop", "ballads", "rnb love"],
    focus: ["lofi study", "classical piano", "instrumental focus", "deep focus", "ambient study"]
};

/**
 * Gets real-time song recommendations from the iTunes Search API based on mapped emotion terms.
 * Results are cached in-memory for 5 minutes.
 * 
 * @param {string} emotion - The detected system mood.
 * @returns {Promise<Array>} Normalized track metadata list.
 */
const getRecommendations = async (emotion) => {
    const normalizedEmotion = emotion ? emotion.toLowerCase().trim() : "neutral";
    const terms = emotionMappings[normalizedEmotion] || emotionMappings["neutral"];
    
    // Pick a search term randomly to provide dynamic suggestions
    const randomTerm = terms[Math.floor(Math.random() * terms.length)];
    
    const now = Date.now();
    if (cache.has(randomTerm)) {
        const cached = cache.get(randomTerm);
        if (now - cached.timestamp < CACHE_DURATION_MS) {
            console.log(`Returning cached recommendations for search term: ${randomTerm}`);
            return cached.data;
        }
    }
    
    try {
        console.log(`Querying iTunes API for term: "${randomTerm}"`);
        const response = await axios.get("https://itunes.apple.com/search", {
            params: {
                term: randomTerm,
                media: "music",
                limit: 30
            },
            timeout: 8000 // 8 seconds timeout
        });
        
        if (!response.data || !response.data.results) {
            throw new Error("Invalid response payload from iTunes Search API");
        }
        
        console.log(`iTunes Search API successfully returned ${response.data.results.length} tracks.`);
        const normalizedTracks = response.data.results.map(track => {
            const cover100 = track.artworkUrl100 || "";
            const cover500 = cover100.replace("100x100bb.jpg", "500x500bb.jpg");
            
            return {
                title: track.trackName,
                artist: track.artistName,
                album: track.collectionName || "Single",
                coverImage: cover100,
                previewUrl: track.previewUrl || "",
                deezerUrl: track.trackViewUrl || "", // Maps to iTunes/Apple Music link
                duration: track.trackTimeMillis ? Math.floor(track.trackTimeMillis / 1000) : 0,
                artistImage: cover100,
                albumImage: cover500,
                ranking: track.trackId || 0,
                genre: track.primaryGenreName || ""
            };
        });
        
        cache.set(randomTerm, {
            timestamp: now,
            data: normalizedTracks
        });
        
        return normalizedTracks;
        
    } catch (error) {
        console.error(`iTunes Recommendation Engine failed for term "${randomTerm}":`, error.message);
        
        // Fallback to expired cache if available during complete network failures
        if (cache.has(randomTerm)) {
            console.warn(`Retrieving expired cache fallback data for term: ${randomTerm}`);
            return cache.get(randomTerm).data;
        }
        
        throw new Error(`Music recommendation service is currently offline.`);
    }
};

const getRecommendationExplanation = (mood) => {
    const explanations = {
        happy: "These tracks focus on vibrant rhythms and uplifting melodies to amplify your happy vibe.",
        sad: "These songs offer soft acoustic sounds and comforting lyrics to soothe a sad or reflective state.",
        angry: "These heavy beats and raw energetic chords provide a healthy release for intense emotions.",
        calm: "These selections highlight gentle acoustic strums and mellow notes to foster a peaceful space.",
        energetic: "These fast-tempo beats and powerful synth progressions are chosen to feed your active momentum.",
        neutral: "These balanced acoustic rhythms and popular songs fit a relaxed, neutral presence.",
        stressed: "These calming ambient frequencies and quiet sounds aim to slow down thoughts and ease stress.",
        excited: "These dance-ready pop hooks and high-energy anthems celebrate your excited mood.",
        lonely: "These warm acoustic tracks and empathetic vocals are here to keep you company and bring comfort.",
        relaxed: "These smooth jazz harmonies and gentle beats help you ease into a deep state of relaxation.",
        romantic: "These warm, melodic r&b and pop love songs harmonize with your romantic frequency.",
        focus: "These instrumental lo-fi sounds and piano chords help block out distractions for deep focus."
    };
    return explanations[mood.toLowerCase()] || explanations.neutral;
};

module.exports = {
    getRecommendations,
    getRecommendationExplanation
};
