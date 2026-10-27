"""
Bridge between FastAPI and the ml.inference.ModelService.

The import is done lazily (inside the function) so the FastAPI server
can start up even if TensorFlow / the ML layer is not yet installed.
"""

import os
import sys


def _ensure_ml_on_path() -> None:
    ml_root = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "..")
    )
    if ml_root not in sys.path:
        sys.path.insert(0, ml_root)


def run_inference(image_bytes: bytes) -> dict:
    """
    Call the ML model service and return a prediction dict.

    Returns:
        {
            "cancer_group": str,
            "cancer_subtype": str,
            "confidence": float,
            "gradcam_base64": str,
        }
    """
    _ensure_ml_on_path()
    from ml.inference.model_service import model_service  # noqa: E402
    return model_service.predict(image_bytes)
