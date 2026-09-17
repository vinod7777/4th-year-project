"""
Synthetic Benchmark Generator for CIC-IoT2023 feature schema.
Generates high-fidelity network flow traffic matching the 46 features of CIC-IoT2023.
Outputs dl_engine/iot_traffic_data.csv containing 30,000 rows.
"""

import os
import numpy as np
import pandas as pd

CIC_IOT_46_FEATURES = [
    "flow_duration", "Header_Length", "Protocol Type", "Duration", "Rate",
    "Srate", "Drate", "fin_flag_number", "syn_flag_number", "rst_flag_number",
    "psh_flag_number", "ack_flag_number", "ece_flag_number", "cwr_flag_number",
    "ack_count", "syn_count", "fin_count", "urg_count", "rst_count",
    "HTTP", "HTTPS", "DNS", "Telnet", "SMTP", "SSH", "IRC", "TCP", "UDP",
    "DHCP", "ARP", "ICMP", "IPv", "LLC", "Tot sum", "Min", "Max", "AVG",
    "Std", "Tot size", "IAT", "Number", "Magnitue", "Radius", "Covariance",
    "Variance", "Weight"
]

def generate_synthetic_data(num_samples: int = 30000, output_path: str = "dl_engine/iot_traffic_data.csv") -> str:
    print(f"[Benchmark] Generating {num_samples} synthetic CIC-IoT2023 samples...")
    np.random.seed(42)

    # 4 Target classes:
    # 0: Benign (20%)
    # 1: DDoS/Flood (50%)
    # 2: Recon/PortScan (15%)
    # 3: Spoofing/Other (15%)
    classes = ["BENIGN", "DDOS-UDP_FLOOD", "RECON-PORTSCAN", "DNS_SPOOFING"]
    class_probs = [0.20, 0.50, 0.15, 0.15]
    labels = np.random.choice(classes, size=num_samples, p=class_probs)

    data = {feat: np.zeros(num_samples, dtype=np.float32) for feat in CIC_IOT_46_FEATURES}

    for i, label in enumerate(labels):
        if label == "BENIGN":
            data["Header_Length"][i] = np.random.uniform(20.0, 60.0)
            data["Protocol Type"][i] = np.random.choice([6.0, 17.0, 1.0])
            data["Rate"][i] = np.random.exponential(15.0) + 1.0
            data["Time_To_Live"] = 64.0  # reference
            data["TCP"][i] = 1.0 if data["Protocol Type"][i] == 6.0 else 0.0
            data["UDP"][i] = 1.0 if data["Protocol Type"][i] == 17.0 else 0.0
            data["HTTP"][i] = np.random.choice([0.0, 1.0], p=[0.7, 0.3])
            data["HTTPS"][i] = np.random.choice([0.0, 1.0], p=[0.4, 0.6])
            data["IAT"][i] = np.random.uniform(0.01, 0.5)
            data["Tot sum"][i] = np.random.uniform(500.0, 50000.0)
            data["AVG"][i] = np.random.uniform(64.0, 1400.0)
            data["Variance"][i] = np.random.uniform(10.0, 500.0)
            data["flow_duration"][i] = np.random.uniform(0.1, 10.0)

        elif label == "DDOS-UDP_FLOOD":
            data["Header_Length"][i] = np.random.uniform(20.0, 32.0)
            data["Protocol Type"][i] = 17.0
            data["UDP"][i] = 1.0
            data["Rate"][i] = np.random.uniform(500.0, 10000.0)
            data["IAT"][i] = np.random.uniform(0.00001, 0.001)
            data["Tot sum"][i] = np.random.uniform(50000.0, 1000000.0)
            data["AVG"][i] = np.random.uniform(500.0, 1400.0)
            data["Variance"][i] = np.random.uniform(0.1, 20.0)
            data["flow_duration"][i] = np.random.uniform(1.0, 30.0)

        elif label == "RECON-PORTSCAN":
            data["Header_Length"][i] = 40.0
            data["Protocol Type"][i] = 6.0
            data["TCP"][i] = 1.0
            data["syn_flag_number"][i] = 1.0
            data["syn_count"][i] = np.random.uniform(10.0, 100.0)
            data["Rate"][i] = np.random.uniform(50.0, 500.0)
            data["IAT"][i] = np.random.uniform(0.001, 0.05)
            data["Tot sum"][i] = np.random.uniform(1000.0, 10000.0)
            data["AVG"][i] = 60.0
            data["Variance"][i] = 0.5
            data["flow_duration"][i] = np.random.uniform(0.05, 5.0)

        else:  # DNS_SPOOFING / MITM / Other
            data["Header_Length"][i] = np.random.uniform(20.0, 54.0)
            data["Protocol Type"][i] = np.random.choice([17.0, 6.0])
            data["DNS"][i] = 1.0 if data["Protocol Type"][i] == 17.0 else 0.0
            data["Rate"][i] = np.random.uniform(5.0, 80.0)
            data["IAT"][i] = np.random.uniform(0.005, 0.2)
            data["Tot sum"][i] = np.random.uniform(2000.0, 30000.0)
            data["AVG"][i] = np.random.uniform(100.0, 600.0)
            data["Variance"][i] = np.random.uniform(5.0, 150.0)
            data["flow_duration"][i] = np.random.uniform(0.2, 8.0)

        # Baseline noise and correlated features
        data["Srate"][i] = data["Rate"][i] * 0.8
        data["Drate"][i] = data["Rate"][i] * 0.2
        data["Min"][i] = max(0.0, data["AVG"][i] - np.sqrt(max(0.0, data["Variance"][i])))
        data["Max"][i] = data["AVG"][i] + np.sqrt(max(0.0, data["Variance"][i]))
        data["Std"][i] = np.sqrt(max(0.0, data["Variance"][i]))
        data["Tot size"][i] = data["Tot sum"][i]
        data["Number"][i] = max(1.0, data["Rate"][i] * max(0.1, data["flow_duration"][i]))
        data["Magnitue"][i] = np.sqrt(data["AVG"][i]**2 + data["Variance"][i])
        data["Weight"][i] = data["Number"][i]

    df = pd.DataFrame(data)
    df["Label"] = labels

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"[Benchmark] Saved {len(df)} rows across {len(df.columns)} columns to {output_path}")
    return output_path

if __name__ == "__main__":
    generate_synthetic_data()
