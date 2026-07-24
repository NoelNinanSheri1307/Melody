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


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ML service running"})


if __name__ == "__main__":
    app.run(port=5001)