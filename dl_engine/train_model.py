"""
Autonomous Deep Learning Pipeline: 1D-CNN IoT Intrusion Detection
Model: SmartCity1DCNN
Dataset: CIC-IoT2023 Schema (Merged61.csv, Merged62.csv, Merged63.csv)
Hardware: NVIDIA GeForce RTX 3050 (CUDA)
"""

import os
import sys
import time
import argparse
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader

# ==========================================
# 1. MODEL ARCHITECTURE
# ==========================================
class SmartCity1DCNN(nn.Module):
    """
    1D Convolutional Neural Network for IoT Network Intrusion Detection.
    Matches exact layer specification of the SmartCity1DCNN architecture:
    - Layer 1: Conv1D (in=1, out=32, k=3, p=1) -> BatchNorm1d -> LeakyReLU(0.1) -> MaxPool1d(2)
    - Layer 2: Conv1D (in=32, out=64, k=3, p=1) -> BatchNorm1d -> LeakyReLU(0.1) -> MaxPool1d(2)
    - Layer 3: Conv1D (in=64, out=128, k=3, p=1) -> BatchNorm1d -> LeakyReLU(0.1)
    - Layer 4: AdaptiveAvgPool1d(1) -> Flatten
    - Layer 5: Linear(128 -> 64) -> ReLU -> Dropout(0.3)
    - Classifier Head: Linear(64 -> 4)
    """
    def __init__(self, num_classes: int = 4):
        super(SmartCity1DCNN, self).__init__()
        
        # Layer 1
        self.conv1 = nn.Conv1d(in_channels=1, out_channels=32, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm1d(32)
        self.act1 = nn.LeakyReLU(negative_slope=0.1)
        self.pool1 = nn.MaxPool1d(kernel_size=2)
        
        # Layer 2
        self.conv2 = nn.Conv1d(in_channels=32, out_channels=64, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm1d(64)
        self.act2 = nn.LeakyReLU(negative_slope=0.1)
        self.pool2 = nn.MaxPool1d(kernel_size=2)
        
        # Layer 3
        self.conv3 = nn.Conv1d(in_channels=64, out_channels=128, kernel_size=3, padding=1)
        self.bn3 = nn.BatchNorm1d(128)
        self.act3 = nn.LeakyReLU(negative_slope=0.1)
        
        # Layer 4
        self.adaptive_pool = nn.AdaptiveAvgPool1d(output_size=1)
        self.flatten = nn.Flatten()
        
        # Layer 5
        self.fc1 = nn.Linear(128, 64)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(p=0.3)
        
        # Classifier Head
        self.classifier = nn.Linear(64, num_classes)

    def forward(self, x):
        # x shape: (N, 1, num_features)
        x = self.pool1(self.act1(self.bn1(self.conv1(x))))
        x = self.pool2(self.act2(self.bn2(self.conv2(x))))
        x = self.act3(self.bn3(self.conv3(x)))
        x = self.adaptive_pool(x)
        x = self.flatten(x)
        x = self.dropout(self.relu(self.fc1(x)))
        out = self.classifier(x)
        return out


# ==========================================
# 2. LABEL MAPPING HELPER
# ==========================================
def map_label(label_str: str) -> int:
    """
    Maps CIC-IoT2023 attack strings into 4 discrete integer categories:
    0: Benign
    1: DDoS / Flood
    2: Recon / PortScan
    3: Spoofing / Other
    """
    lbl = str(label_str).upper().strip()
    
    if lbl == "BENIGN":
        return 0
    
    # DDoS / Flood attacks
    if any(k in lbl for k in ["DDOS", "DOS", "MIRAI", "FLOOD", "SLOWLORIS"]):
        return 1
    
    # Recon / Scanning attacks
    if any(k in lbl for k in ["RECON", "SCAN", "DISCOVERY", "PINGSWEEP"]):
        return 2
    
    # Spoofing / Web attacks / Injections / Malware
    if any(k in lbl for k in ["SPOOF", "INJECTION", "BRUTEFORCE", "HIJACK", "MALWARE", "XSS", "ATTACK", "MITM"]):
        return 3
    
    # Default fallback to Spoofing/Other
    return 3


# ==========================================
# 3. DATA INGESTION & PREPROCESSING
# ==========================================
def load_and_preprocess_data(data_dir: str = "."):
    """
    Locates and concatenates Merged61.csv, Merged62.csv, Merged63.csv.
    Cleans infinite and NaN rows, maps labels, fits and saves MinMaxScaler.
    """
    candidate_files = [
        os.path.join(data_dir, "Merged61.csv"),
        os.path.join(data_dir, "Merged62.csv"),
        os.path.join(data_dir, "Merged63.csv")
    ]
    existing_files = [f for f in candidate_files if os.path.exists(f)]
    
    if not existing_files:
        fallback_csv = os.path.join("dl_engine", "iot_traffic_data.csv")
        if not os.path.exists(fallback_csv):
            print("[Data] No CSV found. Invoking synthetic benchmark generator...")
            from dl_engine.generate_benchmark import generate_synthetic_data
            fallback_csv = generate_synthetic_data(num_samples=30000, output_path=fallback_csv)
        existing_files = [fallback_csv]

    print(f"[Data] Loading {len(existing_files)} source files:")
    dfs = []
    total_raw_rows = 0
    for fpath in existing_files:
        print(f"  - Reading {fpath} ({os.path.getsize(fpath) / (1024*1024):.2f} MB)...")
        df_part = pd.read_csv(fpath)
        total_raw_rows += len(df_part)
        print(f"    Loaded {len(df_part):,} rows, {len(df_part.columns)} columns.")
        dfs.append(df_part)
        
    df = pd.concat(dfs, ignore_index=True)
    print(f"[Data] Total raw records combined: {len(df):,}")

    # Identify Label column
    label_col = None
    for col in ["Label", "label", "LABEL"]:
        if col in df.columns:
            label_col = col
            break
    if not label_col:
        raise ValueError("Could not find 'Label' column in dataset.")

    # Drop inf, -inf and NaNs
    feature_cols = [c for c in df.columns if c != label_col]
    print(f"[Data] Number of feature columns: {len(feature_cols)}")

    print("[Data] Cleaning infinite and NaN rows...")
    # Replace inf and -inf with NaN across numeric features
    df[feature_cols] = df[feature_cols].replace([np.inf, -np.inf], np.nan)
    before_drop = len(df)
    df.dropna(subset=feature_cols + [label_col], inplace=True)
    dropped_count = before_drop - len(df)
    print(f"[Data] Dropped {dropped_count:,} invalid rows. Clean records remaining: {len(df):,}")

    # Map labels
    print("[Data] Mapping string labels to 4 target classes...")
    df["target"] = df[label_col].apply(map_label).astype(np.int64)
    target_counts = df["target"].value_counts().sort_index().to_dict()
    class_names = {0: "Benign", 1: "DDoS/Flood", 2: "Recon/PortScan", 3: "Spoofing/Other"}
    for k, v in target_counts.items():
        print(f"  Class {k} ({class_names.get(k, 'Unknown')}): {v:,} samples ({v / len(df) * 100:.2f}%)")

    # Fit MinMaxScaler across features
    print("[Data] Fitting Scikit-Learn MinMaxScaler...")
    X_raw = df[feature_cols].values.astype(np.float32)
    y_raw = df["target"].values.astype(np.int64)

    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X_raw)

    scaler_path = os.path.join("dl_engine", "scaler.pkl")
    os.makedirs(os.path.dirname(scaler_path), exist_ok=True)
    joblib.dump(scaler, scaler_path)
    print(f"[Data] Exported fitted scaler to {scaler_path} ({os.path.getsize(scaler_path):,} bytes)")

    # Stratified Split: 80% train, 20% test
    print("[Data] Performing stratified 80/20 train/test split...")
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y_raw, test_size=0.20, stratify=y_raw, random_state=42
    )
    print(f"  Train set: {X_train.shape[0]:,} samples")
    print(f"  Test set:  {X_test.shape[0]:,} samples")

    # Reshape input matrices into 3D tensors: shape (N, 1, num_features)
    X_train = np.expand_dims(X_train, axis=1)
    X_test = np.expand_dims(X_test, axis=1)
    print(f"[Data] 3D Tensor shapes -> X_train: {X_train.shape}, X_test: {X_test.shape}")

    return X_train, X_test, y_train, y_test, scaler, feature_cols


