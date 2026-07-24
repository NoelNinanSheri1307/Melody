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
                ranking: track.trackId || 0
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

module.exports = {
    getRecommendations
};
