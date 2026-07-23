# -------------------------
# BASE IMAGE
# -------------------------
FROM node:20-bullseye

# -------------------------
# SYSTEM DEPENDENCIES
# -------------------------
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# -------------------------
# WORKDIR
# -------------------------
WORKDIR /app

# -------------------------
# COPY PROJECT
# -------------------------
COPY backend ./backend
COPY frontend ./frontend
COPY ml ./ml

# -------------------------
# BACKEND SETUP
# -------------------------
WORKDIR /app/backend
RUN npm install

# -------------------------
# FRONTEND SETUP
# -------------------------
WORKDIR /app/frontend
RUN npm install

# -------------------------
# ML SETUP (CLEAN VENV)
# -------------------------
WORKDIR /app/ml

# create virtual environment
RUN python3 -m venv venv

# upgrade pip
RUN ./venv/bin/pip install --upgrade pip setuptools wheel

# remove conflicting installs (safe)
RUN ./venv/bin/pip uninstall -y tensorflow keras || true

# install compatible versions
RUN ./venv/bin/pip install \
    tensorflow==2.13.0 \
    keras==2.13.1 \
    deepface==0.0.79 \
    flask \
    opencv-python \
    numpy

# -------------------------
# EXPOSE PORTS
# -------------------------
EXPOSE 5000 5001 5173

# -------------------------
# START ALL SERVICES
# -------------------------
WORKDIR /app

CMD bash -c "\
cd ml && ./venv/bin/python run.py & \
cd backend && npm run dev & \
cd frontend && npm run dev & \
wait"