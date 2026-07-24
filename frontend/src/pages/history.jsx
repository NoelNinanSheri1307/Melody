import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

function History() {
    const { user } = useContext(AuthContext);
    const [sessions, setSessions] = useState([]);
    const [likedSongs, setLikedSongs] = useState([]);
    const [analytics, setAnalytics] = useState({
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
    const [loading, setLoading] = useState(true);
    const [idToDelete, setIdToDelete] = useState(null);
    const [expandedSessions, setExpandedSessions] = useState({});
    const [sessionSongs, setSessionSongs] = useState({});
    const [songsLoading, setSongsLoading] = useState({});
    const navigate = useNavigate();

    // Filters
    const [selectedMood, setSelectedMood] = useState("");
    const [selectedSource, setSelectedSource] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Timeframe tabs
    const [timeframe, setTimeframe] = useState("weekly");

    const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace("/api", "");

    useEffect(() => {
        const fetchHistoryAndInsights = async () => {
            try {
                const [historyRes, insightsRes, likedRes] = await Promise.all([
                    api.get("/mood/history"),
                    api.get("/mood/insights"),
                    api.get("/mood/liked")
                ]);
                setSessions(historyRes.data);
                setAnalytics(insightsRes.data);
                setLikedSongs(likedRes.data);
            } catch (error) {
                console.error("Failed to load timeline and insights:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistoryAndInsights();
    }, []);

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedMood, selectedSource, startDate, endDate, searchQuery]);

    const toggleSessionSongs = async (sessionId) => {
        const isCurrentlyExpanded = expandedSessions[sessionId];
        
        if (!isCurrentlyExpanded && !sessionSongs[sessionId]) {
            setSongsLoading(prev => ({ ...prev, [sessionId]: true }));
            try {
                const { data } = await api.get(`/mood/history/${sessionId}/songs`);
                setSessionSongs(prev => ({ ...prev, [sessionId]: data }));
            } catch (error) {
                console.error("Failed to load songs for session:", error);
            } finally {
                setSongsLoading(prev => ({ ...prev, [sessionId]: false }));
            }
        }
        
        setExpandedSessions(prev => ({ ...prev, [sessionId]: !isCurrentlyExpanded }));
    };

    const handleDelete = (id) => {
        setIdToDelete(id);
    };

    const confirmDelete = async () => {
        if (!idToDelete) return;

        try {
            await api.delete(`/mood/${idToDelete}`);
            setSessions(sessions.filter(session => session._id !== idToDelete));
            
            // Reload insights to keep stats fresh
            const insightsRes = await api.get("/mood/insights");
            setAnalytics(insightsRes.data);
        } catch (error) {
            console.error("Failed to delete session:", error);
            alert("Could not remove the session. Please try again.");
        } finally {
            setIdToDelete(null);
        }
    };

    const mapSourceClean = (version) => {
        if (!version) return "Manual";
        if (version.includes("camera")) return "Camera";
        if (version.includes("groq_llama")) return "Chat";
        if (version.includes("hybrid")) return "Hybrid";
        return "Manual";
    };

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

    // Filter Logic
    const filteredSessions = sessions.filter(session => {
        if (selectedMood && session.mood.toLowerCase() !== selectedMood.toLowerCase()) {
            return false;
        }
        if (selectedSource) {
            const mappedSrc = mapSourceClean(session.modelVersion).toLowerCase();
            if (mappedSrc !== selectedSource.toLowerCase()) {
                return false;
            }
        }
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (new Date(session.createdAt) < start) return false;
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (new Date(session.createdAt) > end) return false;
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const moodMatch = session.mood.toLowerCase().includes(q);
            const explanationMatch = session.explanation && session.explanation.toLowerCase().includes(q);
            const dateMatch = new Date(session.createdAt).toLocaleDateString().toLowerCase().includes(q);
            if (!moodMatch && !explanationMatch && !dateMatch) return false;
        }
        return true;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
    const paginatedSessions = filteredSessions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Export PDF
    const exportPDF = () => {
        const printWindow = window.open("", "_blank");
        const dateStr = new Date().toLocaleDateString();
        const sessionsRows = filteredSessions.map(s => {
            const src = mapSourceClean(s.modelVersion);
            const time = new Date(s.createdAt).toLocaleString();
            return `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; font-family: 'Times New Roman', Times, serif;">${s.mood.toUpperCase()}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; font-family: 'Times New Roman', Times, serif;">${src}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; font-family: 'Times New Roman', Times, serif;">${time}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; font-family: 'Times New Roman', Times, serif;">${s.explanation || "No biometric or text cues."}</td>
                </tr>
            `;
        }).join("");

        printWindow.document.write(`
            <html>
                <head>
                    <title>Melody - Personal Mood Journal</title>
                    <style>
                        body { font-family: 'Times New Roman', Times, serif; color: #000; padding: 40px; }
                        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
                        .logo-area { display: flex; align-items: center; gap: 10px; }
                        .logo-text { font-size: 24px; font-weight: bold; }
                        .meta-info { text-align: right; font-size: 14px; }
                        h1 { text-align: center; margin-bottom: 30px; font-size: 28px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background-color: #f5f5f5; padding: 12px; text-align: left; border-bottom: 2px solid #000; font-family: 'Times New Roman', Times, serif; }
                    </style>
                </head>
                <body>
                     <div class="header">
                         <div class="logo-area">
                             <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style="color: #000;">
                                 <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                             </svg>
                             <span class="logo-text">MELODY</span>
                         </div>
                         <div class="meta-info">
                             <p><strong>Username:</strong> ${user?.name || "Member"}</p>
                             <p><strong>Generated:</strong> ${dateStr}</p>
                         </div>
                     </div>
                     <h1>PERSONAL MOOD HISTORY JOURNAL</h1>
                     <table>
                         <thead>
                             <tr>
                                 <th>EMOTION</th>
                                 <th>SOURCE</th>
                                 <th>TIMESTAMP</th>
                                 <th>METRIC LOGS</th>
                             </tr>
                         </thead>
                         <tbody>
                             ${sessionsRows}
                         </tbody>
                     </table>
                     <script>
                         window.onload = function() {
                             window.print();
                             window.close();
                         };
                     </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Export CSV
    const exportCSV = () => {
        const headers = ["ID", "Mood", "Confidence", "Source", "Date", "Explanation"];
        const rows = filteredSessions.map(s => [
            s._id,
            s.mood,
            s.confidence !== undefined && s.confidence !== null ? s.confidence : "",
            mapSourceClean(s.modelVersion),
            new Date(s.createdAt).toISOString(),
            s.explanation || ""
        ]);
        const csvContent = [headers, ...rows].map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `melody_mood_history_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Export JSON
    const exportJSON = () => {
        const blob = new Blob([JSON.stringify(filteredSessions, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `melody_mood_history_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-cyan-400 font-bold tracking-widest uppercase text-xs">Retrieving Memories...</p>
                </div>
            </div>
        );
    }

    // Chart distribution compilation
    const distData = timeframe === "weekly" ? analytics.weeklyDistribution : analytics.monthlyDistribution;
    const chartEntries = Object.entries(distData || {})
        .map(([mood, count]) => ({ mood, count }))
        .sort((a, b) => b.count - a.count);
    const totalDistCount = chartEntries.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <div className="min-h-screen text-white p-8 max-w-7xl mx-auto space-y-12">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-5xl font-bold mb-2 cursive text-white/90">Your Emotional Journey</h1>
                    <p className="text-gray-400">Personal analytics, listening trends, and memory timeline.</p>
                </div>
                <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
                    <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                        <button onClick={exportPDF} className="px-4 py-2 rounded-lg text-xs font-bold bg-white/5 hover:bg-cyan-400 hover:text-black transition">PDF</button>
                        <button onClick={exportCSV} className="px-4 py-2 rounded-lg text-xs font-bold bg-white/5 hover:bg-cyan-400 hover:text-black transition">CSV</button>
                        <button onClick={exportJSON} className="px-4 py-2 rounded-lg text-xs font-bold bg-white/5 hover:bg-cyan-400 hover:text-black transition">JSON</button>
                    </div>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="px-6 py-2 rounded-full border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all duration-500 font-bold cyan-aura text-sm shrink-0"
                    >
                        ← Dashboard
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-xl">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Total Sessions</p>
                    <p className="text-4xl font-bold text-cyan-400">{analytics.totalSessions}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-xl">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Peak Frequency</p>
                    <p className="text-3xl font-bold text-white uppercase truncate">{analytics.mostFrequentMood}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-xl">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Current Streak</p>
                    <p className="text-4xl font-bold text-cyan-400">{analytics.streak} <span className="text-xs text-gray-400 font-light font-sans">days</span></p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-xl">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Mood Diversity</p>
                    <p className="text-4xl font-bold text-white">{analytics.diversity} <span className="text-xs text-gray-400 font-light font-sans">emotions</span></p>
                </div>
            </div>

            {/* Charts & AI Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Mood Trends */}
                <div className="lg:col-span-2 bg-[#0d1220]/60 border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <h2 className="text-lg font-bold text-white tracking-widest uppercase">Mood Distribution</h2>
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                            <button
                                onClick={() => setTimeframe("weekly")}
                                className={`px-4 py-1.5 rounded-lg font-bold transition ${timeframe === "weekly" ? "bg-cyan-400 text-black" : "text-gray-400"}`}
                            >
                                Weekly
                            </button>
                            <button
                                onClick={() => setTimeframe("monthly")}
                                className={`px-4 py-1.5 rounded-lg font-bold transition ${timeframe === "monthly" ? "bg-cyan-400 text-black" : "text-gray-400"}`}
                            >
                                Monthly
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {chartEntries.length === 0 ? (
                            <p className="text-sm text-gray-500 italic py-10 text-center">No trend data available for this range.</p>
                        ) : (
                            chartEntries.map((item) => {
                                const pct = totalDistCount > 0 ? Math.round((item.count / totalDistCount) * 100) : 0;
                                return (
                                    <div key={item.mood} className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                            <span className="text-gray-300">{item.mood}</span>
                                            <span className="text-cyan-400">{item.count} sessions ({pct}%)</span>
                                        </div>
                                        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-cyan-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right: Insights & Music */}
                <div className="space-y-8">
                    {/* Personal AI Insights */}
                    <div className="bg-[#0d1220]/60 border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                        <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-bold border-b border-white/5 pb-4">Personal Insights</h2>
                        <ul className="space-y-4">
                            {analytics.aiInsights.map((insight, idx) => (
                                <li key={idx} className="text-sm text-gray-300 leading-relaxed flex gap-3">
                                    <span className="text-cyan-400 select-none">•</span>
                                    <span>{insight}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Listening Insights */}
                    <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                        <h2 className="text-xs uppercase tracking-widest text-white font-bold border-b border-white/5 pb-4">Music Insights</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] uppercase text-gray-500 font-bold mb-2">Favorite Genres</p>
                                <div className="flex flex-wrap gap-2">
                                    {analytics.topGenres.slice(0, 3).map((g) => (
                                        <span key={g.name} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-cyan-400 font-bold">
                                            {g.name}
                                        </span>
                                    ))}
                                    {analytics.topGenres.length === 0 && <span className="text-xs text-gray-500 italic">No genres recorded yet.</span>}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-gray-500 font-bold mb-1.5">Top Recommended Artists</p>
                                <ul className="text-xs space-y-1.5 text-gray-300">
                                    {analytics.topArtists.slice(0, 3).map((a) => (
                                        <li key={a.name} className="truncate">• {a.name} ({a.count} counts)</li>
                                    ))}
                                    {analytics.topArtists.length === 0 && <li className="text-gray-500 italic">No artists recorded yet.</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Liked Songs Panel */}
            <div className="bg-[#0d1220]/60 border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                <h2 className="text-lg font-bold text-white tracking-widest uppercase flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Bookmarked Frequencies ({likedSongs.length})
                </h2>
                {likedSongs.length === 0 ? (
                    <p className="text-xs text-gray-500 italic py-6">Your bookmarked collection is empty. Heart songs on the dashboard to build your list.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {likedSongs.map((song, songIdx) => (
                            <div
                                key={song.title + song.artist + songIdx}
                                className="bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-cyan-400/20 transition-all flex flex-col justify-between"
                            >
                                <div className="flex gap-4 items-center mb-3">
                                    {song.coverImage && (
                                        <img 
                                            src={song.coverImage} 
                                            alt={song.album} 
                                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                                        />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-sm mb-0.5 truncate text-white" title={song.title}>{song.title}</h3>
                                        <p className="text-xs text-cyan-400 truncate">{song.artist}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <p className="text-[10px] text-gray-500 truncate">Album: {song.album}</p>
                                    <div className="flex gap-3 mt-1 items-center justify-between">
                                        <div className="flex gap-3">
                                            {song.previewUrl && (
                                                <a 
                                                    href={song.previewUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-[10px] bg-white/10 hover:bg-cyan-400 hover:text-black text-white px-2.5 py-1 rounded-full transition-colors"
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
                                                    Apple Music
                                                </a>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleLikeToggle(song)}
                                            className="text-red-500 hover:text-gray-400 transition-colors p-1"
                                            title="Remove Like"
                                        >
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Search & Filters */}
            <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Mood Select */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Mood Profile</label>
                        <select
                            value={selectedMood}
                            onChange={(e) => setSelectedMood(e.target.value)}
                            className="w-full bg-[#0a0f1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none transition-colors"
                        >
                            <option value="">All moods</option>
                            {["happy", "sad", "angry", "calm", "energetic", "neutral", "stressed", "excited", "lonely", "relaxed", "romantic", "focus"].map(m => (
                                <option key={m} value={m}>{m.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    {/* Source Select */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Input Source</label>
                        <select
                            value={selectedSource}
                            onChange={(e) => setSelectedSource(e.target.value)}
                            className="w-full bg-[#0a0f1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none transition-colors"
                        >
                            <option value="">All sources</option>
                            {["manual", "chat", "camera", "hybrid"].map(s => (
                                <option key={s} value={s}>{s.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-[#0a0f1a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none transition-colors"
                        />
                    </div>

                    {/* End Date */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-[#0a0f1a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Search Timeline Logs</label>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by keyword, date, or emotional markers..."
                        className="w-full bg-[#0a0f1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
                <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold pl-2">Timeline Logs</h2>
                {paginatedSessions.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                        <p className="text-gray-500 italic">No timeline entries found matching current criteria.</p>
                    </div>
                ) : (
                    <div className="space-y-12 pb-20">
                        {paginatedSessions.map((session) => (
                            <div
                                key={session._id}
                                className="relative group lg:pl-12 border-l border-white/10 hover:border-cyan-400/50 transition-colors"
                            >
                                <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-cyan-400 transition-colors"></div>

                                <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl border border-white/5 group-hover:bg-white/[0.07] transition-all relative">
                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleDelete(session._id)}
                                        className="absolute top-8 right-8 p-3 rounded-full bg-red-400/10 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-400 hover:text-white transition-all duration-300"
                                        title="Delete Session"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>

                                    <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4 pr-12">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className="text-3xl font-bold capitalize text-white">{session.mood}</span>
                                                <span className="text-[10px] uppercase tracking-widest px-2 py-1 bg-cyan-400/10 text-cyan-400 rounded-md border border-cyan-400/20 font-bold">
                                                    {mapSourceClean(session.modelVersion)} Scan
                                                </span>
                                                {session.confidence !== undefined && session.confidence !== null && (
                                                    <span className="text-[10px] font-mono tracking-widest px-2.5 py-1 bg-white/10 text-gray-300 rounded-md border border-white/10 font-bold">
                                                        {Math.round(session.confidence * 100)}% match
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 font-mono mb-3">
                                                {new Date(session.createdAt).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(session.createdAt).toLocaleTimeString()}
                                            </p>
                                            {session.explanation && (
                                                <p className="text-xs text-gray-400 italic max-w-2xl border-l-2 border-cyan-400/20 pl-3 leading-relaxed">
                                                    Insight: {session.explanation}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-start">
                                        <button
                                            onClick={() => toggleSessionSongs(session._id)}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:text-cyan-400 text-xs font-bold uppercase tracking-wider transition-all duration-300"
                                        >
                                            {expandedSessions[session._id] ? (
                                                <>
                                                    <span>Hide Playlist</span>
                                                    <svg className="w-4 h-4 transform rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </>
                                            ) : (
                                                <>
                                                    <span>View Playlist</span>
                                                    <svg className="w-4 h-4 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {expandedSessions[session._id] && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden mt-6"
                                            >
                                                {songsLoading[session._id] ? (
                                                    <div className="flex items-center gap-3 py-6 justify-center text-cyan-400 text-xs font-mono uppercase">
                                                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                                                        Retrieving playlist frequencies...
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                                                        {(sessionSongs[session._id] || []).map((song, songIdx) => (
                                                            <div
                                                                key={song.title + song.artist + songIdx}
                                                                className="bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-cyan-400/20 transition-all flex flex-col justify-between"
                                                            >
                                                                <div className="flex gap-4 items-center mb-3">
                                                                    {song.coverImage && (
                                                                        <img 
                                                                            src={song.coverImage} 
                                                                            alt={song.album} 
                                                                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                                                                        />
                                                                    )}
                                                                    <div className="min-w-0 flex-1">
                                                                        <h3 className="font-bold text-sm mb-0.5 truncate text-white" title={song.title}>{song.title}</h3>
                                                                        <p className="text-xs text-cyan-400 truncate">{song.artist}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col gap-2">
                                                                    <p className="text-[10px] text-gray-500 truncate">Album: {song.album}</p>
                                                                    <div className="flex gap-3 mt-1 items-center justify-between">
                                                                        <div className="flex gap-3">
                                                                            {song.previewUrl && (
                                                                                <a 
                                                                                    href={song.previewUrl} 
                                                                                    target="_blank" 
                                                                                    rel="noopener noreferrer" 
                                                                                    className="text-[10px] bg-white/10 hover:bg-cyan-400 hover:text-black text-white px-2.5 py-1 rounded-full transition-colors"
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
                                                                                    Apple Music
                                                                                </a>
                                                                            )}
                                                                        </div>
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
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8 pb-20">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400 hover:text-cyan-400 transition text-xs font-bold disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-white"
                    >
                        Previous
                    </button>
                    <span className="text-xs font-mono text-gray-400">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400 hover:text-cyan-400 transition text-xs font-bold disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-white"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {idToDelete && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIdToDelete(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-[#0a0f1a] border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
                        >
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 blur-[80px] rounded-full"></div>

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-20 h-20 bg-red-400/10 rounded-full flex items-center justify-center mb-6 border border-red-400/20">
                                    <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-white">Erase this memory?</h3>
                                <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                                    By proceeding, you will permanently remove this session from your frequency history. This action cannot be reversed.
                                </p>

                                <div className="flex flex-col gap-3 w-full">
                                    <button
                                        onClick={confirmDelete}
                                        className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                                    >
                                        Delete Permanently
                                    </button>
                                    <button
                                        onClick={() => setIdToDelete(null)}
                                        className="w-full py-4 bg-white/5 text-gray-400 rounded-2xl font-bold hover:bg-white/10 transition-all border border-white/5"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default History;
