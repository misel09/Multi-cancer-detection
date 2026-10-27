import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import gradio as gr
import tensorflow as tf
import numpy as np
from PIL import Image

# ===================================
# LOAD MODEL
# ===================================
model = tf.keras.models.load_model("plant_disease_stable.keras")

# ===================================
# SAME TRAINING IMAGE SIZE
# ===================================
IMG_SIZE = (224, 224)

# ===================================
# EXACT CLASS ORDER FROM TRAINING
# ===================================
class_names = [
    'Apple___Apple_scab',
    'Apple___Black_rot',
    'Apple___Cedar_apple_rust',
    'Apple___healthy',
    'Blueberry___healthy',
    'Cherry_(including_sour)___Powdery_mildew',
    'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight',
    'Corn_(maize)___healthy',
    'Grape___Black_rot',
    'Grape___Esca_(Black_Measles)',
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)',
    'Peach___Bacterial_spot',
    'Peach___healthy',
    'Pepper,_bell___Bacterial_spot',
    'Pepper,_bell___healthy',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Potato___healthy',
    'Raspberry___healthy',
    'Soybean___healthy',
    'Squash___Powdery_mildew',
    'Strawberry___Leaf_scorch',
    'Strawberry___healthy',
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]

# ===================================
# PREDICTION FUNCTION
# ===================================
def predict_leaf(img):
    if img is None:
        return "Please upload an image."

    # PIL image
    img = img.convert("RGB")
    img = img.resize(IMG_SIZE)

    # Convert to array
    img_array = np.array(img).astype("float32")
    img_array = np.expand_dims(img_array, axis=0)

    # EXACT SAME PREPROCESSING AS TRAINING
    img_array = tf.keras.applications.efficientnet.preprocess_input(img_array)

    # Prediction
    pred = model.predict(img_array, verbose=0)[0]

    idx = np.argmax(pred)
    confidence = float(np.max(pred)) * 100

    result = class_names[idx]

    return f"Prediction: {result}\nConfidence: {confidence:.2f}%"

# ===================================
# UI
# ===================================
demo = gr.Interface(
    fn=predict_leaf,
    inputs=gr.Image(type="pil", label="Upload Leaf Image"),
    outputs=gr.Textbox(label="Prediction"),
    title="🌿 Plant Disease Detection",
    description="Upload a plant leaf image to detect disease using EfficientNetB0.",
    theme="soft"
)

demo.launch()