# Smart City Cyber Defense Digital Twin & Blockchain Ledger

A decentralized, real-time autonomous cyber defense system for municipal IoT infrastructure, combining deep learning anomaly detection, an immutable Ethereum/Ganache ledger, and an interactive 3D WebGL Digital Twin command center.

---

## 🌟 Key Architecture & Highlights

- **Deep Learning Intrusion Detection (1D-CNN)**:
  - Trained on 39 SCADA IoT features (`Merged62.csv`).
  - Classifies traffic into Benign (Class 0), DDoS/Flooding (Class 1), Recon/PortScan (Class 2), and Spoofing (Class 3).
  - Pre-trained PyTorch weights (`iot_cnn_model.pt`) and feature scaler (`scaler.pkl`) included.
- **Dual-Mode Blockchain Ledger**:
  - Solidity smart contract (`SmartCitySecurityLedger.sol`) deployed to Ethereum/Ganache testnet.
  - Automatically commits cryptographic threat records on-chain with SHA-256 evidence digests and gas tracking.
- **Real-Time Digital Twin & 3D Blockchain Visualizer**:
  - React 18 frontend with Three.js and GSAP physics-based block mining animations.
  - 2D Cartographic GIS Map of 20 municipal infrastructure nodes across Greater Hyderabad / Medchal.
  - Real-time telemetry streaming via WebSocket and fallback HTTP polling.
- **SCADA Telemetry Simulation**:
  - Ready-to-import Node-RED flows (`simulation/node_red_flows.json`) simulating live multi-node SCADA traffic and cyber attacks.

---

## 🚀 Quick Start Guide

### 1. Start Blockchain (Ganache)
Launch Ganache on port `7545` (or `8545`):
```bash
python blockchain/deploy_ledger.py
python blockchain/check_balance.py
```

### 2. Launch Central Gateway & DL Engine
```bash
python backend/server.py
```
Health status check: `http://127.0.0.1:5000/api/health`

### 3. Launch Frontend Dashboard
```bash
cd frontend_react
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Start SCADA Telemetry Stream
```bash
node-red
```
Import `simulation/node_red_flows.json` at `http://localhost:1880` and click **Deploy**.
Use the inject buttons to trigger normal SCADA traffic or simulate cyber attacks (DDoS, PortScan, Spoofing).

---

## 📊 Repository Structure

```
├── backend/
│   ├── server.py              # Flask + Socket.IO + PyTorch DL Gateway
│   └── test_pipeline.py       # End-to-end integration test
├── blockchain/
│   ├── SmartCitySecurityLedger.sol  # EVM Smart Contract
│   ├── deploy_ledger.py       # Ganache deployment script
│   ├── check_balance.py       # Balance & transaction inspector
│   └── contract_info.json     # ABI and deployed address
├── dl_engine/
│   ├── iot_cnn_model.pt       # Pre-trained 1D-CNN neural weights
│   ├── scaler.pkl             # Fitted telemetry scaler
│   ├── train_model.py         # PyTorch training script
│   ├── test_model_ui.py       # Gradio testing interface
│   ├── generate_ieee_visualizations.py # IEEE metric plots
│   └── ieee_figures/          # ROC, PR, Confusion Matrix figures
├── frontend_react/            # React + Three.js + GSAP Dashboard
└── simulation/
    └── node_red_flows.json    # Node-RED SCADA simulation flow
```
