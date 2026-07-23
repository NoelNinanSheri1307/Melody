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
    const [detectionMode, setDetectionMode] = useState("manual"); // 'manual', 'text', 'camera'
    const [userText, setUserText] = useState("");
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [cameraActive, setCameraActive] = useState(false);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace("/api", "");

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
                    text: userText
                });

                setMood(data.mood);
                console.log("AI Analysis Result:", data.mood);
                setSongs(data.recommendedSongs);
                setDetectedEmotion(data.mood);

            }
            catch (err) {
                setError(err.response?.data?.message || "Something went wrong");
            } 
            finally{
                setLoading(false);
            }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
            setCameraActive(true);
        } catch (error) {
            console.error("Camera error:", error);
        }
    };

    const captureAndDetect = async () => {
        if (!videoRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const base64 = canvas.toDataURL("image/jpeg");

        try {
            setLoading(true);
            setError("");

            const { data } = await api.post("/camera/detect-camera", {
                image: base64
            });

            setMood(data.mood);
            setDetectedEmotion(data.mood);
            setSongs(data.songs || data.recommendedSongs || []);

        } catch (err) {
            console.error(err);
            setError("Biometric scan failed. Frequency unknown.");
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Main Interaction Area */}
                <div className="lg:col-span-2 space-y-12">
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
                                    {["happy", "calm", "angry", "sad", "energetic", "neutral"].map((m) => (
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
                                <p className="text-gray-400 mb-8 max-w-xl">Tell us about your day, your thoughts, or your current environment. Our LLM will decipher your emotional resonance.</p>
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

                                <div className="aspect-video w-full bg-black rounded-3xl overflow-hidden flex items-center justify-center relative">
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
                                </div>

                                <div className="mt-6 flex gap-4">

                                    <button
                                        onClick={captureAndDetect}
                                        disabled={!cameraActive || loading}
                                        className="px-10 py-3 bg-cyan-400 text-black rounded-full font-bold disabled:opacity-50"
                                    >
                                        {loading ? "Analyzing..." : "Scan Emotion"}
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
                                className="mb-12 text-center"
                            >
                                <span className="px-8 py-4 bg-cyan-400 text-black font-bold rounded-full text-base uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(34,211,238,0.6)] inline-block">
                                    Detected Emotion: {detectedEmotion}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {songs.length > 0 && (
                        <section className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                            <h3 className="text-2xl font-bold mb-6 text-cyan-400 uppercase tracking-widest text-sm">Synchronized Library</h3>
                            <div className="grid sm:grid-cols-2 gap-6">
                                {songs.map((song) => (
                                    <div key={song._id} className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-cyan-400/30 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-xl">{song.title}</h3>
                                                <p className="text-gray-400 text-sm">{song.artist}</p>
                                            </div>
                                            <span className="text-[10px] text-cyan-400 border border-cyan-400/20 px-2 py-1 rounded-md uppercase">{song.genre}</span>
                                        </div>
                                        {song.audioUrl && (
                                            <audio controls className="w-full h-8 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <source src={`${BASE_URL}${song.audioUrl}`} type="audio/mpeg" />
                                            </audio>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar suggestions / Insights */}
                <div className="space-y-8">
                    <div className="bg-cyan-900/10 border border-cyan-400/10 p-8 rounded-[2.5rem]">
                        <h4 className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6 border-b border-cyan-400/10 pb-4">Mood Trend</h4>
                        <div className="space-y-4">
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-400 w-3/4 rounded-full"></div>
                            </div>
                            <p className="text-xs text-gray-500 italic text-center">Your emotional peak was "Happy" earlier today.</p>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                        <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Quick Insights</h4>
                        <ul className="space-y-6">
                            <li className="flex gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-400">𝄞</div>
                                <div>
                                    <p className="text-sm font-bold">Subconscious Mapping</p>
                                    <p className="text-xs text-gray-500">ML determined you respond best to Lofi-Beats at night.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-400">♫</div>
                                <div>
                                    <p className="text-sm font-bold">Frequency Shift</p>
                                    <p className="text-xs text-gray-500">Current listening trend: Lowering Cortisol.</p>
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
