import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import gradio as gr
import tensorflow as tf
import numpy as np
from PIL import Image
import cv2
import io
import base64

# ===================================================
# LOAD REAL MODEL
# ===================================================
print("🔬 Loading CancerAI model …")
model = tf.keras.models.load_model("multi_cancer_classifier_final.keras")
print("✅ Model loaded.")

# ===================================================
# IMAGE CONFIG
# ===================================================
IMG_SIZE = (224, 224)

# ===================================================
# CLASS DEFINITIONS
# 8 cancer groups → 35 subtypes (flat indexed)
# Order must exactly match training label encoding
# ===================================================
CANCER_CLASSES = {
    "Brain Tumor": [
        "Glioma",
        "Meningioma",
        "Pituitary Tumor",
        "No Tumor",
    ],
    "Breast Cancer": [
        "Benign",
        "Malignant",
        "Normal",
    ],
    "Cervical Cancer": [
        "Dyskeratotic",
        "Koilocytotic",
        "Metaplastic",
        "Parabasal",
        "Superficial-Intermediate",
    ],
    "Colon & Lung Cancer": [
        "Colon Adenocarcinoma",
        "Colon Benign Tissue",
        "Lung Adenocarcinoma",
        "Lung Benign Tissue",
        "Lung Squamous Cell Carcinoma",
    ],
    "Kidney Cancer": [
        "Clear Cell Renal Cell Carcinoma",
        "Chromophobe Renal Cell Carcinoma",
        "Normal",
    ],
    "Leukemia": [
        "Benign",
        "Early Pre-B Lymphoblastic Leukemia",
        "Pre-B Lymphoblastic Leukemia",
        "Pro-B Lymphoblastic Leukemia",
    ],
    "Oral Cancer": [
        "Normal",
        "Oral Squamous Cell Carcinoma",
    ],
    "Skin Cancer": [
        "Actinic Keratosis",
        "Basal Cell Carcinoma",
        "Dermatofibroma",
        "Melanoma",
        "Nevus",
        "Seborrheic Keratosis",
        "Squamous Cell Carcinoma",
        "Vascular Lesion",
    ],
}

# Flat list — index matches model output neuron
ALL_CLASSES = [
    (group, subtype)
    for group, subtypes in CANCER_CLASSES.items()
    for subtype in subtypes
]
NUM_CLASSES = len(ALL_CLASSES)   # 35

# Group emoji map for UI
GROUP_EMOJI = {
    "Brain Tumor":          "🧠",
    "Breast Cancer":        "🩺",
    "Cervical Cancer":      "🔬",
    "Colon & Lung Cancer":  "🫁",
    "Kidney Cancer":        "🫘",
    "Leukemia":             "🩸",
    "Oral Cancer":          "👄",
    "Skin Cancer":          "🧬",
}

# Severity color hint
BENIGN_KEYWORDS = {"normal", "healthy", "benign", "no tumor", "nevus",
                   "dermatofibroma", "superficial-intermediate"}

# ===================================================
# GRAD-CAM HELPER
# ===================================================
def make_gradcam_heatmap(img_array, model, last_conv_layer_name=None):
    """Generate Grad-CAM heatmap for the top predicted class."""
    try:
        # Auto-detect last conv layer if not provided
        if last_conv_layer_name is None:
            for layer in reversed(model.layers):
                if isinstance(layer, tf.keras.layers.Conv2D):
                    last_conv_layer_name = layer.name
                    break

        if last_conv_layer_name is None:
            return None

        grad_model = tf.keras.models.Model(
            inputs=model.input,
            outputs=[model.get_layer(last_conv_layer_name).output, model.output]
        )

        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_array)
            top_class = tf.argmax(predictions[0])
            class_channel = predictions[:, top_class]

        grads = tape.gradient(class_channel, conv_outputs)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        conv_outputs = conv_outputs[0]
        heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)
        heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-8)
        return heatmap.numpy()
    except Exception as e:
        print(f"Grad-CAM failed: {e}")
        return None


