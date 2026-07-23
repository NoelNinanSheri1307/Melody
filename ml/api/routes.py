from flask import jsonify, request
from camera.detector import detect_emotion_from_image


def register_routes(app):

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ML service running"}), 200

    @app.route("/detect", methods=["POST"])
    def detect():
        data = request.json
        image = data.get("image")

        if not image:
            return jsonify({"error": "No image provided"}), 400

        emotion = detect_emotion_from_image(image)

        return jsonify({"emotion": emotion}), 200