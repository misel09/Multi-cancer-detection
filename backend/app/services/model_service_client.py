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
    try:
        from ml.inference.model_service import model_service  # noqa: E402
        return model_service.predict(image_bytes)
    except ImportError as e:
        # ML layer not installed yet — return a mock response so the
        # rest of the API (auth, dashboard, history) still works fine.
        import random
        from PIL import Image, ImageDraw
        import io, base64
        
        cancer_groups = ["Breast", "Lung", "Brain", "Cervical", "Kidney", "Liver", "Prostate", "Skin"]
        group = random.choice(cancer_groups)
        
        # Generate a fake Grad-CAM image overlay using PIL
        gradcam_b64 = ""
        try:
            original = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
            overlay = Image.new("RGBA", original.size, (0, 0, 128, 100)) # Blue background
            draw = ImageDraw.Draw(overlay)
            w, h = original.size
            cx, cy = w // 2 + random.randint(-50, 50), h // 2 + random.randint(-50, 50)
            r = min(w, h) // 3
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 0, 0, 150)) # Red outer
            draw.ellipse([cx - r//2, cy - r//2, cx + r//2, cy + r//2], fill=(255, 255, 0, 220)) # Yellow inner
            heatmap = Image.alpha_composite(original, overlay).convert("RGB")
            
            buf = io.BytesIO()
            heatmap.save(buf, format="PNG")
            gradcam_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        except Exception as img_e:
            print("Failed to generate mock gradcam:", img_e)
            
        return {
            "cancer_group": group,
            "cancer_subtype": f"{group} Adenocarcinoma",
            "confidence": round(random.uniform(0.72, 0.97), 4),
            "gradcam_base64": gradcam_b64,
            "_mock": True,
            "_reason": str(e),
        }
