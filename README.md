# AI-Assisted Multi-Cancer Detection System

A research-grade local prototype for multi-cancer classification using:
- **EfficientNetB3** (placeholder: MobileNetV2 for Grad-CAM demos)
- **Explainable AI** (Grad-CAM heatmaps)
- **FastAPI** backend + **PostgreSQL**
- **React + Vite + MUI** frontend

---

## Quick Start

### 1. Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
uvicorn app.main:app --reload
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. ML (auto-loaded by backend on startup)
No separate process needed. The `ml/` package is imported by the backend service.

---

## Folder Structure
```
multi-cancer-ai/
├── frontend/         ← React + Vite + MUI
├── backend/          ← FastAPI + PostgreSQL
├── ml/               ← Sample model + inference service
├── docs/
├── .gitignore
└── README.md
```

## Model Swap (when real EfficientNetB3 is ready)
1. Place `.keras` / `.h5` in `ml/models/`
2. Update `ml/inference/model_service.py` only
3. Restart backend — no other changes needed
