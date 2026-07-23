from deepface import DeepFace
import base64
import numpy as np
import cv2


def detect_emotion_from_base64(image_base64):

    try:

        # Remove data URL prefix if present
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]

        img_bytes = base64.b64decode(image_base64)

        nparr = np.frombuffer(img_bytes, np.uint8)

        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # If decoding failed
        if img is None:
            return "neutral"

        result = DeepFace.analyze(
            img,
            actions=["emotion"],
            enforce_detection=False
        )

        emotion = result[0]["dominant_emotion"]

        return emotion

    except Exception as e:

        print("Emotion detection error:", str(e))

        return "neutral"