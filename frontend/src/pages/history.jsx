import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

function History() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [idToDelete, setIdToDelete] = useState(null);
    const [expandedSessions, setExpandedSessions] = useState({});
    const [sessionSongs, setSessionSongs] = useState({});
    const [songsLoading, setSongsLoading] = useState({});
    const navigate = useNavigate();
    const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace("/api", "");

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await api.get("/mood/history");
                setSessions(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

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
        } catch (error) {
            console.error("Failed to delete session:", error);
            alert("Could not remove the session. Please try again.");
        } finally {
            setIdToDelete(null);
        }
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

    return (
        <div className="min-h-screen text-white p-8 max-w-7xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-5xl font-bold mb-2 cursive text-white/90">Your Emotional Journey</h1>
                    <p className="text-gray-400">A timeline of your musical frequency shifts.</p>
                </div>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="px-6 py-2 rounded-full border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all duration-500 font-bold cyan-aura"
                >
                    ← Back to Dashboard
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Total Sessions</p>
                    <p className="text-4xl font-bold text-cyan-400">{sessions.length}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Primary Frequency</p>
                    <p className="text-3xl font-bold text-white uppercase truncate">
                        {sessions.length > 0 ? sessions[0].mood : "None"}
                    </p>
                </div>
                <div className="bg-cyan-400/10 border border-cyan-400/20 p-6 rounded-[2rem] backdrop-blur-xl flex items-center justify-center text-center">
                    <p className="text-xs text-cyan-400 font-medium italic">"Music is the shorthand of emotion."</p>
                </div>
            </div>

            {sessions.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                    <p className="text-gray-500 italic">No history found. Start your first session from the dashboard.</p>
                </div>
            ) : (
                <div className="space-y-12 pb-20">
                    {sessions.map((session, index) => (
                        <div
                            key={session._id}
                            className="relative group lg:pl-12 border-l border-white/10 hover:border-cyan-400/50 transition-colors"
                        >
                            {/* Simple timeline dot */}
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

                                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4 pr-12">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-3xl font-bold capitalize text-white">{session.mood}</span>
                                            <span className="text-[10px] uppercase tracking-widest px-2 py-1 bg-cyan-400/10 text-cyan-400 rounded-md border border-cyan-400/20 font-bold">
                                                Pattern Detected
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 font-mono">
                                            {new Date(session.createdAt).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(session.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <div className="text-right hidden md:block">
                                        <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-bold">EMOTION ENGINE v1.2</p>
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
                                                                <div className="flex gap-3 mt-1">
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
