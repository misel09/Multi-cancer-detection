"""
ModelService — the ONLY file that changes when the real EfficientNetB3 model is ready.

Current behaviour (sample / demo mode):
  - Uses a deterministic hash of the image bytes to pick a cancer class,
    so the same image always returns the same prediction.
  - Generates a REAL Grad-CAM heatmap via MobileNetV2 (just for visual demo).
  - Returns a realistic confidence score.

When your real model is ready:
  1. Place the `.keras` / `.h5` in  ml/models/
  2. Replace _predict_class() with actual model inference.
  3. No other files need changing.
"""

import hashlib
import random
import sys
import os

# Allow importing ml.classes from this sub-package
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from ml.classes import ALL_CLASSES, get_class_by_index
from ml.inference.gradcam import generate_gradcam_base64


class ModelService:
    """
    Stateless service — call predict() with raw image bytes.

    Returns:
        {
            "cancer_group": str,
            "cancer_subtype": str,
            "confidence": float,       # 0.0 – 1.0
            "gradcam_base64": str,     # base64 PNG (no data-URI prefix)
        }
    """

    def __init__(self) -> None:
        # Warm up Grad-CAM model on first instantiation
        # (lazy-loaded inside gradcam.py via singleton)
        pass

    # ------------------------------------------------------------------
    # Sample prediction logic  (replace this section with real inference)
    # ------------------------------------------------------------------

    @staticmethod
    def _predict_class(image_bytes: bytes) -> tuple[str, str, float]:
        """
        Deterministic fake prediction based on image hash.
        Same image → same prediction every time.
        """
        digest = hashlib.sha256(image_bytes).hexdigest()
        seed = int(digest[:8], 16)
        rng = random.Random(seed)

        # Pick class
        index = rng.randint(0, len(ALL_CLASSES) - 1)
        cancer_group, cancer_subtype = get_class_by_index(index)

        # Realistic confidence: 55% – 97%
        confidence = round(rng.uniform(0.55, 0.97), 4)

        return cancer_group, cancer_subtype, confidence

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def predict(self, image_bytes: bytes) -> dict:
        """
        Run full inference pipeline on raw image bytes.

        Args:
            image_bytes: Raw bytes of an uploaded image.

        Returns:
            Prediction dict with cancer_group, cancer_subtype, confidence,
            and gradcam_base64.
        """
        cancer_group, cancer_subtype, confidence = self._predict_class(image_bytes)

        try:
            gradcam_b64 = generate_gradcam_base64(image_bytes)
        except Exception as exc:  # noqa: BLE001
            # Grad-CAM failure should not crash the whole prediction
            print(f"[ModelService] Grad-CAM generation failed: {exc}")
            gradcam_b64 = ""

        return {
            "cancer_group": cancer_group,
            "cancer_subtype": cancer_subtype,
            "confidence": confidence,
            "gradcam_base64": gradcam_b64,
        }


# Singleton instance — import this in the backend
model_service = ModelService()
