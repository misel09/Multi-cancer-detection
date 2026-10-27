import os
import io
import sys

import numpy as np
import tensorflow as tf
from PIL import Image

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
        self._model: tf.keras.Model | None = None
        self._model_path = os.path.abspath(
            os.path.join(
                os.path.dirname(__file__),
                "..", "..", "model", "multi_cancer_classifier_final.h5",
            )
        )

    def _get_model(self) -> tf.keras.Model:
        if self._model is None:
            if not os.path.isfile(self._model_path):
                raise FileNotFoundError(f"Cancer model not found: {self._model_path}")
            self._model = tf.keras.models.load_model(self._model_path, compile=False)
        return self._model

    # ------------------------------------------------------------------
    # Trained model inference
    # ------------------------------------------------------------------

    @staticmethod
    def _prepare_image(image_bytes: bytes) -> np.ndarray:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = image.resize((224, 224), Image.Resampling.LANCZOS)
        image_array = np.expand_dims(np.asarray(image, dtype=np.float32), axis=0)
        return tf.keras.applications.efficientnet.preprocess_input(image_array)

    def _predict_class(self, image_bytes: bytes) -> tuple[str, str, float]:
        image_array = self._prepare_image(image_bytes)
        predictions = np.asarray(self._get_model().predict(image_array, verbose=0))[0]
        if predictions.shape[0] != len(ALL_CLASSES):
            raise ValueError(
                f"Model configuration mismatch: the H5 model returns {predictions.shape[0]} classes, "
                f"but the configured training mapping has {len(ALL_CLASSES)} labels."
            )

        index = int(np.argmax(predictions))
        cancer_group, cancer_subtype = get_class_by_index(index)
        confidence = float(predictions[index])
        return cancer_group, cancer_subtype, round(confidence, 4)

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
