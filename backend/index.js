require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const moodRoutes = require("./routes/moodRoutes");
const cameraRoutes = require("./routes/cameraRoutes");
const app = express();

connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or locally initiated requests with no origin header
    if (!origin) return callback(null, true);
    
    const isExplicitlyAllowed = allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*");
    const isVercelPreview = /\.vercel\.app$/.test(origin);

    if (isExplicitlyAllowed || isVercelPreview) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/camera", cameraRoutes);
app.get("/", (req, res) => {
  res.send("Noel's Melody API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});