# ==========================================
# 4. FULL-POTENTIAL GPU ACCELERATED TRAINING ENGINE
# ==========================================
def train_and_evaluate(
    X_train, X_test, y_train, y_test,
    epochs: int = 20,
    batch_size: int = 1024,
    learning_rate: float = 0.002,
    model_save_path: str = "dl_engine/iot_cnn_model.pt",
    use_amp: bool = True
):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    is_cuda = torch.cuda.is_available()
    
    if is_cuda:
        torch.backends.cudnn.benchmark = True
        torch.backends.cuda.matmul.allow_tf32 = True
        torch.backends.cudnn.allow_tf32 = True
    
    print("\n" + "="*60)
    print("NVIDIA GPU HARDWARE ACCELERATION STATUS:")
    print(f"  Execution Device: {device}")
    if is_cuda:
        props = torch.cuda.get_device_properties(0)
        print(f"  GPU Architecture: {props.name}")
        print(f"  Total VRAM:       {props.total_memory / (1024**3):.2f} GB")
        print(f"  SM Count / Cores: {props.multi_processor_count} SMs")
        print(f"  CUDA Version:     {torch.version.cuda}")
        print(f"  cuDNN Benchmark:  ENABLED (Auto-Tuner Active)")
        print(f"  Automatic Mixed Precision (AMP FP16): {'ENABLED' if use_amp else 'DISABLED'}")
    print("="*60 + "\n")

    num_train = X_train.shape[0]
    num_test = X_test.shape[0]

    # Preload entire dataset directly to GPU VRAM for zero PCIe latency
    if is_cuda:
        print("[GPU Optimization] Pre-allocating training & validation tensors directly in GPU VRAM...")
        X_train_gpu = torch.from_numpy(X_train).to(device, dtype=torch.float32)
        y_train_gpu = torch.from_numpy(y_train).to(device, dtype=torch.long)
        X_test_gpu = torch.from_numpy(X_test).to(device, dtype=torch.float32)
        y_test_gpu = torch.from_numpy(y_test).to(device, dtype=torch.long)
        
        train_mem = (X_train_gpu.element_size() * X_train_gpu.nelement() + y_train_gpu.element_size() * y_train_gpu.nelement()) / (1024**2)
        test_mem = (X_test_gpu.element_size() * X_test_gpu.nelement() + y_test_gpu.element_size() * y_test_gpu.nelement()) / (1024**2)
        print(f"[GPU Memory] Train VRAM footprint: {train_mem:.1f} MB | Test VRAM footprint: {test_mem:.1f} MB")
        print(f"[GPU Memory] Current Allocated VRAM: {torch.cuda.memory_allocated() / (1024**2):.1f} MB / {props.total_memory / (1024**2):.1f} MB\n")
    else:
        X_train_gpu = torch.from_numpy(X_train)
        y_train_gpu = torch.from_numpy(y_train)
        X_test_gpu = torch.from_numpy(X_test)
        y_test_gpu = torch.from_numpy(y_test)

    # Instantiate Model, Criterion, Optimizer & Scaler
    model = SmartCity1DCNN(num_classes=4).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    scaler_amp = torch.amp.GradScaler('cuda', enabled=(is_cuda and use_amp))

    steps_per_epoch = (num_train + batch_size - 1) // batch_size
    print(f"[Training] Model: SmartCity1DCNN (Params: {sum(p.numel() for p in model.parameters()):,})")
    print(f"[Training] Total Epochs: {epochs} | Batch Size: {batch_size:,} | Steps/Epoch: {steps_per_epoch:,}\n")

    training_history = []
    start_total_time = time.time()

    for epoch in range(1, epochs + 1):
        epoch_start = time.time()
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        # Ultra-fast GPU random permutation
        if is_cuda:
            perm = torch.randperm(num_train, device=device)
        else:
            perm = torch.randperm(num_train)

        log_interval = max(1, steps_per_epoch // 4)

        for step in range(steps_per_epoch):
            start_idx = step * batch_size
            end_idx = min(start_idx + batch_size, num_train)
            batch_indices = perm[start_idx:end_idx]

            batch_x = X_train_gpu[batch_indices]
            batch_y = y_train_gpu[batch_indices]
            bs = batch_x.size(0)

            optimizer.zero_grad(set_to_none=True)

            # Mixed Precision Forward
            with torch.amp.autocast('cuda', enabled=(is_cuda and use_amp)):
                outputs = model(batch_x)
                loss = criterion(outputs, batch_y)

            scaler_amp.scale(loss).backward()
            scaler_amp.step(optimizer)
            scaler_amp.update()

            running_loss += loss.item() * bs
            _, preds = torch.max(outputs, 1)
            correct += (preds == batch_y).sum().item()
            total += bs

            cur_step = step + 1
            if cur_step % log_interval == 0 or cur_step == steps_per_epoch:
                cur_loss = running_loss / total
                cur_acc = (correct / total) * 100.0
                elapsed = time.time() - epoch_start
                rate = total / max(0.0001, elapsed)
                pct = (cur_step / steps_per_epoch) * 100.0
                print(f"  Epoch [{epoch:02d}/{epochs:02d}] - Step [{cur_step:04d}/{steps_per_epoch:04d}] "
                      f"({pct:3.0f}%) | Loss: {cur_loss:.4f} | Acc: {cur_acc:6.2f}% | Throughput: {rate:,.0f} samples/s",
                      flush=True)

        epoch_loss = running_loss / total
        epoch_acc = (correct / total) * 100.0

        # Fast Validation on GPU
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        val_batch_size = batch_size * 4
        val_steps = (num_test + val_batch_size - 1) // val_batch_size

        with torch.no_grad():
            for v_step in range(val_steps):
                v_start = v_step * val_batch_size
                v_end = min(v_start + val_batch_size, num_test)
                val_x = X_test_gpu[v_start:v_end]
                val_y = y_test_gpu[v_start:v_end]
                v_bs = val_x.size(0)

                with torch.amp.autocast('cuda', enabled=(is_cuda and use_amp)):
                    val_out = model(val_x)
                    v_loss = criterion(val_out, val_y)

                val_loss += v_loss.item() * v_bs
                _, v_preds = torch.max(val_out, 1)
                val_correct += (v_preds == val_y).sum().item()
                val_total += v_bs

        epoch_val_loss = val_loss / val_total
        epoch_val_acc = (val_correct / val_total) * 100.0
        epoch_duration = time.time() - epoch_start

        print(f"\n>>> EPOCH [{epoch:02d}/{epochs:02d}] COMPLETED in {epoch_duration:.2f}s <<<", flush=True)
        print(f"    Train Loss: {epoch_loss:.4f} | Train Acc: {epoch_acc:6.2f}%", flush=True)
        print(f"    Val Loss:   {epoch_val_loss:.4f} | Val Acc:   {epoch_val_acc:6.2f}%\n" + "-"*60, flush=True)

        training_history.append({
            "epoch": epoch,
            "train_loss": epoch_loss,
            "train_acc": epoch_acc,
            "val_loss": epoch_val_loss,
            "val_acc": epoch_val_acc,
            "duration": epoch_duration
        })

    total_training_time = time.time() - start_total_time
    print(f"\n[Training] All {epochs} Epochs Completed in {total_training_time:.2f} seconds ({total_training_time/60:.2f} mins).")

    # Save model weights
    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
    torch.save(model.state_dict(), model_save_path)
    print(f"[Model] Saved PyTorch weights to: {model_save_path} ({os.path.getsize(model_save_path):,} bytes)")

    # Final Comprehensive Evaluation on Test Set
    print("\n" + "="*60)
    print("FINAL TEST SPLIT EVALUATION (20% Split - 368,243 samples)")
    print("="*60)
    model.eval()
    all_preds = []
    eval_batch_size = 4096
    eval_steps = (num_test + eval_batch_size - 1) // eval_batch_size

    with torch.no_grad():
        for e_step in range(eval_steps):
            e_start = e_step * eval_batch_size
            e_end = min(e_start + eval_batch_size, num_test)
            e_x = X_test_gpu[e_start:e_end]
            with torch.amp.autocast('cuda', enabled=(is_cuda and use_amp)):
                logits = model(e_x)
            _, p = torch.max(logits, 1)
            all_preds.append(p.cpu())

    all_preds = torch.cat(all_preds).numpy()
    all_targets = y_test

    overall_acc = accuracy_score(all_targets, all_preds) * 100.0
    cm = confusion_matrix(all_targets, all_preds)
    target_names = ["0: Benign", "1: DDoS/Flood", "2: Recon/PortScan", "3: Spoofing/Other"]
    report = classification_report(all_targets, all_preds, target_names=target_names, digits=4)

    print(f"\nOVERALL TEST ACCURACY: {overall_acc:.4f}%\n")
    print("CONFUSION MATRIX:")
    print(f"{'':>18} | " + " | ".join(f"{t:>17}" for t in target_names))
    print("-" * 92)
    for i, row in enumerate(cm):
        row_str = " | ".join(f"{val:>17,}" for val in row)
        print(f"{target_names[i]:>18} | {row_str}")
    print("-" * 92)

    print("\nDETAILED CLASSIFICATION REPORT:")
    print(report)

    if overall_acc >= 95.0:
        print(f"\n[PASS] Verification Passed: Test Accuracy ({overall_acc:.2f}%) exceeds the 95.0% threshold!")
    else:
        print(f"\n[WARNING] Test Accuracy ({overall_acc:.2f}%) did not meet the 95.0% threshold.")

    return model, overall_acc, training_history


# ==========================================
# 5. ENTRY POINT
# ==========================================
def main():
    parser = argparse.ArgumentParser(description="Train SmartCity1DCNN on CIC-IoT2023 dataset.")
    parser.add_argument("--data_dir", type=str, default=".", help="Directory containing dataset CSVs")
    parser.add_argument("--epochs", type=int, default=20, help="Number of training epochs (default: 20)")
    parser.add_argument("--batch_size", type=int, default=1024, help="Batch size (default: 1024)")
    parser.add_argument("--lr", type=float, default=0.002, help="Learning rate (default: 0.002)")
    args = parser.parse_args()

    print("="*60)
    print("STARTING AUTONOMOUS DEEP LEARNING PIPELINE")
    print(f"Epochs: {args.epochs} | Batch Size: {args.batch_size} | Learning Rate: {args.lr}")
    print("="*60)

    X_train, X_test, y_train, y_test, scaler, features = load_and_preprocess_data(args.data_dir)

    model, acc, history = train_and_evaluate(
        X_train, X_test, y_train, y_test,
        epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr
    )

    # Automatically generate IEEE research publication figures
    try:
        from dl_engine.generate_ieee_visualizations import generate_all_figures
        generate_all_figures(history=history)
    except Exception as e:
        print(f"[Warning] Figure generation encountered: {e}")

if __name__ == "__main__":
    main()
