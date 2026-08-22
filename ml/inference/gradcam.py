"""
Grad-CAM implementation using TensorFlow / Keras.

Uses MobileNetV2 as a lightweight backbone — only for generating realistic
heatmap overlays for demo purposes. No cancer classification happens here.
"""

import io
import base64
import numpy as np
import cv2
import tensorflow as tf
from PIL import Image


# --- Singleton model -------------------------------------------------------

_MODEL: tf.keras.Model | None = None
_GRAD_MODEL: tf.keras.Model | None = None


def _get_model() -> tuple[tf.keras.Model, tf.keras.Model]:
    """Load MobileNetV2 once and cache it."""
    global _MODEL, _GRAD_MODEL
    if _MODEL is None:
        _MODEL = tf.keras.applications.MobileNetV2(
            weights="imagenet",
            include_top=True,
        )
        _MODEL.trainable = False

        # Build a gradient model that outputs the last conv layer + predictions
        last_conv_layer_name = "Conv_1_bn"
        _GRAD_MODEL = tf.keras.models.Model(
            inputs=_MODEL.inputs,
            outputs=[
                _MODEL.get_layer(last_conv_layer_name).output,
                _MODEL.output,
            ],
        )
    return _MODEL, _GRAD_MODEL


# --- Core Grad-CAM logic ---------------------------------------------------


def _preprocess(image_bytes: bytes) -> np.ndarray:
    """Decode image bytes → (1, 224, 224, 3) tensor in MobileNetV2 range."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224), Image.LANCZOS)
    arr = np.array(img, dtype=np.float32)
    arr = tf.keras.applications.mobilenet_v2.preprocess_input(arr)
    return np.expand_dims(arr, axis=0)


def _compute_gradcam(grad_model: tf.keras.Model, img_tensor: np.ndarray) -> np.ndarray:
    """
    Returns a 2-D heatmap array (values 0-1).
    Grad-CAM is computed w.r.t. the top predicted ImageNet class.
    """
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_tensor)
        top_class = tf.argmax(predictions[0])
        loss = predictions[:, top_class]

    grads = tape.gradient(loss, conv_outputs)              # (1, H, W, C)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))  # (C,)

    conv_arr = conv_outputs[0].numpy()                    # (H, W, C)
    pooled_arr = pooled_grads.numpy()

    # Weight feature maps by their gradient importance
    for i in range(pooled_arr.shape[0]):
        conv_arr[:, :, i] *= pooled_arr[i]

    heatmap = np.mean(conv_arr, axis=-1)                  # (H, W)
    heatmap = np.maximum(heatmap, 0)                      # ReLU
    if heatmap.max() != 0:
        heatmap /= heatmap.max()
    return heatmap


def _overlay_heatmap(image_bytes: bytes, heatmap: np.ndarray) -> bytes:
    """
    Blends the Grad-CAM heatmap onto the original image.
    Returns the overlay as raw PNG bytes.
    """
    # Original image (RGB)
    orig = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    orig_np = np.array(orig)
    h, w = orig_np.shape[:2]

    # Resize heatmap to match original image
    heatmap_resized = cv2.resize(heatmap, (w, h))

    # Apply jet colormap
    heatmap_uint8 = np.uint8(255 * heatmap_resized)
    jet = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)  # BGR
    jet_rgb = cv2.cvtColor(jet, cv2.COLOR_BGR2RGB)

    # Blend: 60% original + 40% heatmap
    overlay = cv2.addWeighted(orig_np, 0.6, jet_rgb, 0.4, 0)

    # Encode to PNG bytes
    out = Image.fromarray(overlay)
    buf = io.BytesIO()
    out.save(buf, format="PNG")
    return buf.getvalue()


# --- Public API ------------------------------------------------------------


def generate_gradcam_base64(image_bytes: bytes) -> str:
    """
    Full pipeline: image bytes → Grad-CAM overlay → base64 PNG string.

    Args:
        image_bytes: Raw bytes of any image (JPEG / PNG / WEBP).

    Returns:
        Base64-encoded PNG string (no data-URI prefix).
    """
    _, grad_model = _get_model()
    img_tensor = _preprocess(image_bytes)
    heatmap = _compute_gradcam(grad_model, img_tensor)
    overlay_bytes = _overlay_heatmap(image_bytes, heatmap)
    return base64.b64encode(overlay_bytes).decode("utf-8")
