import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import noelPic from "../assets/noel.jpg";

export default function Home() {
    const navigate = useNavigate();
    const [showCreatorModal, setShowCreatorModal] = useState(false);

    return (
        <div className="min-h-screen text-white selection:bg-cyan-500/30">
            {/* Navigation Header */}
            <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-12 py-8 backdrop-blur-sm bg-black/20">
                <div className="text-2xl font-bold tracking-tighter flex items-center gap-2 group cursor-pointer">
                    <svg className="w-8 h-8 text-cyan-400 block drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                    <span className="text-white tracking-[0.2em] text-sm font-bold opacity-80">MELODY</span>
                </div>
                <div className="flex gap-6 items-center">
                    <button
                        onClick={() => setShowCreatorModal(true)}
                        className="px-5 py-2 rounded-full border border-cyan-400/40 bg-cyan-400/5 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all duration-300 font-bold text-xs tracking-widest shadow-lg shrink-0"
                    >
                        About Creator
                    </button>
                    <button
                        onClick={() => navigate("/login")}
                        className="px-6 py-2 rounded-full border border-white/20 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300 font-medium text-white shadow-lg cyan-aura"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => navigate("/register")}
                        className="px-6 py-2 rounded-full bg-black text-white hover:bg-cyan-400 hover:text-black transition-all duration-300 font-bold shadow-[0_0_20px_rgba(0,229,255,0.4)] cyan-aura"
                    >
                        Register
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="h-screen flex flex-col justify-center items-center text-center px-4 relative">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    className="relative writing-mask"
                >
                    <h1 className="text-8xl md:text-9xl font-normal py-6 outline-none">
                        <span className="cursive block mb-6 px-4 text-white">Soundtrack your</span>
                        <span className="cursive gradient-text block translate-y-[-10px] pb-6 px-4">emotions</span>
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="text-xl text-gray-300 max-w-2xl mb-12 leading-relaxed opacity-80"
                >
                    An AI-powered music recommendation engine that understands how you feel.
                    Shift your frequency, find your rhythm, and let the music do the healing.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.2 }}
                >
                    <button
                        onClick={() => navigate("/register")}
                        className="px-12 py-4 bg-transparent border-2 border-cyan-400 text-cyan-400 text-lg font-bold rounded-full hover:bg-cyan-400 hover:text-black transition-all duration-500 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                    >
                        Start Your Journey
                    </button>
                </motion.div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 animate-bounce text-cyan-400">
                    <span className="text-xs uppercase tracking-[0.3em] font-bold">Explore Features Below</span>
                </div>
            </section>

            {/* Content Sections */}
            <div className="max-w-5xl mx-auto px-6 py-24 space-y-40">
                {/* Platform Overview Header */}
                <section className="border-l-4 border-cyan-400 pl-8">
                    <h3 className="text-cyan-400 font-mono text-sm mb-2 font-bold tracking-widest uppercase">Platform Capabilities</h3>
                    <h2 className="text-5xl font-bold mb-4 text-white leading-tight">Advanced Emotion-Aware Audio Mapping</h2>
                    <p className="text-gray-400 italic">Bridging human sentiment and auditory environments seamlessly.</p>
                </section>

                {/* Features & Specifications Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="space-y-10">
                        <div className="p-8 rounded-3xl bg-cyan-950/10 border border-cyan-400/5 hover:border-cyan-400/20 transition-all duration-300 shadow-xl backdrop-blur-md">
                            <h4 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-3">
                                <span>01.</span> AI Emotion Detection
                            </h4>
                            <p className="text-gray-300 text-base leading-relaxed">
                                Experience multi-modal emotion capture. Instantly detect how you feel through manual selector switches, real-time natural language thoughts processing, or advanced computer vision webcam captures.
                            </p>
                        </div>
                        <div className="p-8 rounded-3xl bg-cyan-950/10 border border-cyan-400/5 hover:border-cyan-400/20 transition-all duration-300 shadow-xl backdrop-blur-md">
                            <h4 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-3">
                                <span>02.</span> Intelligent Music Discovery
                            </h4>
                            <p className="text-gray-300 text-base leading-relaxed">
                                Our engine translates sentiment into sound frequencies. Dynamic playlist selection routes you to personalized tracks, adapting to your emotional shift in real time.
                            </p>
                        </div>
                        <div className="p-8 rounded-3xl bg-cyan-950/10 border border-cyan-400/5 hover:border-cyan-400/20 transition-all duration-300 shadow-xl backdrop-blur-md">
                            <h4 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-3">
                                <span>03.</span> Mood Analytics
                            </h4>
                            <p className="text-gray-300 text-base leading-relaxed">
                                Track your emotional journey over time. Map your feelings on an interactive historical timeline to gain deep mental frequency logs and pattern insights.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-10">
                        <div className="bg-cyan-950/20 p-10 rounded-3xl border border-cyan-400/10 shadow-3xl backdrop-blur-2xl h-full flex flex-col justify-between">
                            <div>
                                <h4 className="text-2xl font-bold text-cyan-400 mb-6 border-b border-cyan-400/20 pb-4">Engine Specifications</h4>
                                <div className="space-y-6 text-sm">
                                    <div>
                                        <span className="text-cyan-400 font-bold block mb-1 uppercase tracking-wider text-xs">Capabilities:</span>
                                        <span className="text-gray-300 text-base">Computer Vision Facial Analysis, Natural Language Understanding, Mood Tracking</span>
                                    </div>
                                    <div>
                                        <span className="text-cyan-400 font-bold block mb-1 uppercase tracking-wider text-xs">AI Inference Stack:</span>
                                        <span className="text-gray-300 text-base">Large Language Models (Groq Llama 3.1), OpenCV Deep Learning Face Models</span>
                                    </div>
                                    <div>
                                        <span className="text-cyan-400 font-bold block mb-1 uppercase tracking-wider text-xs">Privacy-First Standard:</span>
                                        <span className="text-gray-300 text-base">Session-only analytics. Audio streams and sentiment analysis parameters are handled transiently and securely. No personal media data is stored.</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 pt-8 border-t border-cyan-400/10">
                                <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-xs">Engine Features</h4>
                                <div className="flex flex-wrap gap-3">
                                    <span className="text-cyan-400 bg-cyan-400/10 px-3.5 py-1.5 rounded-full text-xs border border-cyan-400/20">• Real-Time Recommendation</span>
                                    <span className="text-cyan-400 bg-cyan-400/10 px-3.5 py-1.5 rounded-full text-xs border border-cyan-400/20">• Secure Auth Shield</span>
                                    <span className="text-cyan-400 bg-cyan-400/10 px-3.5 py-1.5 rounded-full text-xs border border-cyan-400/20">• Interactive WebGL Core</span>
                                    <span className="text-cyan-400 bg-cyan-400/10 px-3.5 py-1.5 rounded-full text-xs border border-cyan-400/20">• Historical Sync logs</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Science of Music Section */}
                <section className="bg-gradient-to-br from-cyan-900/10 to-transparent p-16 rounded-[4rem] border border-cyan-400/10 shadow-2xl">
                    <h3 className="text-4xl font-bold mb-12 cursive text-cyan-400 tracking-wider">The frequency of well-being</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                        <div className="space-y-10 text-gray-200 text-lg leading-relaxed">
                            <p>
                                <strong className="text-cyan-400 italic">Music & Mental Health:</strong> Music has been clinically proven to lower cortisol levels and trigger dopamine release.
                                Our engine acts as a "digital companion" that selects frequencies matching your neurological needs.
                            </p>
                            <div className="p-8 bg-cyan-950/40 rounded-3xl border-l-4 border-cyan-400 shadow-lg">
                                <h5 className="text-cyan-400 font-bold text-xs mb-3 uppercase tracking-widest">Surprising Fact</h5>
                                <p className="text-white italic text-xl">Listening to your favorite music can increase physical endurance by up to 15% during workouts!</p>
                            </div>
                        </div>
                        <ul className="space-y-8">
                            {[
                                {
                                    text: "Reduces anxiety by 65% in targeted studies.",
                                    icon: "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                                },
                                {
                                    text: "Helps in early-stage Alzheimer's memory recall.",
                                    icon: "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V5.12L18 3.5v9.05c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V3l-6 1.12z"
                                },
                                {
                                    text: "Synchronizes heartbeats during group listening.",
                                    icon: "M6 15c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2V7h4v2h-2v10c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4V5h14v2h-4v10c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4V3H4v12h2z"
                                },
                                {
                                    text: "Bypasses conscious thought to reach emotional cores.",
                                    icon: "M12 13.5V21h-2v-7.5c-1.12 0-2.07-.44-2.83-1.17-.76-.73-1.17-1.68-1.17-2.83V3h1.5v6.5c0 .73.25 1.34.76 1.83s1.1.73 1.74.73 1.23-.24 1.74-.73c.51-.49.76-1.1.76-1.83V3h1.5v6.5c0 1.15-.41 2.1-1.17 2.83-.76.73-1.71 1.17-2.83 1.17z"
                                }
                            ].map((fact, i) => (
                                <li key={i} className="flex items-start gap-5 text-gray-300 text-lg text-left">
                                    <svg className="w-6 h-6 text-cyan-400 mt-1 shrink-0 drop-shadow-[0_0_10px_rgba(0,229,255,0.4)]" viewBox="0 0 24 24" fill="currentColor">
                                        <path d={fact.icon} />
                                    </svg>
                                    <span>{fact.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Conclusion & Team */}
                <footer className="pt-32 pb-16 border-t border-white/5 relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-20 text-center md:text-left">
                        <div className="col-span-1 md:col-span-2">
                            <h4 className="text-2xl font-bold mb-8 uppercase tracking-[0.2em] text-white border-b-2 border-cyan-400 w-fit">Vision</h4>
                            <p className="text-gray-400 text-xl max-w-2xl leading-relaxed italic">
                                Melody is designed as a companion to your emotional space. By understanding
                                human sentiment through state-of-the-art artificial intelligence models, we deliver
                                a seamless auditory experience that nurtures and prioritizes your daily mental well-being.
                            </p>
                        </div>
                        <div className="flex flex-col justify-center items-center md:items-end">
                            <span className="text-gray-500 text-sm tracking-wider uppercase font-bold">Created by</span>
                            <span className="text-cyan-400 text-lg font-bold hover:text-white transition-all cursor-default">Noel Ninan Sheri</span>
                        </div>
                    </div>
                    <div className="mt-40 text-center text-[10px] text-cyan-700 font-mono tracking-[0.5em] uppercase">
                        © 2026 Melody | AI-Powered Emotion & Music Orchestration Engine
                    </div>
                </footer>
            </div>

            {/* Custom Creator Dialog Modal */}
            <AnimatePresence>
                {showCreatorModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreatorModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-3xl bg-[#0a0f1a] border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden text-left"
                        >
                            <button
                                onClick={() => setShowCreatorModal(false)}
                                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors p-2 text-xl"
                                title="Close Modal"
                            >
                                ✕
                            </button>

                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                {/* Left Side: Photo */}
                                <div className="w-full md:w-1/2 aspect-square md:aspect-auto md:h-80 rounded-2xl overflow-hidden shrink-0 border border-white/5 shadow-2xl">
                                    <img
                                        src={noelPic}
                                        alt="Noel Ninan Sheri"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Fallback if image isn't placed yet
                                            e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500";
                                        }}
                                    />
                                </div>

                                {/* Right Side: Biography / Motivation */}
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold block mb-1">Hello There!</span>
                                        <h3 className="text-3xl font-bold text-white font-sans">Noel Ninan Sheri</h3>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed text-sm">
                                        I built Melody to bridge the gap between emotional states and music discovery, creating an intelligent space for mental well-being and daily focus. I think a scaled version of this could be used in nurseries, office spaces and cafeterias to analyse the median crowd and people emotions and play background songs or themes accordingly, making a better environment for people.
                                    </p>
                                    <div className="pt-4 border-t border-white/5 flex gap-4">

                                        <span className="text-xs text-gray-500 font-mono">Stack Melody uses: React + Express + OpenCV DeepFace + External API connections for understanding trends.</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
