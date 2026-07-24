from flask import Flask, request, jsonify
from camera.detector import detect_emotion_from_base64

app = Flask(__name__)


@app.route("/detect-emotion", methods=["POST"])
def detect_emotion():

    data = request.json
    image = data.get("image")

    if not image:
        return jsonify({"error": "Image required"}), 400

    res = detect_emotion_from_base64(image)

    if isinstance(res, dict):
        return jsonify(res)
        
    return jsonify({
        "emotion": res,
        "confidence": 0.5
    })


@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "healthy"})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"})


import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    # On Render/Production, bind to all interfaces; locally default to localhost
    host = "0.0.0.0" if os.environ.get("PORT") else "127.0.0.1"
    app.run(host=host, port=port)