# Mood-to-Music

Mood-to-Music is a full-stack web application that uses Machine Learning to detect your current emotion through your camera and suggests the perfect music playlist to match your mood.

---

##  Key Features

- **Real-time Emotion Detection**: Uses advanced ML models (DeepFace) to analyze facial expressions.
- **Dynamic Music Suggestion**: Smart mapping of emotions to music genres (Happy, Sad, Energetic, Calm, etc.).
- **Mood History Tracking**: Save and track your emotional trends over time.
- **Interactive Dashboard**: Sleek and modern UI for a seamless user experience.
- **Secure Authentication**: JWT-based user login and registration.

---

## Technology Stack

### **Frontend**
- **React (Vite)**: For a fast and responsive user interface.
- **Tailwind CSS**: Modern styling with utility-first classes.
- **Framer Motion**: Smooth animations and transitions.
- **Three.js / React Three Fiber**: (Detected in dependencies) Used for potential 3D visual effects.

### **Backend**
- **Node.js & Express**: High-performance server-side logic.
- **MongoDB & Mongoose**: Scalable NoSQL database for user data and history.
- **Axios**: For cross-service communication.

### **Machine Learning**
- **Python (Flask)**: Lightweight API for handling ML tasks.
- **DeepFace**: A powerful deep learning facial analysis library.
- **OpenCV**: Image processing and computer vision.

---

## Project Structure

```bash
mood-to-music/
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── pages/     # Dashboard, History, Login, etc.
│   │   ├── components/# Reusable UI elements
│   │   └── api/       # Frontend service calls
├── backend/           # Node.js + Express server
│   ├── models/        # Mongoose schemas (User, History)
│   ├── routes/        # API endpoints
│   ├── controllers/   # Business logic
│   └── services/      # ML and external integrations
└── ml/                # Python Flask service
    ├── camera/        # Emotion detection logic
    ├── api/           # Flask routes
    └── run.py         # ML Service entry point
```

---

## Getting Started

Follow these steps to get the project running locally.

### **Prerequisites**
- **Node.js** (v18+)
- **Python** (v3.9+)
- **MongoDB** (Local or Atlas)

---

### **1. Setup ML Service**
Navigate to the `ml` folder and set up a virtual environment.

```bash
cd ml
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install flask deepface tf-keras opencv-python numpy
python run.py
```
*The ML service will run on `http://localhost:5001`.*

---

### **2. Setup Backend Server**
Navigate to the `backend` folder and install dependencies.

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
```

Start the backend:
```bash
npm run dev
```
*The backend will run on `http://localhost:5000`.*

---

### **3. Setup Frontend**
Navigate to the `frontend` folder and install dependencies.

```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:5173` (default Vite port).*

---

## API Endpoints (Highlights)

### **ML Service**
- `POST /detect-emotion`: Analyzes a base64 image and returns the dominant emotion.

### **Backend**
- `POST /api/auth/register`: User registration.
- `POST /api/auth/login`: User login.
- `POST /api/camera/detect`: Process image and save mood history.
- `GET /api/history`: Retrieve user's mood history.

---

## Design Aesthetics
The project uses a **Premium Dark Mode** design with **Glassmorphism** effects and **Dynamic Animations** to provide a futuristic feel.

---

## License
This project is licensed under the ISC License.
