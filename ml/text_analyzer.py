import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from fastapi import FastAPI
from pydantic import BaseModel
from datasets import load_dataset

app = FastAPI()

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

MODEL_PATH = "./public/emotion_bert_multilabel"

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)

model.to(device)
model.eval()

dataset = load_dataset("go_emotions")
label_names = dataset["train"].features["labels"].feature.names
id_to_label = {i: label_names[i] for i in range(len(label_names))}

emotion_map = {
    'joy': 'happy',
    'sadness': 'sad',
    'anger': 'angry',
    'fear': 'neutral',
    'disgust': 'angry',
    'surprise': 'energetic',
    'admiration': 'happy',
    'amusement': 'happy',
    'annoyance': 'angry',
    'approval': 'happy',
    'caring': 'happy',
    'confusion': 'neutral',
    'curiosity': 'energetic',
    'desire': 'energetic',
    'disappointment': 'sad',
    'disapproval': 'angry',
    'embarrassment': 'neutral',
    'excitement': 'energetic',
    'gratitude': 'happy',
    'grief': 'sad',
    'love': 'happy',
    'nervousness': 'neutral',
    'optimism': 'happy',
    'pride': 'happy',
    'realization': 'neutral',
    'relief': 'calm',
    'remorse': 'sad',
    'neutral': 'neutral'
}


class TextInput(BaseModel):
    text: str


def predict(text, threshold=0.3):
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True
    ).to(device)

    with torch.no_grad():
        outputs = model(**inputs)

    probs = torch.sigmoid(outputs.logits)[0]

    results = [
        (id_to_label[i], float(probs[i]))
        for i in range(len(probs))
        if probs[i] > threshold
    ]

    results.sort(key=lambda x: x[1], reverse=True)
    return results


@app.post("/predict")
def predict_emotion(data: TextInput):
    predictions = predict(data.text)

    if not predictions:
        return {"emotion": "neutral"}

    top_emotion = predictions[0][0]
    mapped_emotion = emotion_map.get(top_emotion, 'neutral')
    return {"emotion": mapped_emotion}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8002
    )