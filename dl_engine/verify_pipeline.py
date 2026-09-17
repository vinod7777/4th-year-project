"""
Pipeline Verification Script
Verifies that dl_engine/iot_cnn_model.pt and dl_engine/scaler.pkl exist,
are loadable, and can perform inference successfully.
"""

import os
import sys
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

import joblib
import numpy as np
import torch
try:
    from dl_engine.train_model import SmartCity1DCNN
except ImportError:
    from train_model import SmartCity1DCNN

def verify_artifacts(
    model_path: str = "dl_engine/iot_cnn_model.pt",
    scaler_path: str = "dl_engine/scaler.pkl"
) -> bool:
    print("="*60)
    print("VERIFYING PIPELINE ARTIFACTS")
    print("="*60)

    # 1. Verify Scaler
    if not os.path.exists(scaler_path):
        print(f"[FAIL] Scaler file not found at: {scaler_path}")
        return False
    
    scaler_size = os.path.getsize(scaler_path)
    print(f"[PASS] Found scaler: {scaler_path} ({scaler_size:,} bytes)")

    try:
        scaler = joblib.load(scaler_path)
        print(f"[PASS] Successfully loaded scaler: {type(scaler).__name__}")
        n_features = scaler.n_features_in_
        print(f"       Expected feature dimension: {n_features}")
    except Exception as e:
        print(f"[FAIL] Failed to load scaler: {e}")
        return False

    # 2. Verify Model
    if not os.path.exists(model_path):
        print(f"[FAIL] Model weights file not found at: {model_path}")
        return False

    model_size = os.path.getsize(model_path)
    print(f"[PASS] Found model weights: {model_path} ({model_size:,} bytes)")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[INFO] Verification execution device: {device}")

    try:
        model = SmartCity1DCNN(num_classes=4)
        state_dict = torch.load(model_path, map_location=device)
        model.load_state_dict(state_dict)
        model.to(device)
        model.eval()
        print(f"[PASS] Successfully loaded SmartCity1DCNN weights ({sum(p.numel() for p in model.parameters()):,} parameters)")
    except Exception as e:
        print(f"[FAIL] Failed to load model state_dict: {e}")
        return False

    # 3. Test End-to-End Inference
    try:
        print("\n[INFO] Testing end-to-end inference on dummy input batch...")
        dummy_raw = np.random.uniform(0.0, 100.0, size=(5, n_features)).astype(np.float32)
        dummy_scaled = scaler.transform(dummy_raw)
        dummy_tensor = torch.tensor(dummy_scaled, dtype=torch.float32).unsqueeze(1).to(device)

        with torch.no_grad():
            logits = model(dummy_tensor)
            probs = torch.softmax(logits, dim=1)
            preds = torch.argmax(probs, dim=1).cpu().numpy()

        class_map = {0: "Benign", 1: "DDoS/Flood", 2: "Recon/PortScan", 3: "Spoofing/Other"}
        for i in range(len(preds)):
            predicted_class = class_map[preds[i]]
            conf = probs[i][preds[i]].item() * 100.0
            print(f"  Sample #{i+1} -> Predicted Class: {preds[i]} ({predicted_class}) with Confidence: {conf:.2f}%")

        print("\n[PASS] End-to-end inference verification complete!")
        return True
    except Exception as e:
        print(f"[FAIL] Inference test failed: {e}")
        return False

if __name__ == "__main__":
    success = verify_artifacts()
    sys.exit(0 if success else 1)
