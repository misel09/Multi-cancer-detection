"""Educational CancerAI assistant endpoint."""

import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.config.settings import settings
from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/chat", tags=["chat"])

SYSTEM_PROMPT = (
    "You are the CancerAI educational assistant. Answer in plain language using no more "
    "than 3 short sentences. Answer only the user's question; do not repeat the app overview "
    "or disclaimer unless directly relevant. Do not diagnose, recommend treatment, or claim "
    "certainty."
)

FAQ_REPLIES = {
    "grad-cam": (
        "Grad-CAM is a heatmap that shows which image regions influenced the model's prediction. "
        "Warm colors usually indicate stronger influence; it explains model attention, not a diagnosis."
    ),
    "confidence": (
        "Confidence is the model's probability-like score for its selected class. "
        "It is not a diagnosis and can be affected by image quality or unfamiliar images."
    ),
    "analyze": (
        "Open Analyze, upload a supported medical image, and select Analyze Image. "
        "The app sends it to the classifier and displays the predicted class, confidence, and heatmap."
    ),
    "cancers": (
        "This model has 26 classes across oral, leukemia, brain, breast, cervical, kidney, colon, and lung image categories. "
        "The exact result depends on the image and the class learned by the model."
    ),
}


class ChatMessage(BaseModel):
    role: str
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)


class ChatResponse(BaseModel):
    reply: str


def _faq_reply(message: str) -> str | None:
    text = message.lower()
    if "grad-cam" in text or "gradcam" in text or "heatmap" in text:
        return FAQ_REPLIES["grad-cam"]
    if "confidence" in text:
        return FAQ_REPLIES["confidence"]
    if "analyze" in text or "upload" in text:
        return FAQ_REPLIES["analyze"]
    if "which cancer" in text or "cancer group" in text or "cancers can" in text:
        return FAQ_REPLIES["cancers"]
    return None


def _gemini_reply(payload: ChatRequest) -> str:
    contents = [
        {"role": "user", "parts": [{"text": SYSTEM_PROMPT}]},
        *[
            {
                "role": "model" if item.role == "assistant" else "user",
                "parts": [{"text": item.content}],
            }
            for item in payload.history
            if item.role in {"user", "assistant"}
        ],
        {"role": "user", "parts": [{"text": payload.message}]},
    ]
    body = json.dumps({"contents": contents}).encode("utf-8")
    model = settings.LLM_MODEL or "gemini-flash-lite-latest"
    request = Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.LLM_API_KEY}",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=60) as response:
            data = json.loads(response.read().decode("utf-8"))
    except TimeoutError as exc:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="The language model took too long to respond. Please try again.",
        ) from exc
    except HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"The language model rejected the request ({exc.code}).",
        ) from exc
    except URLError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The language model service could not be reached.",
        ) from exc

    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The language model returned an invalid response.",
        ) from exc


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest, _: User = Depends(get_current_user)):
    faq_reply = _faq_reply(payload.message)
    if faq_reply:
        return {"reply": faq_reply}

    if not settings.LLM_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Chatbot is not configured. Add LLM_API_KEY to backend/.env.",
        )

    provider = settings.LLM_PROVIDER.lower()
    if provider not in {"auto", "gemini"}:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=f"Unsupported LLM_PROVIDER: {settings.LLM_PROVIDER}",
        )
    return {"reply": _gemini_reply(payload)}
