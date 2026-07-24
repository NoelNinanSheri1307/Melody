import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const successMessage = location.state?.message;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { data } = await api.post("/auth/login", {
                email,
                password,
            });

            login(data);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">

            {/* Left empty space for 3D scene */}
            <div className="w-1/2"></div>

            {/* Right side form */}
            <div className="w-1/2 flex items-center justify-center relative z-10">
                <form
                    onSubmit={handleSubmit}
                    className="w-96 bg-black/60 border border-[#ffff00]/20 shadow-[0_0_50px_rgba(255,255,100,0.1)] backdrop-blur-2xl p-10 rounded-2xl"
                >
                    <h2 className="text-3xl font-bold text-[#ffff00] mb-8 tracking-tight text-center">
                        Welcome Back
                    </h2>

                    {successMessage && (
                        <p className="text-[#ffff00] mb-4 text-sm bg-[#ffff00]/10 p-2 rounded border border-[#ffff00]/20 text-center">
                            {successMessage}
                        </p>
                    )}

                    {error && (
                        <p className="text-red-500 mb-4 text-sm bg-red-500/10 p-2 rounded border border-red-500/20 text-center">
                            {error}
                        </p>
                    )}

                    <input
                        type="email"
                        placeholder="Email Address"
                        required
                        className="w-full mb-4 p-4 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#ffff00] focus:outline-none rounded-xl transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Security Key"
                        required
                        className="w-full mb-8 p-4 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#ffff00] focus:outline-none rounded-xl transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#ffff00] text-black hover:bg-white hover:text-[#ffff00] font-bold p-4 rounded-xl transition-all duration-500 shadow-[0_0_20px_rgba(255,255,0,0.3)] disabled:opacity-50"
                    >
                        {loading ? "Authenticating..." : "Sign In"}
                    </button>

                    <p className="text-sm text-gray-400 mt-6 text-center">
                        New here?{" "}
                        <span
                            onClick={() => navigate("/register")}
                            className="text-[#ffff00] cursor-pointer hover:text-white transition-colors underline underline-offset-4"
                        >
                            Create an account
                        </span>
                    </p>

                    <div className="mt-8 text-center border-t border-white/5 pt-6">
                        <span
                            onClick={() => navigate("/")}
                            className="text-xs text-gray-500 cursor-pointer hover:text-[#ffff00] transition-colors"
                        >
                            ← Back to Main Page
                        </span>
                    </div>
                </form>
            </div>


        </div>
    );
}

export default Login;