def apply_gradcam_overlay(original_pil, heatmap):
    """Overlay Grad-CAM heatmap onto original image."""
    try:
        orig = np.array(original_pil.resize(IMG_SIZE))
        heatmap_resized = cv2.resize(heatmap, IMG_SIZE)
        heatmap_uint8   = np.uint8(255 * heatmap_resized)
        colormap        = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
        colormap_rgb    = cv2.cvtColor(colormap, cv2.COLOR_BGR2RGB)
        overlay         = cv2.addWeighted(orig, 0.55, colormap_rgb, 0.45, 0)
        return Image.fromarray(overlay)
    except Exception as e:
        print(f"Overlay failed: {e}")
        return original_pil


# ===================================================
# PREDICTION FUNCTION
# ===================================================
def predict_cancer(img):
    if img is None:
        return (
            "⚠️ Please upload a medical image.",
            None,
            "<p style='color:#9b96c4;text-align:center'>Upload an image to see results.</p>"
        )

    # ── Preprocess ──────────────────────────────────────────────────────────
    pil_img  = img.convert("RGB")
    resized  = pil_img.resize(IMG_SIZE)
    arr      = np.array(resized).astype("float32")
    arr_exp  = np.expand_dims(arr, axis=0)

    # Use EfficientNet preprocessing (matches training)
    arr_prep = tf.keras.applications.efficientnet.preprocess_input(arr_exp.copy())

    # ── Inference ────────────────────────────────────────────────────────────
    preds       = model.predict(arr_prep, verbose=0)[0]
    top_idx     = int(np.argmax(preds))
    confidence  = float(np.max(preds)) * 100

    cancer_group, cancer_subtype = ALL_CLASSES[top_idx % NUM_CLASSES]
    emoji = GROUP_EMOJI.get(cancer_group, "🔬")

    # Top-5 predictions
    top5_idx    = np.argsort(preds)[::-1][:5]
    top5        = [(ALL_CLASSES[i % NUM_CLASSES], float(preds[i]) * 100) for i in top5_idx]

    # ── Grad-CAM ─────────────────────────────────────────────────────────────
    heatmap    = make_gradcam_heatmap(arr_prep, model)
    gradcam_img = apply_gradcam_overlay(pil_img, heatmap) if heatmap is not None else pil_img

    # ── Severity hint ─────────────────────────────────────────────────────────
    is_benign    = any(kw in cancer_subtype.lower() for kw in BENIGN_KEYWORDS)
    severity_col = "#22c55e" if is_benign else ("#f59e0b" if confidence < 75 else "#ef4444")
    severity_lbl = "Low Risk / Benign" if is_benign else ("Uncertain" if confidence < 75 else "High Risk / Malignant")

    # ── Text output ───────────────────────────────────────────────────────────
    text_result = (
        f"{emoji}  Cancer Group : {cancer_group}\n"
        f"🔬  Subtype       : {cancer_subtype}\n"
        f"📊  Confidence    : {confidence:.2f}%\n"
        f"⚠️   Risk Level    : {severity_lbl}\n\n"
        f"── Top-5 Predictions ──\n"
    )
    for rank, ((grp, sub), conf) in enumerate(top5, 1):
        bar = "█" * int(conf / 5) + "░" * (20 - int(conf / 5))
        text_result += f"  {rank}. {grp} › {sub}\n     {bar} {conf:.1f}%\n"

    text_result += (
        "\n⚠️  DISCLAIMER: Research prototype only.\n"
        "   Not for clinical diagnosis. Consult a medical professional."
    )

    # ── Rich HTML output ──────────────────────────────────────────────────────
    top5_bars = ""
    for (grp, sub), conf in top5:
        bar_w = min(int(conf), 100)
        bar_color = "#7c6af5" if conf == top5[0][1] else "#4a4570"
        top5_bars += f"""
        <div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;margin-bottom:3px">
            <span style="font-size:12px;color:#e8e4ff"><b>{grp}</b> › {sub}</span>
            <span style="font-size:12px;color:#a78bfa;font-weight:700">{conf:.1f}%</span>
          </div>
          <div style="background:#1a1828;border-radius:6px;height:8px;overflow:hidden">
            <div style="width:{bar_w}%;height:100%;background:linear-gradient(90deg,{bar_color},{bar_color}88);border-radius:6px;transition:width 0.5s"></div>
          </div>
        </div>"""

    html_result = f"""
    <div style="font-family:'Segoe UI',sans-serif;background:#0f0e1a;color:#e8e4ff;padding:20px;border-radius:14px;border:1px solid #2e2a4a">

      <!-- Header -->
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid #2e2a4a">
        <div style="width:48px;height:48px;background:linear-gradient(135deg,#7c6af5,#a78bfa);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0">
          {emoji}
        </div>
        <div>
          <div style="font-size:11px;color:#9b96c4;text-transform:uppercase;letter-spacing:1px">Classification Result</div>
          <div style="font-size:18px;font-weight:800;color:#ffffff">{cancer_subtype}</div>
          <div style="font-size:13px;color:#a78bfa">{cancer_group}</div>
        </div>
      </div>

      <!-- Confidence + Risk row -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px">
        <div style="background:#1a1828;border-radius:10px;padding:12px;border:1px solid #2e2a4a">
          <div style="font-size:10px;color:#9b96c4;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Confidence</div>
          <div style="font-size:26px;font-weight:800;color:#7c6af5">{confidence:.1f}<span style="font-size:16px">%</span></div>
          <div style="background:#0f0e1a;border-radius:4px;height:4px;margin-top:6px">
            <div style="width:{min(confidence,100):.0f}%;height:100%;background:linear-gradient(90deg,#7c6af5,#a78bfa);border-radius:4px"></div>
          </div>
        </div>
        <div style="background:#1a1828;border-radius:10px;padding:12px;border:1px solid {severity_col}44">
          <div style="font-size:10px;color:#9b96c4;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Risk Level</div>
          <div style="font-size:15px;font-weight:800;color:{severity_col}">{severity_lbl}</div>
          <div style="font-size:10px;color:#9b96c4;margin-top:4px">Based on classification</div>
        </div>
      </div>

      <!-- Top-5 -->
      <div style="margin-bottom:14px">
        <div style="font-size:11px;color:#9b96c4;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Top-5 Predictions</div>
        {top5_bars}
      </div>

      <!-- Stats row -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
        <div style="background:#1a1828;border-radius:8px;padding:10px;text-align:center;border:1px solid #2e2a4a">
          <div style="font-size:18px;font-weight:800;color:#e8e4ff">{NUM_CLASSES}</div>
          <div style="font-size:10px;color:#9b96c4">Total Classes</div>
        </div>
        <div style="background:#1a1828;border-radius:8px;padding:10px;text-align:center;border:1px solid #2e2a4a">
          <div style="font-size:18px;font-weight:800;color:#e8e4ff">{len(CANCER_CLASSES)}</div>
          <div style="font-size:10px;color:#9b96c4">Cancer Groups</div>
        </div>
        <div style="background:#1a1828;border-radius:8px;padding:10px;text-align:center;border:1px solid #2e2a4a">
          <div style="font-size:18px;font-weight:800;color:#e8e4ff">EfficientNet</div>
          <div style="font-size:10px;color:#9b96c4">Architecture</div>
        </div>
      </div>

      <!-- Disclaimer -->
      <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:8px;padding:10px">
        <div style="font-size:11px;color:#f59e0b">
          ⚠️ <b>Research Prototype Only.</b> This tool is for academic demonstration purposes only.
          Do not use for actual medical diagnosis. Always consult a qualified healthcare professional.
        </div>
      </div>
    </div>
    """

    return text_result, gradcam_img, html_result


