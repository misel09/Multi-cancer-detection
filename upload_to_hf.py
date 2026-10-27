"""
Upload multi-cancer model files to Hugging Face Model Hub.
Run this script from anywhere after setting your HF token.

Usage:
    python upload_to_hf.py --token hf_YOURTOKEN
    OR set env var HF_TOKEN=hf_YOURTOKEN and run:
    python upload_to_hf.py
"""

import os
import sys
import argparse
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
MODEL_DIR    = Path(r"C:\Users\misel\OneDrive\Attachments\Desktop\SGP Sem 7\multi-cancer-ai\model")
HF_REPO_ID   = "23it085/CancerAI-Model"   # Model repo (not Space)
HF_REPO_TYPE = "model"

# Files to upload (relative to MODEL_DIR, searched recursively)
EXTENSIONS   = [".h5", ".keras", ".json", ".txt", ".py", ".md"]
# ─────────────────────────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(description="Upload model to Hugging Face Hub")
    parser.add_argument("--token", type=str, default=os.environ.get("HF_TOKEN", ""),
                        help="Hugging Face write token (or set HF_TOKEN env var)")
    parser.add_argument("--repo",  type=str, default=HF_REPO_ID,
                        help=f"Target repo id, default: {HF_REPO_ID}")
    args = parser.parse_args()

    if not args.token:
        print("❌  No token provided.\n"
              "    Pass --token hf_YOURTOKEN\n"
              "    OR set the HF_TOKEN environment variable.\n"
              "    Get a write token at: https://huggingface.co/settings/tokens")
        sys.exit(1)

    try:
        from huggingface_hub import HfApi, create_repo
    except ImportError:
        print("❌  huggingface_hub not installed.\n"
              "    Run: pip install huggingface_hub")
        sys.exit(1)

    api = HfApi(token=args.token)

    # ── Create the repo if it doesn't exist ──────────────────────────────────
    print(f"\n📦  Ensuring repo '{args.repo}' exists …")
    try:
        create_repo(
            repo_id=args.repo,
            repo_type=HF_REPO_TYPE,
            exist_ok=True,
            token=args.token,
            private=False,
        )
        print(f"    ✅  Repo ready: https://huggingface.co/{args.repo}")
    except Exception as e:
        print(f"    ⚠️  Could not create repo: {e}")

    # ── Discover files to upload ──────────────────────────────────────────────
    files = []
    for ext in EXTENSIONS:
        files.extend(MODEL_DIR.rglob(f"*{ext}"))

    if not files:
        print(f"❌  No files found in {MODEL_DIR}")
        sys.exit(1)

    print(f"\n📁  Found {len(files)} file(s) to upload:")
    for f in files:
        size_mb = f.stat().st_size / (1024 * 1024)
        rel = f.relative_to(MODEL_DIR)
        print(f"    • {rel}  ({size_mb:.1f} MB)")

    # ── Upload each file ──────────────────────────────────────────────────────
    print(f"\n🚀  Uploading to  https://huggingface.co/{args.repo} …\n")
    succeeded, failed = [], []

    for f in files:
        rel = str(f.relative_to(MODEL_DIR)).replace("\\", "/")
        size_mb = f.stat().st_size / (1024 * 1024)
        print(f"    ⬆️   {rel}  ({size_mb:.1f} MB) …", end="", flush=True)
        try:
            api.upload_file(
                path_or_fileobj=str(f),
                path_in_repo=rel,
                repo_id=args.repo,
                repo_type=HF_REPO_TYPE,
                token=args.token,
            )
            print(" ✅")
            succeeded.append(rel)
        except Exception as e:
            print(f" ❌  {e}")
            failed.append((rel, str(e)))

    # ── Summary ───────────────────────────────────────────────────────────────
    print(f"\n{'─'*55}")
    print(f"✅  Uploaded : {len(succeeded)} file(s)")
    if failed:
        print(f"❌  Failed   : {len(failed)} file(s)")
        for name, err in failed:
            print(f"    • {name}: {err}")
    else:
        print(f"\n🎉  All files uploaded successfully!")
        print(f"    View your model → https://huggingface.co/{args.repo}\n")


if __name__ == "__main__":
    main()
