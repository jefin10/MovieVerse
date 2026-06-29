"""Mood text -> genre label using the trained Naive Bayes model."""
from services.model_loader import get_mood_model


def predict_genre(text: str) -> str | None:
    model, vectorizer = get_mood_model()
    if model is None or vectorizer is None:
        return None
    features = vectorizer.transform([text])
    return str(model.predict(features)[0])
