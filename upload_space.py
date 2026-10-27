"""
Upload ONLY app.py + requirements.txt to existing Space (23it085/CancerAi)
Space must already exist at huggingface.co/spaces/23it085/CancerAi
"""

import sys
import argparse
from pathlib import Path

MODEL_DIR  = Path(r"C:\Users\misel\OneDrive\Attachments\Desktop\SGP Sem 7\multi-cancer-ai\model")
SPACE_REPO = "23it085/CancerAi"
MODEL_REPO = "23it085/CancerAI-Model"

SPACE_FILES = ["app.py", "requirements.txt"]
MODEL_FILES = [
    "multi_cancer_classifier_final.keras",
    "multi_cancer_classifier_final.h5",
]

def upload(token):
    from huggingface_hub import HfApi
    api = HfApi(token=token)

    print("\n" + "─"*55)
    print(f"🚀  Uploading to SPACE  →  {SPACE_REPO}")
    print("─"*55)
    for fname in SPACE_FILES:
        fpath = MODEL_DIR / fname
        if not fpath.exists():
            print(f"  ⚠️  {fname} not found, skipping.")
            continue
        print(f"  ⬆️   {fname} …", end="", flush=True)
        try:
            api.upload_file(
                path_or_fileobj=str(fpath),
                path_in_repo=fname,
                repo_id=SPACE_REPO,
                repo_type="space",
                token=token,
            )
            print(" ✅")
        except Exception as e:
            print(f" ❌  {e}")

    print("\n" + "─"*55)
    print(f"📦  Uploading to MODEL REPO  →  {MODEL_REPO}")
    print("─"*55)
    for fname in MODEL_FILES:
        fpath = MODEL_DIR / fname
        if not fpath.exists():
            print(f"  ⚠️  {fname} not found, skipping.")
            continue
        size_mb = fpath.stat().st_size / 1024 / 1024
        print(f"  ⬆️   {fname}  ({size_mb:.1f} MB) …", end="", flush=True)
        try:
            api.upload_file(
                path_or_fileobj=str(fpath),
                path_in_repo=fname,
                repo_id=MODEL_REPO,
                repo_type="model",
                token=token,
            )
            print(" ✅")
        except Exception as e:
            print(f" ❌  {e}")

    print("\n🎉  Done!")
    print(f"  Space → https://huggingface.co/spaces/{SPACE_REPO}")
    print(f"  Model → https://huggingface.co/{MODEL_REPO}\n")

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--token", required=True)
    args = p.parse_args()
    upload(args.token)
