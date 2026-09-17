# Deep Learning Anomaly Detection Engine

This module houses the 1D-CNN deep learning intrusion detection system for the Smart City Cyber Defense Digital Twin.

## Files
- `iot_cnn_model.pt`: Pre-trained PyTorch 1D-CNN neural network weights (39 input features, 4 output anomaly classes).
- `scaler.pkl`: Fitted StandardScaler pipeline for normalizing real-time 39-feature SCADA telemetry.
- `train_model.py`: Script to train and evaluate the model from training datasets.
- `test_model_ui.py`: Interactive Gradio testing UI.
- `generate_ieee_visualizations.py`: Generates IEEE publication-standard benchmark charts.
- `ieee_figures/`: High-resolution figures (ROC curves, confusion matrix, feature importance, etc.).

## Dataset Notice
- The training datasets (`Merged61.csv`, `Merged62.csv`, `Merged63.csv`) exceed GitHub's 100MB file size limit and are kept locally or hosted externally.
- Place `Merged62.csv` in this folder (`dl_engine/`) to re-train the model using `python train_model.py`.