# ===================================================
# EXAMPLE IMAGES (optional — add real ones to /examples)
# ===================================================
examples = []
examples_dir = "examples"
if os.path.exists(examples_dir):
    for f in os.listdir(examples_dir):
        if f.lower().endswith((".jpg", ".jpeg", ".png")):
            examples.append([os.path.join(examples_dir, f)])

# ===================================================
# GRADIO UI
# ===================================================
with gr.Blocks(
    theme=gr.themes.Base(
        primary_hue="violet",
        secondary_hue="purple",
        neutral_hue="slate",
        font=gr.themes.GoogleFont("Inter"),
    ),
    css="""
    body { background: #0f0e1a !important; }
    .gradio-container { background: #0f0e1a !important; max-width: 1100px !important; }
    .gr-button-primary {
        background: linear-gradient(135deg, #7c6af5, #a78bfa) !important;
        border: none !important;
        font-weight: 700 !important;
        font-size: 15px !important;
        padding: 12px !important;
    }
    .gr-button-primary:hover {
        background: linear-gradient(135deg, #6b57e8, #9270f5) !important;
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(124,106,245,0.45) !important;
    }
    .gr-panel { background: #1a1828 !important; border: 1px solid #2e2a4a !important; border-radius: 12px !important; }
    label { color: #9b96c4 !important; font-size: 12px !important; font-weight: 600 !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; }
    """,
    title="CancerAI — Multi-Cancer Detection System",
) as demo:

    # ── Header ──────────────────────────────────────────────────────────────
    gr.HTML("""
    <div style="text-align:center;padding:30px 20px 20px;font-family:'Inter',sans-serif">
      <div style="display:inline-flex;align-items:center;justify-content:center;
                  width:72px;height:72px;background:linear-gradient(135deg,#7c6af5,#a78bfa);
                  border-radius:18px;margin-bottom:16px;font-size:36px;
                  box-shadow:0 8px 24px rgba(124,106,245,0.4)">
        🔬
      </div>
      <h1 style="font-size:32px;font-weight:900;margin:0;
                 background:linear-gradient(90deg,#a78bfa,#7c6af5);
                 -webkit-background-clip:text;-webkit-text-fill-color:transparent">
        CancerAI
      </h1>
      <p style="font-size:16px;color:#9b96c4;margin:6px 0 4px">
        Multi-Cancer Detection System
      </p>
      <p style="font-size:13px;color:#4a4570;margin:0">
        Detects <b style="color:#7c6af5">35 subtypes</b> across
        <b style="color:#a78bfa">8 cancer groups</b> using EfficientNet + Grad-CAM
      </p>
      <div style="display:flex;justify-content:center;gap:8px;margin-top:14px;flex-wrap:wrap">
        <span style="background:rgba(124,106,245,0.15);color:#a78bfa;padding:4px 10px;border-radius:20px;font-size:11px;border:1px solid rgba(124,106,245,0.3);font-weight:600">🧠 Brain Tumor</span>
        <span style="background:rgba(124,106,245,0.15);color:#a78bfa;padding:4px 10px;border-radius:20px;font-size:11px;border:1px solid rgba(124,106,245,0.3);font-weight:600">🩺 Breast Cancer</span>
        <span style="background:rgba(124,106,245,0.15);color:#a78bfa;padding:4px 10px;border-radius:20px;font-size:11px;border:1px solid rgba(124,106,245,0.3);font-weight:600">🫁 Lung &amp; Colon</span>
        <span style="background:rgba(124,106,245,0.15);color:#a78bfa;padding:4px 10px;border-radius:20px;font-size:11px;border:1px solid rgba(124,106,245,0.3);font-weight:600">🩸 Leukemia</span>
        <span style="background:rgba(124,106,245,0.15);color:#a78bfa;padding:4px 10px;border-radius:20px;font-size:11px;border:1px solid rgba(124,106,245,0.3);font-weight:600">🧬 Skin Cancer</span>
        <span style="background:rgba(124,106,245,0.1);color:#6b7094;padding:4px 10px;border-radius:20px;font-size:11px;border:1px solid rgba(107,112,148,0.2);font-weight:600">+3 more</span>
      </div>
    </div>
    """)

    # ── Main layout ──────────────────────────────────────────────────────────
    with gr.Row():
        # Left column — input
        with gr.Column(scale=1):
            img_input = gr.Image(
                type="pil",
                label="Upload Medical Image",
                height=300,
            )
            predict_btn = gr.Button(
                "🔬  Analyze Image",
                variant="primary",
                size="lg",
            )
            if examples:
                gr.Examples(examples=examples, inputs=img_input, label="Example Images")

            gr.HTML("""
            <div style="background:#1a1828;border:1px solid #2e2a4a;border-radius:10px;padding:14px;margin-top:8px;font-family:'Inter',sans-serif">
              <div style="font-size:11px;color:#9b96c4;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;font-weight:700">Supported Image Types</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px">
                <span style="background:#221f35;color:#a78bfa;padding:3px 8px;border-radius:6px;font-size:11px">Histopathology</span>
                <span style="background:#221f35;color:#a78bfa;padding:3px 8px;border-radius:6px;font-size:11px">MRI Scans</span>
                <span style="background:#221f35;color:#a78bfa;padding:3px 8px;border-radius:6px;font-size:11px">Dermoscopy</span>
                <span style="background:#221f35;color:#a78bfa;padding:3px 8px;border-radius:6px;font-size:11px">Blood Smear</span>
                <span style="background:#221f35;color:#a78bfa;padding:3px 8px;border-radius:6px;font-size:11px">CT Scan</span>
                <span style="background:#221f35;color:#a78bfa;padding:3px 8px;border-radius:6px;font-size:11px">Cytology</span>
              </div>
            </div>
            """)

        # Right column — output
        with gr.Column(scale=1):
            gradcam_output = gr.Image(
                label="Grad-CAM Explainability Heatmap",
                height=300,
                show_label=True,
            )
            html_output = gr.HTML(
                value="<div style='text-align:center;padding:40px;color:#4a4570;font-family:Inter,sans-serif'>Upload an image and click Analyze to see results.</div>"
            )

    # Hidden text output (for accessibility / copy)
    with gr.Accordion("📋 Raw Text Output (for copy/paste)", open=False):
        text_output = gr.Textbox(
            label="Prediction Details",
            lines=14,
            show_copy_button=True,
        )

    # ── How it works section ──────────────────────────────────────────────────
    with gr.Accordion("ℹ️ How it works", open=False):
        gr.HTML("""
        <div style="font-family:'Inter',sans-serif;color:#9b96c4;padding:10px">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px">
            <div style="background:#1a1828;border-radius:10px;padding:14px;border:1px solid #2e2a4a">
              <div style="font-size:20px;margin-bottom:6px">📸</div>
              <div style="font-weight:700;color:#e8e4ff;margin-bottom:4px">1. Upload</div>
              <div style="font-size:12px">Upload any medical scan or histopathology image (JPG, PNG)</div>
            </div>
            <div style="background:#1a1828;border-radius:10px;padding:14px;border:1px solid #2e2a4a">
              <div style="font-size:20px;margin-bottom:6px">⚡</div>
              <div style="font-weight:700;color:#e8e4ff;margin-bottom:4px">2. Analyze</div>
              <div style="font-size:12px">EfficientNet model preprocesses and classifies across 35 cancer subtypes</div>
            </div>
            <div style="background:#1a1828;border-radius:10px;padding:14px;border:1px solid #2e2a4a">
              <div style="font-size:20px;margin-bottom:6px">🌡️</div>
              <div style="font-weight:700;color:#e8e4ff;margin-bottom:4px">3. Grad-CAM</div>
              <div style="font-size:12px">Heatmap highlights which regions of the image influenced the AI decision</div>
            </div>
            <div style="background:#1a1828;border-radius:10px;padding:14px;border:1px solid #2e2a4a">
              <div style="font-size:20px;margin-bottom:6px">📊</div>
              <div style="font-weight:700;color:#e8e4ff;margin-bottom:4px">4. Results</div>
              <div style="font-size:12px">View cancer group, subtype, confidence score, and top-5 predictions</div>
            </div>
          </div>
          <div style="margin-top:16px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:8px;padding:12px;font-size:12px;color:#f59e0b">
            ⚠️ <b>Disclaimer:</b> This is an academic research prototype built for the SGP Sem 7 project.
            It is NOT approved for clinical use. Always consult a licensed medical professional for diagnosis.
          </div>
        </div>
        """)

    # ── Wire up ───────────────────────────────────────────────────────────────
    predict_btn.click(
        fn=predict_cancer,
        inputs=img_input,
        outputs=[text_output, gradcam_output, html_output],
    )
    img_input.change(
        fn=predict_cancer,
        inputs=img_input,
        outputs=[text_output, gradcam_output, html_output],
    )

    # ── Footer ────────────────────────────────────────────────────────────────
    gr.HTML("""
    <div style="text-align:center;padding:20px;font-family:'Inter',sans-serif;color:#4a4570;font-size:12px">
      Built with ❤️ for SGP Sem 7 &nbsp;·&nbsp;
      EfficientNet + Grad-CAM &nbsp;·&nbsp;
      35 Cancer Subtypes across 8 Groups
    </div>
    """)

demo.launch()
