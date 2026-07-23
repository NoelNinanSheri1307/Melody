import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen text-white font-sans selection:bg-cyan-500/30">
            {/* Navigation Header */}
            <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-12 py-8 backdrop-blur-sm bg-black/20">
                <div className="text-2xl font-bold tracking-tighter flex items-center gap-2 group cursor-pointer">
                    <svg className="w-8 h-8 text-cyan-400 block drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                    <span className="text-white tracking-[0.2em] text-sm font-bold opacity-80">MOOD-TO-MUSIC</span>
                </div>
                <div className="flex gap-6">
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
                    <span className="text-xs uppercase tracking-[0.3em] font-bold">Case Study Below</span>
                </div>
            </section>


            {/* Content Sections */}
            <div className="max-w-5xl mx-auto px-6 py-24 space-y-40">

                {/* Case Study Header */}
                <section className="border-l-4 border-cyan-400 pl-8">
                    <h3 className="text-cyan-400 font-mono text-sm mb-2 font-bold tracking-widest uppercase">VIT - School of Computer Science Engineering</h3>
                    <h2 className="text-5xl font-bold mb-4 text-white leading-tight">M.TECH (SE) – Winter Semester 2025-26 SCM Project</h2>
                    <p className="text-gray-400 italic">ISWE403L - Software Configuration Management</p>
                </section>

                {/* Case Study Structure */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
                    <div className="space-y-16">
                        <div>
                            <h4 className="text-2xl font-bold text-cyan-400 mb-6 border-b border-cyan-400/20 pb-2">Introduction</h4>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                Mood-to-Music is a sophisticated web application designed to bridge the gap between human emotions
                                and digital audio libraries. By leveraging modern AI and a robust configuration management plan,
                                it provides personalized auditory experiences.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold text-cyan-400 mb-6 border-b border-cyan-400/20 pb-2">Problem Statement</h4>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                With millions of tracks available online, users often face "decision fatigue" or fail to find
                                music that complements their current emotional state, leading to a disconnected listening experience.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold text-cyan-400 mb-6 border-b border-cyan-400/20 pb-2">Objectives</h4>
                            <ul className="list-disc list-inside text-gray-300 text-lg space-y-4">
                                <li>Real-time mood detection and mapping.</li>
                                <li>Cloud-synced listening history.</li>
                                <li>Scalable architecture using modern tech stack.</li>
                                <li>Strict adherence to SCM practices.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-cyan-950/20 p-12 rounded-3xl border border-cyan-400/10 shadow-3xl backdrop-blur-2xl">
                        <h4 className="text-2xl font-bold text-cyan-400 mb-8 underline decoration-white/10">SCM Plan (SCMP)</h4>
                        <div className="space-y-8 text-base">
                            <div>
                                <span className="text-cyan-400 font-bold block mb-2 uppercase tracking-tighter">Development Tools:</span>
                                <span className="text-gray-300 text-lg italic">Git, GitHub, VS Code, MERN Dev Tools</span>
                            </div>
                            <div>
                                <span className="text-cyan-400 font-bold block mb-2 uppercase tracking-tighter">Advanced Tech Stack:</span>
                                <span className="text-gray-300 text-lg italic">React, Node.js, ML Tools, OpenCV, LLM Integration</span>
                            </div>
                            <div>
                                <span className="text-cyan-400 font-bold block mb-3 uppercase tracking-tighter">Configuration Items (CIs):</span>
                                <ul className="ml-4 mt-3 list-decimal list-inside text-gray-300 space-y-3">
                                    <li>MERN Source Code</li>
                                    <li>Machine Learning Models</li>
                                    <li>SCMP Technical Docs</li>
                                    <li>Comprehensive Test Cases</li>
                                    <li>Automated Build Scripts</li>
                                </ul>
                            </div>
                            <div className="mt-10 pt-10 border-t border-cyan-400/10">
                                <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-sm">SCM Activities</h4>
                                <div className="space-y-4">
                                    <span className="text-cyan-400 bg-cyan-400/10 px-4 py-2 rounded-lg block w-fit border border-cyan-400/20">• Version Control (Gitflow)</span>
                                    <span className="text-cyan-400 bg-cyan-400/10 px-4 py-2 rounded-lg block w-fit border border-cyan-400/20">• Change Control Process</span>
                                    <span className="text-cyan-400 bg-cyan-400/10 px-4 py-2 rounded-lg block w-fit border border-cyan-400/20">• Configuration Audits</span>
                                    <span className="text-cyan-400 bg-cyan-400/10 px-4 py-2 rounded-lg block w-fit border border-cyan-400/20">• Build & Release Management</span>
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
                            <h4 className="text-2xl font-bold mb-8 uppercase tracking-[0.2em] text-white border-b-2 border-cyan-400 w-fit">Conclusion</h4>
                            <p className="text-gray-400 text-xl max-w-2xl leading-relaxed italic">
                                Mood-to-Music is not just a player; it's a testament to how Software Configuration Management
                                ensures the reliability of emotionally-driven technology. By managing every change with precision,
                                we deliver a seamless experience that prioritizes mental well-being.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold mb-10 text-white border-b-2 border-cyan-400 w-fit uppercase tracking-widest">Team</h4>
                            <div className="space-y-4 text-white text-xl text-left pl-0 md:pl-10">
                                <p className="hover:text-cyan-400 transition-all cursor-default">Noel Ninan Sheri</p>
                                <p className="hover:text-cyan-400 transition-all cursor-default">Amal Sumesh</p>
                                <p className="hover:text-cyan-400 transition-all cursor-default">Kaarthik M</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-40 text-center text-[10px] text-cyan-700 font-mono tracking-[0.5em] uppercase">
                        © 2026 Mood-to-Music | Software Config Management Study | Vit University
                    </div>
                </footer>
            </div>
        </div>
    );
}
