import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Client-side validation
        if (!name.trim()) {
            setError("Name is required");
            return;
        }

        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/register", {
                name,
                email,
                password,
            });

            // Redirect to login with success message
            navigate("/login", { state: { message: "Account created successfully! Please login." } });
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex">

            <div className="w-1/2"></div>

            <div className="w-1/2 flex items-center justify-center relative z-10">
                <form
                    onSubmit={handleSubmit}
                    className="w-96 bg-black/60 border border-[#00ff88]/30 shadow-[0_0_50px_rgba(0,255,136,0.1)] backdrop-blur-2xl p-10 rounded-2xl"
                >
                    <h2 className="text-3xl font-bold text-[#00ff88] mb-8 tracking-tight text-center">
                        Start Journey
                    </h2>

                    {error && (
                        <p className="text-red-500 mb-4 text-sm bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>
                    )}

                    <input
                        type="text"
                        placeholder="Full Name"
                        required
                        className="w-full mb-4 p-4 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#00ff88] focus:outline-none rounded-xl transition-all"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <input
                        type="email"
                        placeholder="Email Address"
                        required
                        className="w-full mb-4 p-4 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#00ff88] focus:outline-none rounded-xl transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Choose Password"
                        required
                        className="w-full mb-8 p-4 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#00ff88] focus:outline-none rounded-xl transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#00ff88] text-black hover:bg-white hover:text-[#00ff88] font-bold p-4 rounded-xl transition-all duration-500 shadow-[0_0_20px_rgba(0,255,136,0.4)] disabled:opacity-50"
                    >
                        {loading ? "Creating Profile..." : "Create Account"}
                    </button>

                    <p className="text-sm text-gray-400 mt-6 text-center">
                        Already have an account?{" "}
                        <span
                            onClick={() => navigate("/login")}
                            className="text-[#00ff88] cursor-pointer hover:text-white transition-colors underline underline-offset-4"
                        >
                            Sign In
                        </span>
                    </p>
                </form>
            </div>


        </div>
    );
}
