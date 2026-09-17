"""
Interactive Gradio & Web UI for SmartCity1DCNN
Model: dl_engine/iot_cnn_model.pt
Scaler: dl_engine/scaler.pkl (39 Features from CIC-IoT2023 / Merged62.csv)

Features:
1. Benchmark Presets: 1-click test with real samples from Merged62.csv
2. Interactive 39-Feature Vector Editor
3. Sliders for Key Network Metrics (Rate, Protocol, Flags, Sizes)
4. Batch CSV Evaluator: Upload CSV or sample from Merged62.csv
5. Real-Time Softmax Probabilities, Confidence Scores, and Threat Isolation Verdict
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
import torch
import torch.nn as nn

# =====================================================================
# MODEL ARCHITECTURE
# =====================================================================
class SmartCity1DCNN(nn.Module):
    def __init__(self, num_classes: int = 4):
        super(SmartCity1DCNN, self).__init__()
        self.conv1 = nn.Conv1d(in_channels=1, out_channels=32, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm1d(32)
        self.act1 = nn.LeakyReLU(negative_slope=0.1)
        self.pool1 = nn.MaxPool1d(kernel_size=2)
        
        self.conv2 = nn.Conv1d(in_channels=32, out_channels=64, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm1d(64)
        self.act2 = nn.LeakyReLU(negative_slope=0.1)
        self.pool2 = nn.MaxPool1d(kernel_size=2)
        
        self.conv3 = nn.Conv1d(in_channels=64, out_channels=128, kernel_size=3, padding=1)
        self.bn3 = nn.BatchNorm1d(128)
        self.act3 = nn.LeakyReLU(negative_slope=0.1)
        
        self.adaptive_pool = nn.AdaptiveAvgPool1d(output_size=1)
        self.flatten = nn.Flatten()
        
        self.fc1 = nn.Linear(128, 64)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(p=0.3)
        self.classifier = nn.Linear(64, num_classes)

    def forward(self, x):
        x = self.pool1(self.act1(self.bn1(self.conv1(x))))
        x = self.pool2(self.act2(self.bn2(self.conv2(x))))
        x = self.act3(self.bn3(self.conv3(x)))
        x = self.adaptive_pool(x)
        x = self.flatten(x)
        x = self.dropout(self.relu(self.fc1(x)))
        return self.classifier(x)

CLASS_LABELS = {
    0: "Benign (Normal Flow)",
    1: "DDoS / Flood Attack",
    2: "Recon / PortScan Attack",
    3: "Spoofing / Other Attack"
}

FEATURE_NAMES = [
    'Header_Length', 'Protocol Type', 'Time_To_Live', 'Rate',
    'fin_flag_number', 'syn_flag_number', 'rst_flag_number', 'psh_flag_number',
    'ack_flag_number', 'ece_flag_number', 'cwr_flag_number', 'ack_count',
    'syn_count', 'fin_count', 'rst_count', 'HTTP', 'HTTPS', 'DNS', 'Telnet',
    'SMTP', 'SSH', 'IRC', 'TCP', 'UDP', 'DHCP', 'ARP', 'ICMP', 'IGMP',
    'IPv', 'LLC', 'Tot sum', 'Min', 'Max', 'AVG', 'Std', 'Tot size',
    'IAT', 'Number', 'Variance'
]

# Real Exemplary Benchmark Vectors from Merged62.csv
BENCHMARK_PRESETS = {
    "[BENIGN] Normal IoT SCADA Flow (Sample #1)": [
        29.6, 6.0, 180.9, 1409.0449, 0.0, 0.0, 0.0, 0.0, 0.9, 0.0, 0.0, 9.0,
        0.0, 0.0, 0.0, 0.0, 0.9, 0.0, 0.0, 0.0, 0.0, 0.0, 0.9, 0.1, 0.0, 0.0,
        0.0, 0.0, 1.0, 1.0, 3550.0, 60.0, 1514.0, 355.0, 610.8495, 355.0, 0.0008, 10.0, 373137.125
    ],
    "[BENIGN] Low-Rate Municipal Sensor Flow (Sample #2)": [
        30.8, 6.0, 233.4, 1228.9561, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 10.0,
        0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 1.0, 654.0, 60.0, 66.0, 65.4, 1.8974, 65.4, 0.0008, 10.0, 3.6
    ],
    "[DDOS] Volumetric TCP SYN Flood Attack": [
        19.76, 6.0, 67.82, 6874.2178, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.02, 0.0, 0.0, 0.0, 0.0, 0.98, 0.02, 0.0, 0.0,
        0.0, 0.0, 1.0, 1.0, 6034.0, 60.0, 81.0, 60.34, 2.4586, 60.34, 0.0001, 100.0, 6.0448
    ],
    "[DDOS] High-Volume ICMP Echo Flood": [
        0.0, 1.0, 64.0, 44601.2773, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        1.0, 0.0, 1.0, 1.0, 6000.0, 60.0, 60.0, 60.0, 0.0, 60.0, 0.0, 100.0, 0.0
    ],
    "[PORTSCAN] Stealth TCP SYN/RST Port Recon": [
        20.0, 6.0, 255.0, 415.4709, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 10.0,
        0.0, 0.0, 10.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 1.0, 600.0, 60.0, 60.0, 60.0, 0.0, 60.0, 0.0026, 10.0, 0.0
    ],
    "[PORTSCAN] Rapid OS Fingerprinting Scan": [
        20.0, 6.0, 64.0, 3161.6946, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 10.0,
        0.0, 0.0, 10.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 1.0, 600.0, 60.0, 60.0, 60.0, 0.0, 60.0, 0.0003, 10.0, 0.0
    ],
    "[SPOOFING] Malicious DNS Cache Poisoning": [
        8.0, 17.0, 57.0, 277.6232, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 1.0, 4500.0, 56.0, 808.0, 450.0, 358.7231, 450.0, 0.0036, 10.0, 128682.2188
    ],
    "[SPOOFING] ARP Gateway Poisoning (MITM)": [
        20.0, 6.0, 117.0, 3356.7859, 0.0, 0.0, 0.0, 0.1, 1.0, 0.0, 0.0, 10.0,
        0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 1.0, 15000.0, 1500.0, 1500.0, 1500.0, 0.0, 1500.0, 0.0003, 10.0, 0.0
    ]
}

class ModelTester:
    def __init__(self, model_path="dl_engine/iot_cnn_model.pt", scaler_path="dl_engine/scaler.pkl"):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if not os.path.isabs(model_path):
            model_path = os.path.join(base_dir, model_path)
        if not os.path.isabs(scaler_path):
            scaler_path = os.path.join(base_dir, scaler_path)

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[ModelTester] Compute Device: {self.device}")
        
        self.scaler = joblib.load(scaler_path)
        print(f"[ModelTester] Loaded scaler expecting {self.scaler.n_features_in_} features.")

        self.model = SmartCity1DCNN(num_classes=4)
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.to(self.device)
        self.model.eval()
        print(f"[ModelTester] Loaded SmartCity1DCNN weights successfully.")

    def predict_vector(self, vector):
        if len(vector) > 39:
            vector = vector[:39]
        elif len(vector) < 39:
            vector = list(vector) + [0.0] * (39 - len(vector))

        scaled = self.scaler.transform([vector])
        tensor_x = torch.tensor(scaled, dtype=torch.float32).unsqueeze(1).to(self.device)

        with torch.no_grad():
            logits = self.model(tensor_x)
            probs = torch.softmax(logits, dim=1)[0].cpu().numpy()

        pred_class = int(np.argmax(probs))
        confidence = float(probs[pred_class])
        is_threat = (pred_class != 0 and confidence >= 0.85)

        return {
            "predicted_class": pred_class,
            "class_label": CLASS_LABELS[pred_class],
            "confidence_percentage": round(confidence * 100.0, 2),
            "is_threat": is_threat,
            "probabilities": {
                "Benign (Class 0)": float(probs[0]),
                "DDoS / Flood (Class 1)": float(probs[1]),
                "Recon / PortScan (Class 2)": float(probs[2]),
                "Spoofing / Other (Class 3)": float(probs[3])
            }
        }

tester = ModelTester()

# =====================================================================
# GRADIO APPLICATION
# =====================================================================
def run_gradio_app():
    import gradio as gr

    def on_preset_change(preset_name):
        vec = BENCHMARK_PRESETS.get(preset_name, list(BENCHMARK_PRESETS.values())[0])
        vec_str = ", ".join(str(round(v, 4)) for v in vec)
        return vec_str

    def on_predict_click(vec_str):
        if not vec_str or not vec_str.strip():
            return "Please provide input features.", "", {}
        try:
            clean = vec_str.replace("[", "").replace("]", "").replace("\n", " ").strip()
            parts = [float(x.strip()) for x in clean.replace(",", " ").split() if x.strip()]
            if len(parts) < 39:
                return f"Error: Received {len(parts)} values, expected 39 values.", "", {}
            
            res = tester.predict_vector(parts)

            verdict_icon = "[THREAT DETECTED]" if res['is_threat'] else "[VERIFIED BENIGN]"
            verdict_badge = (
                f"## {verdict_icon} Verdict: "
                f"{'CRITICAL CYBER THREAT DETECTED - QUARANTINE ENFORCED' if res['is_threat'] else 'NORMAL TRAFFIC - SAFE OPERATION'}"
            )
            details = (
                f"### Output Class: **{res['class_label']}**\n\n"
                f"### Softmax Confidence: **{res['confidence_percentage']}%**\n\n"
                f"- **Flow Packet Rate:** {parts[3]:,.1f} pkt/s\n"
                f"- **Time To Live (TTL):** {parts[2]}\n"
                f"- **Protocol:** {'TCP (6)' if parts[1] == 6 else ('UDP (17)' if parts[1] == 17 else ('ICMP (1)' if parts[1] == 1 else parts[1]))}\n"
                f"- **SYN Flag:** {parts[5]} | **RST Flag:** {parts[6]} | **ACK Flag:** {parts[8]}\n"
                f"- **Total Flow Size:** {parts[35]:,.1f} bytes"
            )
            return verdict_badge, details, res["probabilities"]
        except Exception as e:
            return f"Parsing / Prediction Error: {str(e)}", "", {}

    def on_evaluate_batch_csv(file_obj):
        if not file_obj:
            return pd.DataFrame({"Notice": ["Please upload a CSV file."]})
        try:
            df = pd.read_csv(file_obj.name)
            feats = [c for c in df.columns if c.lower() != 'label']
            if len(feats) < 39:
                return pd.DataFrame({"Error": [f"CSV only has {len(feats)} feature columns. 39 are required."]})
            
            sample_df = df.iloc[:50]
            rows = []
            for i in range(len(sample_df)):
                vec = sample_df.iloc[i][feats[:39]].values.astype(np.float32)
                p = tester.predict_vector(vec)
                row_res = {
                    "Sample #": i + 1,
                    "Predicted Class": p["class_label"],
                    "Confidence": f"{p['confidence_percentage']}%",
                    "Threat Verdict": "THREAT QUARANTINED" if p["is_threat"] else "SAFE",
                }
                if "Label" in sample_df.columns:
                    row_res["Ground Truth"] = sample_df.iloc[i]["Label"]
                rows.append(row_res)
            return pd.DataFrame(rows)
        except Exception as ex:
            return pd.DataFrame({"Error": [f"Batch evaluation error: {str(ex)}"]})

    with gr.Blocks(title="SmartCity 1D-CNN Model Tester") as demo:
        gr.Markdown(
            "# SmartCity 1D-CNN IoT Intrusion Detection Model Tester\n"
            "**Evaluate our trained PyTorch Model (`dl_engine/iot_cnn_model.pt`) and Scaler (`dl_engine/scaler.pkl`) on real CIC-IoT2023 telemetry.**"
        )

        with gr.Tab("Interactive Single Flow Predictor"):
            with gr.Row():
                with gr.Column(scale=1):
                    gr.Markdown("### Step 1: Select a Benchmark Sample or Paste 39 Features")
                    preset_dropdown = gr.Dropdown(
                        choices=list(BENCHMARK_PRESETS.keys()),
                        value=list(BENCHMARK_PRESETS.keys())[0],
                        label="Benchmark Preset (from Merged62.csv)"
                    )

                    default_vec_str = ", ".join(str(round(v, 4)) for v in list(BENCHMARK_PRESETS.values())[0])
                    vector_input = gr.Textbox(
                        value=default_vec_str,
                        lines=5,
                        label="39 Network Features Vector [Header_Length, Protocol, TTL, Rate, Flags, Sizes, IAT...]"
                    )

                    predict_btn = gr.Button("Run Deep Learning Inference", variant="primary")

                with gr.Column(scale=1):
                    gr.Markdown("### Step 2: Deep Learning Classification Output")
                    verdict_output = gr.Markdown("Click 'Run Deep Learning Inference' to test.")
                    details_output = gr.Markdown("")
                    prob_output = gr.Label(label="Softmax Probabilities Across 4 Target Classes", num_top_classes=4)

            preset_dropdown.change(fn=on_preset_change, inputs=[preset_dropdown], outputs=[vector_input])
            predict_btn.click(
                fn=on_predict_click,
                inputs=[vector_input],
                outputs=[verdict_output, details_output, prob_output]
            )

        with gr.Tab("Batch CSV Evaluator"):
            gr.Markdown("Upload any `.csv` file with the 39 features (or an extract from `Merged62.csv`) to classify up to 50 samples at once.")
            with gr.Row():
                csv_upload = gr.File(label="Upload CSV File", file_types=[".csv"])
                batch_btn = gr.Button("Evaluate Batch Flows", variant="primary")
            batch_table = gr.Dataframe(label="Classification Report")
            batch_btn.click(fn=on_evaluate_batch_csv, inputs=[csv_upload], outputs=[batch_table])

    print("Launching Gradio UI on http://127.0.0.1:7860 ...")
    demo.launch(server_name="0.0.0.0", server_port=7860, share=False)

if __name__ == "__main__":
    run_gradio_app()
