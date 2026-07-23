import os
import gdown

MODEL_URL = "https://drive.google.com/drive/folders/1W2M86I5r18kboy1jGrAMZN4N8Uy4MUu6?usp=drive_link"
OUTPUT_DIR = "ml/public/emotion_bert_multilabel"

os.makedirs(OUTPUT_DIR, exist_ok=True)

print("Downloading model...")

gdown.download_folder(
    MODEL_URL,
    output=OUTPUT_DIR,
    quiet=False
)

print("Model downloaded successfully.")