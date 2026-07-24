# Mood-to-Music Engine

Mood-to-Music is a premium full-stack web application that uses Artificial Intelligence and Machine Learning to detect your current emotion—either through a facial expression capture via webcam or by analyzing written text—and instantly recommends a tailored music playlist matching your mood.

---

## 1. Project Overview & Architecture

Following the architectural cleanup, the project has been simplified to run as three independent services on the host machine, removing all containerization (Docker) and orchestration (Ansible) layers:

1. **Frontend (React + Vite)**: A responsive single-page application styled using Tailwind CSS and Framer Motion. It leverages WebGL (Three.js and React Three Fiber) for state-of-the-art neon instrument animations and interactive canvas particle networks.
2. **Backend API (Node.js + Express)**: A central orchestration server that handles user registration/login, session history tracking, and coordinates request routing.
   - For **text-based mood analysis**, the backend directly requests sentiment classifications from the **Groq Llama 3.1 API**.
   - For **music recommendations**, the backend requests real-time catalog tracks from the **Deezer API** and normalizes them.
3. **Camera ML Service (Python + Flask)**: A lightweight Python microservice that utilizes **DeepFace** and **OpenCV** to decode Base64 webcam streams, detect facial expressions, and return the dominant emotion.
4. **Database (MongoDB)**: Used to store user credentials and user mood history sessions.

```
+-------------------------------------------------------------------------------+
|                                React Frontend                                 |
|                              (Vite @ Port 5173)                               |
+---------------------------------------+---------------------------------------+
                                        |
                                        | (HTTP Requests)
                                        v
+-------------------------------------------------------------------------------+
|                                Express Backend                                |
|                             (Node.js @ Port 5000)                             |
+-------+-------------------+--------------------+-----------------------+------+
        |                   |                    |                       |
        | (Local DB Ops)    | (Local HTTP POST)  | (HTTPS API Call)      | (HTTPS API Call)
        v                   v                    v                       v
+---------------+   +-------------------+   +------------+      +------------------+
|    MongoDB    |   |     Camera ML     |   |  Groq API  |      |    Deezer API    |
|  (Port 27017) |   | (Flask @ Port 5001|   | (Llama 3.1)|      | (Real-time Music)|
+---------------+   +-------------------+   +------------+      +------------------+
```

---

## 2. Prerequisites

Ensure you have the following software installed on your local machine:
- **Node.js**: `v18.0.0` or higher
- **Python**: `v3.9` to `v3.11` (specifically required for DeepFace and TensorFlow compatibility)
- **MongoDB**: Local MongoDB Community Server or a MongoDB Atlas account

---

## 3. Environment Variables & Configurations

### A. Backend Environment Variables
Create a file named `.env` in the `backend` directory:
- Path: `backend/.env`

Add the following environment variables:
```env
# Server Port Configuration
PORT=5000

# MongoDB Connection String (Local example or Atlas URI)
MONGO_URI=mongodb://localhost:27017/mood_to_music

# JSON Web Token Secret
JWT_SECRET=your_jwt_secret_key_here

# Groq Cloud API Key (for Llama 3.1 text mood analysis)
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### B. Frontend Environment Variables
By default, the frontend automatically falls back to `http://localhost:5000/api`. If your backend runs on a different port, create a file named `.env` in the `frontend` directory:
- Path: `frontend/.env`

Required content:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 4. Setup and Startup Instructions

Please start the services in the following order:

### Step 1: Start MongoDB
- **Local MongoDB**: Ensure the MongoDB service is running on your machine. Usually, it starts automatically on port `27017`.
- **MongoDB Atlas (Cloud)**: If using MongoDB Atlas, go to the Atlas Console, whitelist your IP address, generate a connection URI, and copy it into the `MONGO_URI` field in `backend/.env`.

### Step 2: Set Up & Start the Camera ML Service
1. Open a terminal and navigate to the `ml` folder:
   ```bash
   cd ml
   ```
2. Create a Python virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows (PowerShell)**: `.\venv\Scripts\Activate.ps1`
   - **Windows (CMD)**: `.\venv\Scripts\activate.bat`
   - **Linux/macOS**: `source venv/bin/activate`
4. Install the required Python dependencies:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
5. Launch the service:
   ```bash
   python run.py
   ```
   *The Flask service starts on `http://localhost:5001`.*

### Step 3: Set Up & Start the Backend
1. Open a new terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install the packages:
   ```bash
   npm install
   ```
3. Start the Express backend server in development mode:
   ```bash
   npm run dev
   ```
   *The API server starts on `http://localhost:5000`.*

### Step 4: Set Up & Start the Frontend
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The client UI runs on `http://localhost:5173`.*

---

## 5. Verification & Testing

Once all four services are running, perform these manual tests to verify full functionality:

1. **User Registration & Login**:
   - Go to `http://localhost:5173/register` and sign up a new account.
   - Test logging in at `http://localhost:5173/login` with your new credentials.
2. **Manual Emotion Selection**:
   - On the dashboard, click on the **Manual Mood Selector** buttons (Happy, Sad, Calm, etc.) to trigger recommended playlist cards.
3. **Chat Emotion Analysis (Text Analysis via Groq)**:
   - Navigate to the chat inputs section on the dashboard, type a text query expressing a mood (e.g., *"I had a wonderful day today!"* or *"I am feeling so stressed and tired"*), and submit it.
   - Verify that the Llama model maps it to a valid emotion and displays recommendations.
4. **Webcam Detection (Camera ML)**:
   - Grant webcam permissions in the browser, allow the feed to load on the dashboard camera container, and capture a photo.
   - Verify that the Flask service parses the image and displays the correct emotion recommended tracks.
5. **History Tracking**:
   - Go to the **History** tab in the navbar.
   - Verify that all your previous captures, manual selections, and chat emotions are recorded with timestamps, recommended playlists, and model classifications. You should also be able to delete historical records.

---

## 6. Common Setup Errors & Troubleshooting

- **Error: `Database connection failed` or `MONGO_URI not specified`**
  - *Fix*: Make sure you created `backend/.env` file in the correct path and copy-pasted a valid database connection string in `MONGO_URI`. If MongoDB is local, verify the service is running (`net start MongoDB` on Windows).
  
- **Error: `DeepFace.analyze` fails or camera ML returns `neutral` constantly**
  - *Fix*: On the first camera capture, DeepFace downloads visual weights files (e.g., VGG-Face) from the web to `~/.deepface/weights/`. Ensure you have a stable internet connection for the first run.
  
- **Error: Python libraries compile failure**
  - *Fix*: Ensure your Python version is compatible (`3.9`, `3.10`, or `3.11`). DeepFace and TensorFlow binaries may fail to build or compile on newer Python runtimes like `3.12` or `3.13`.
  
- **Error: `AI Analysis failed` on Text Input**
  - *Fix*: Check that `GROQ_API_KEY` is specified in `backend/.env` and has valid quotas. The local fallback BERT system has been completely decommissioned; the app relies solely on Groq for text classification.
