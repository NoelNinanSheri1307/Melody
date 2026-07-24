import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

function Dashboard() {
    const [mood, setMood] = useState("");
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showProfile, setShowProfile] = useState(false);
    const [detectedEmotion, setDetectedEmotion] = useState("");
    const [detectionMode, setDetectionMode] = useState("manual"); // 'manual', 'text', 'camera', 'hybrid'
    const [userText, setUserText] = useState("");
    const [explanation, setExplanation] = useState("");
    const [confidence, setConfidence] = useState(null);
    const [recExplanation, setRecExplanation] = useState("");
    const [uploadedImage, setUploadedImage] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [likedSongs, setLikedSongs] = useState([]);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const [cameraActive, setCameraActive] = useState(false);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace("/api", "");

    const handleDetect = async () => {
        if (!mood) return;
        handleDetectMood(mood);
    };

    const handleDetectMood = async (targetMood) => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.post("/mood/detect", { mood: targetMood });
            setSongs(data.recommendedSongs || data.songs || []);
            setDetectedEmotion(data.mood || targetMood);
            setMood(targetMood);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleTextAnalysis = async () => {
        if (!userText.trim()) return;

        setLoading(true);
        setError("");

        try {
            const { data } = await api.post("/mood/ai-analysis", {
                text: userText,
                history: chatHistory
            });

            setMood(data.mood);
            console.log("AI Analysis Result:", data.mood);
            setSongs(data.recommendedSongs || data.songs || []);
            setDetectedEmotion(data.mood);
            setExplanation(data.explanation || "");
            setConfidence(data.confidence !== undefined ? data.confidence : null);
            setRecExplanation(data.recommendationExplanation || "");

            // Update chat context history with the user text and assistant classification
            setChatHistory(prev => [
                ...prev,
                { role: "user", content: userText },
                { role: "assistant", content: `Detected emotional state: ${data.mood}` }
            ].slice(-6));
            
            setUserText("");

        }
        catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        }
        finally {
            setLoading(false);
        }
    };

    const startCamera = async () => {
        try {
            setError("");
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraActive(true);
        } catch (error) {
            console.error("Camera error:", error);
            setError("Webcam access was denied or is currently unavailable. Please verify device permissions.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    };

    useEffect(() => {
        if (detectionMode === "camera" || detectionMode === "hybrid") {
            if (!uploadedImage) {
                startCamera();
            }
        } else {
            stopCamera();
            setUploadedImage(null);
        }
        return () => {
            stopCamera();
        };
    }, [detectionMode]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validFormats = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
        if (!validFormats.includes(file.type)) {
            setError("Unsupported file format. Please upload a PNG, JPG, JPEG, or WEBP image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("File size is too large. Please upload an image under 5MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setUploadedImage(event.target.result);
            stopCamera();
            setError("");
        };
        reader.onerror = () => {
            setError("Failed to read image file.");
        };
        reader.readAsDataURL(file);
    };

    const captureAndDetect = async () => {
        let base64 = "";

        if (uploadedImage) {
            base64 = uploadedImage;
        } else {
            if (!videoRef.current) return;
            const canvas = canvasRef.current;
            const video = videoRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            base64 = canvas.toDataURL("image/jpeg");
        }

        try {
            setLoading(true);
            setError("");

            const { data } = await api.post("/camera/detect-camera", {
                image: base64
            });

            setMood(data.mood);
            setDetectedEmotion(data.mood);
            setSongs(data.songs || data.recommendedSongs || []);
            setExplanation(data.explanation || "");
            setConfidence(data.confidence !== undefined ? data.confidence : null);
            setRecExplanation(data.recommendationExplanation || "");

        } catch (err) {
            console.error(err);
            setError("Biometric scan failed. No face detected or scanning timeout.");
        } finally {
            setLoading(false);
        }
    };

    const handleHybridAnalysis = async () => {
        let base64 = "";

        if (uploadedImage) {
            base64 = uploadedImage;
        } else if (cameraActive && videoRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            base64 = canvas.toDataURL("image/jpeg");
        }

        const hasText = !!userText.trim();
        const hasImage = !!base64;

        if (!hasText && !hasImage) {
            setError("Please provide either chat text or scan/upload an image to analyze.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const { data } = await api.post("/mood/hybrid", {
                text: userText,
                image: base64 || null,
                history: chatHistory
            });

            setMood(data.mood);
            setDetectedEmotion(data.mood);
            setSongs(data.songs || data.recommendedSongs || []);
            setExplanation(data.explanation || "");
            setConfidence(data.confidence !== undefined ? data.confidence : null);
            setRecExplanation(data.recommendationExplanation || "");

            if (hasText) {
                setChatHistory(prev => [
                    ...prev,
                    { role: "user", content: userText },
                    { role: "assistant", content: `Detected hybrid state: ${data.mood}` }
                ].slice(-6));
                setUserText("");
            }

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Hybrid analysis failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    useEffect(() => {
        if (!user) navigate("/login");
    }, [user, navigate]);

    useEffect(() => {
        const loadHistoryAndLikes = async () => {
            try {
                const [historyRes, likedRes] = await Promise.all([
                    api.get("/mood/history"),
                    api.get("/mood/liked")
                ]);
                setHistoryData(historyRes.data);
                setLikedSongs(likedRes.data);
            } catch (err) {
                console.error("Failed to load history and likes for dashboard insights:", err);
            }
        };
        if (user) {
            loadHistoryAndLikes();
        }
    }, [user]);

    const handleLikeToggle = async (song) => {
        try {
            const { data } = await api.post("/mood/like", {
                title: song.title,
                artist: song.artist,
                album: song.album,
                coverImage: song.coverImage,
                previewUrl: song.previewUrl,
                deezerUrl: song.deezerUrl,
                duration: song.duration,
                genre: song.genre || "",
                ranking: song.ranking || 0
            });
            
            if (data.liked) {
                setLikedSongs(prev => [...prev, data.song || song]);
            } else {
                setLikedSongs(prev => prev.filter(s => !(s.title === song.title && s.artist === song.artist)));
            }
        } catch (err) {
            console.error("Failed to toggle song like:", err);
        }
    };

    const getDashboardInsights = () => {
        if (!historyData || historyData.length === 0) {
            return {
                peakMood: "None",
                peakPercentage: 0,
                peakText: "No sessions recorded yet. Scan or Select your mood above!",
                insight1Title: "Subconscious Mapping",
                insight1Text: "Complete text or scan sessions to map your frequency spectrum.",
                insight2Title: "Frequency Shift",
                insight2Text: "Record your emotional state daily to build a streak."
            };
        }

        const moodCounts = {};
        historyData.forEach(s => {
            const m = s.mood || "neutral";
            moodCounts[m] = (moodCounts[m] || 0) + 1;
        });
        let peakMood = "neutral";
        let maxCount = 0;
        Object.entries(moodCounts).forEach(([m, count]) => {
            if (count > maxCount) {
                maxCount = count;
                peakMood = m;
            }
        });
        const peakPercentage = Math.round((maxCount / historyData.length) * 100);
        const capitalizedMood = peakMood.charAt(0).toUpperCase() + peakMood.slice(1);
        const peakText = `Your emotional peak is "${capitalizedMood}" (dominates ${peakPercentage}% of sessions).`;

        const uniqueMoods = new Set(historyData.map(s => s.mood.toLowerCase()));
        const diversityCount = uniqueMoods.size;
        const insight1Text = `You have explored ${diversityCount} different emotional frequencies in your timeline.`;

        const uniqueDays = Array.from(new Set(historyData.map(s => {
            const d = new Date(s.createdAt);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        }))).map(dStr => {
            const parts = dStr.split('-');
            const d = new Date(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
            d.setHours(0,0,0,0);
            return d;
        });

        uniqueDays.sort((a,b) => b.getTime() - a.getTime());

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

        const insight2Text = streak > 1 
            ? `Fantastic! You are currently on a ${streak}-day emotional tracking streak.`
            : "Record your emotional state daily to build a tracking streak.";

        return {
            peakMood: capitalizedMood,
            peakPercentage,
            peakText,
            insight1Title: "Subconscious Mapping",
            insight1Text,
            insight2Title: "Frequency Shift",
            insight2Text
        };
    };

    const insights = getDashboardInsights();

    return (
        <div className="min-h-screen text-white p-8">
            {/* Header with Profile Widget */}
            <div className="flex justify-between items-start mb-12">
                <div className="text-2xl font-bold tracking-tighter flex items-center gap-2">
                    <svg className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                    <span className="opacity-80 uppercase tracking-widest text-xs">Dashboard</span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/history")}
                        className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all duration-300 font-bold text-xs uppercase tracking-widest"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        History
                    </button>

                    <div className="relative">
                        <div
                            onClick={() => setShowProfile(!showProfile)}
                            className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full cursor-pointer hover:bg-white/10 transition-all"
                        >
                            <div className="w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center text-black font-bold">
                                {user?.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">{user?.name}</span>
                        </div>


                        {showProfile && (
                            <div className="absolute right-0 mt-4 w-64 bg-[#0a0f1a] border border-white/10 rounded-2xl p-6 shadow-2xl z-50 backdrop-blur-3xl">
                                <p className="text-xs uppercase tracking-widest text-gray-500 mb-4 font-bold">Profile Info</p>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-gray-400">Signed in as</p>
                                        <p className="text-sm font-bold text-cyan-400">{user?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Credentials</p>
                                        <p className="text-sm font-mono truncate">{user?.email}</p>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 space-y-2">
                                        <button onClick={() => navigate("/history")} className="w-full text-left text-sm hover:text-cyan-400 transition">View History</button>
                                        <button onClick={handleLogout} className="w-full text-left text-sm text-red-400 hover:text-red-300 transition">Log Out</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-12">

                {/* Main Interaction Area */}
                <div className="space-y-12">
                    <section>
                        <div className="flex gap-8 mb-12 border-b border-white/5 pb-2">
                            {[
                                {
                                    id: "manual",
                                    label: "Quick Select",
                                    icon: (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                        </svg>
                                    )
                                },
                                {
                                    id: "text",
                                    label: "AI Analysis",
                                    icon: (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.989-2.386l-.548-.547z" />
                                        </svg>
                                    )
                                },
                                {
                                    id: "camera",
                                    label: "Face Scan",
                                    icon: (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )
                                },
                                {
                                    id: "hybrid",
                                    label: "Hybrid Scan",
                                    icon: (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a6 6 0 00-6-6M2 13a6 6 0 006 6" />
                                        </svg>
                                    )
                                }
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => {
                                        setDetectionMode(mode.id);
                                        setDetectedEmotion("");
                                        setSongs([]);
                                        setMood("");
                                        setError("");
                                    }}
                                    className={`pb-4 text-[10px] font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${detectionMode === mode.id ? "text-cyan-400" : "text-gray-500 hover:text-white"}`}
                                >
                                    {mode.icon}
                                    {mode.label}
                                    {detectionMode === mode.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>}
                                </button>
                            ))}
                        </div>

                        {detectionMode === "manual" && (
                            <div className="animate-in fade-in slide-in-from-left-5 duration-500">
                                <h2 className="text-4xl font-bold mb-4 cursive text-white/90">How are you feeling right now?</h2>
                                <p className="text-gray-400 mb-8 max-w-xl">Select your current frequency to synchronize with our library.</p>
                                <div className="flex gap-4 flex-wrap mb-8">
                                    {["happy", "calm", "angry", "sad", "energetic", "neutral", "stressed", "excited", "lonely", "relaxed", "romantic", "focus"].map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => handleDetectMood(m)}
                                            className={`px-8 py-3 rounded-full border-2 transition-all duration-300 font-bold ${mood === m
                                                ? "bg-cyan-400 border-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                                                : "bg-transparent border-white/10 hover:border-cyan-400/50 hover:text-cyan-400"
                                                }`}
                                        >
                                            {m.charAt(0).toUpperCase() + m.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={handleDetect}
                                    disabled={!mood || loading}
                                    className="bg-transparent border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-12 py-4 rounded-full font-bold transition-all duration-500 disabled:opacity-50"
                                >
                                    {loading ? "Analyzing..." : "Show Recommendations"}
                                </button>
                            </div>
                        )}

                        {detectionMode === "text" && (
                            <div className="animate-in fade-in slide-in-from-left-5 duration-500">
                                <h2 className="text-4xl font-bold mb-4 cursive text-white/90">Describe your state</h2>
                                <p className="text-gray-400 mb-8 max-w-xl">Tell us about your day, your thoughts, or your current environment. Melody will decipher your emotional resonance.</p>
                                <textarea
                                    value={userText}
                                    onChange={(e) => setUserText(e.target.value)}
                                    placeholder="e.g. It was a long day at work and I'm feeling a bit overwhelmed, but looking for some peace..."
                                    className="w-full bg-white/5 border-2 border-white/10 rounded-3xl p-6 text-white text-lg placeholder-gray-600 focus:border-cyan-400 focus:outline-none transition-all mb-8 h-40"
                                />
                                <button
                                    onClick={handleTextAnalysis}
                                    disabled={loading || !userText.trim()}
                                    className="bg-cyan-400 text-black px-12 py-4 rounded-full font-bold transition-all duration-500 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] disabled:opacity-50"
                                >
                                    {loading ? "ML Underway — Analyzing Frequencies..." : "Suggest Songs from AI Analysis"}
                                </button>
                            </div>
                        )}

                        {detectionMode === "camera" && (
                            <div className="animate-in fade-in slide-in-from-left-5 duration-500">
                                <h2 className="text-4xl font-bold mb-4 cursive text-white/90">
                                    Biometric Analysis
                                </h2>
                                <p className="text-gray-400 mb-8 max-w-xl">
                                    Our OpenCV module analyzes facial expressions to detect emotional state.
                                </p>

                                <div className="aspect-video w-full bg-black rounded-3xl overflow-hidden flex items-center justify-center relative border border-white/5 shadow-2xl">
                                    {uploadedImage ? (
                                        <div className="relative w-full h-full">
                                            <img
                                                src={uploadedImage}
                                                alt="Uploaded preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                onClick={() => {
                                                    setUploadedImage(null);
                                                    startCamera();
                                                }}
                                                className="absolute top-4 right-4 bg-red-500/80 text-white font-bold p-3 w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-600 transition shadow"
                                                title="Remove Image"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {!cameraActive && (
                                                <button
                                                    onClick={startCamera}
                                                    className="px-8 py-4 bg-cyan-400 text-black rounded-full font-bold hover:scale-105 transition"
                                                >
                                                    Start Camera
                                                </button>
                                            )}

                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
                                            />
                                            <canvas ref={canvasRef} className="hidden" />
                                        </>
                                    )}
                                </div>

                                <div className="mt-6 flex gap-4 items-center">
                                    <button
                                        onClick={captureAndDetect}
                                        disabled={(!cameraActive && !uploadedImage) || loading}
                                        className="px-10 py-3 bg-cyan-400 text-black rounded-full font-bold disabled:opacity-50 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition"
                                    >
                                        {loading ? "Analyzing..." : "Scan Emotion"}
                                    </button>

                                    <label className="px-6 py-3 bg-white/10 text-white rounded-full font-bold cursor-pointer hover:bg-white/20 transition flex items-center gap-2 text-sm">
                                        <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        <span>Upload File</span>
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg, image/webp"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                            disabled={loading}
                                        />
                                    </label>
                                </div>
                            </div>
                        )}
                        {detectionMode === "hybrid" && (
                            <div className="animate-in fade-in slide-in-from-left-5 duration-500 space-y-8">
                                <div>
                                    <h2 className="text-4xl font-bold mb-4 cursive text-white/90">
                                        Hybrid Emotional Fusion
                                    </h2>
                                    <p className="text-gray-400 max-w-xl">
                                        Fuses webcam biometric expressions and conversational chat markers for advanced multidimensional mapping.
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Left: Biometrics */}
                                    <div className="space-y-4">
                                        <h3 className="text-xs uppercase tracking-wider text-cyan-400 font-bold font-mono">Biometric Input</h3>
                                        <div className="aspect-video bg-black rounded-3xl overflow-hidden flex items-center justify-center relative border border-white/5 shadow-2xl">
                                            {uploadedImage ? (
                                                <div className="relative w-full h-full">
                                                    <img
                                                        src={uploadedImage}
                                                        alt="Uploaded preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            setUploadedImage(null);
                                                            startCamera();
                                                        }}
                                                        className="absolute top-4 right-4 bg-red-500/80 text-white font-bold p-3 w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-600 transition shadow"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    {!cameraActive && (
                                                        <button
                                                            onClick={startCamera}
                                                            className="px-6 py-3 bg-cyan-400 text-black rounded-full font-bold hover:scale-105 transition text-sm"
                                                        >
                                                            Start Webcam
                                                        </button>
                                                    )}

                                                    <video
                                                        ref={videoRef}
                                                        autoPlay
                                                        className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
                                                    />
                                                    <canvas ref={canvasRef} className="hidden" />
                                                </>
                                            )}
                                        </div>
                                        <div className="flex gap-4">
                                            <label className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-400/30 text-white rounded-2xl font-bold cursor-pointer transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider">
                                                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                                <span>Upload Photo</span>
                                                <input
                                                    type="file"
                                                    accept="image/png, image/jpeg, image/jpg, image/webp"
                                                    className="hidden"
                                                    onChange={handleImageUpload}
                                                    disabled={loading}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Right: Conversational Context */}
                                    <div className="space-y-4 flex flex-col">
                                        <h3 className="text-xs uppercase tracking-wider text-cyan-400 font-bold font-mono">Conversational Input</h3>
                                        <textarea
                                            value={userText}
                                            onChange={(e) => setUserText(e.target.value)}
                                            placeholder="Write about your current thoughts or environment... e.g. Trying to focus but feeling a bit scattered..."
                                            className="flex-1 bg-white/5 border-2 border-white/10 rounded-3xl p-6 text-white text-base placeholder-gray-600 focus:border-cyan-400 focus:outline-none transition-all h-full min-h-[150px]"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={handleHybridAnalysis}
                                        disabled={loading}
                                        className="bg-cyan-400 text-black px-12 py-4 rounded-full font-bold transition-all duration-500 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] disabled:opacity-50 text-base"
                                    >
                                        {loading ? "Fusing Modalities & Deciphering Frequencies..." : "Analyze Hybrid Frequencies"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center font-bold text-sm uppercase tracking-widest"
                            >
                                {error}
                            </motion.div>
                        )}

                        {detectedEmotion && (
                             <motion.div
                                 initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                 animate={{ opacity: 1, scale: 1, y: 0 }}
                                 exit={{ opacity: 0, scale: 0.8 }}
                                 className="mb-12 text-center space-y-4"
                             >
                                 <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-4">
                                     <span className="px-8 py-4 bg-cyan-400 text-black font-bold rounded-full text-base uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(34,211,238,0.6)]">
                                         Detected Emotion: {detectedEmotion}
                                     </span>
                                     {confidence !== null && (
                                         <span className="px-4 py-2 bg-white/10 text-cyan-400 font-mono font-bold text-xs uppercase tracking-widest rounded-full border border-cyan-400/20">
                                             {Math.round(confidence * 100)}% match
                                         </span>
                                     )}
                                 </div>
                                 {explanation && (
                                     <p className="text-gray-400 text-sm italic max-w-lg mx-auto font-light leading-relaxed">
                                         Analysis insight: {explanation}
                                     </p>
                                 )}
                             </motion.div>
                         )}
                    </AnimatePresence>
                    {songs.length > 0 && (
                        <section className="animate-in fade-in slide-in-from-bottom-5 duration-700 space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-cyan-400 uppercase tracking-widest text-sm">Synchronized Library</h3>
                                {recExplanation && (
                                    <p className="text-xs text-gray-400 mt-2 max-w-xl italic leading-relaxed border-l border-cyan-400/30 pl-3">
                                        {recExplanation}
                                    </p>
                                )}
                            </div>
                            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {songs.map((song, index) => (
                                    <div key={song.title + song.artist + index} className="bg-white/5 p-5 rounded-3xl border border-white/5 hover:border-cyan-400/30 transition-all group flex gap-4 items-center">
                                        {song.coverImage && (
                                            <img
                                                src={song.coverImage}
                                                alt={song.album}
                                                className="w-14 h-14 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <h3 className="font-bold text-base truncate pr-2 text-white" title={song.title}>{song.title}</h3>
                                                {song.duration && (
                                                    <span className="text-[10px] text-gray-500 shrink-0 font-mono">
                                                        {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-cyan-400 text-xs mb-0.5 truncate">{song.artist}</p>
                                            <p className="text-gray-400 text-[10px] truncate mb-3">Album: {song.album}</p>

                                            <div className="flex gap-2 items-center">
                                                {song.previewUrl && (
                                                    <a
                                                        href={song.previewUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] bg-white/10 text-white px-2.5 py-1 rounded-full hover:bg-cyan-400 hover:text-black transition-colors"
                                                    >
                                                        Preview
                                                    </a>
                                                )}
                                                {song.deezerUrl && (
                                                    <a
                                                        href={song.deezerUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] bg-cyan-400 text-black font-bold px-3 py-1 rounded-full hover:bg-white hover:text-black transition-colors"
                                                    >
                                                        View in Apple Music
                                                    </a>
                                                )}
                                                {(() => {
                                                    const isLiked = likedSongs.some(s => s.title === song.title && s.artist === song.artist);
                                                    return (
                                                        <button
                                                            onClick={() => handleLikeToggle(song)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                            title={isLiked ? "Unlike song" : "Like song"}
                                                        >
                                                            <svg 
                                                                className="w-4 h-4" 
                                                                fill={isLiked ? "currentColor" : "none"} 
                                                                viewBox="0 0 24 24" 
                                                                stroke="currentColor"
                                                                style={{ color: isLiked ? "#ef4444" : "currentColor" }}
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                            </svg>
                                                        </button>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/10 pt-12">
                    <div className="bg-cyan-900/10 border border-cyan-400/10 p-8 rounded-[2.5rem]">
                        <h4 className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6 border-b border-cyan-400/10 pb-4">Mood Trend</h4>
                        <div className="space-y-4">
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-cyan-400 rounded-full transition-all duration-1000"
                                    style={{ width: `${insights.peakPercentage}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-400 italic text-center leading-relaxed">
                                {insights.peakText}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                        <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Quick Insights</h4>
                        <ul className="space-y-6">
                            <li className="flex gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 font-bold">𝄞</div>
                                <div>
                                    <p className="text-sm font-bold">{insights.insight1Title}</p>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{insights.insight1Text}</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 font-bold">♫</div>
                                <div>
                                    <p className="text-sm font-bold">{insights.insight2Title}</p>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{insights.insight2Text}</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
        </div>
    </div>
    );
}

export default Dashboard;
