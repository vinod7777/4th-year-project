import React, { useState } from 'react';
import { X, FileText, Download, ExternalLink } from 'lucide-react';

const IEEE_FIGURES = {
  1: {
    title: "Fig 1: Convergence Dynamics",
    src: "/ieee_figures/fig1_convergence_curves.png",
    caption: "Fig. 1: Cross-entropy loss and accuracy curves across 20 training epochs illustrating smooth convergence on NVIDIA RTX 3050 GPU (98.69% Test Accuracy on 368,243 test split records)."
  },
  2: {
    title: "Fig 2: Confusion Matrix",
    src: "/ieee_figures/fig2_confusion_matrix.png",
    caption: "Fig. 2: Multi-class confusion matrix showing absolute classification counts and normalized true positive rates across 368,243 test split records (DDoS class recall: 100.00%, Benign recall: 87.71%)."
  },
  3: {
    title: "Fig 3: ROC Curves & AUC",
    src: "/ieee_figures/fig3_roc_curves.png",
    caption: "Fig. 3: One-vs-Rest Receiver Operating Characteristic (ROC) curves across Benign, DDoS, Recon, and Spoofing classes with a Macro-Average AUC of 0.9959."
  },
  4: {
    title: "Fig 4: Precision-Recall Curves",
    src: "/ieee_figures/fig4_precision_recall_curves.png",
    caption: "Fig. 4: Precision-Recall curves under class imbalance demonstrating resilient multi-class detection fidelity (Mean AP = 0.9885)."
  },
  5: {
    title: "Fig 5: Per-Class Benchmark",
    src: "/ieee_figures/fig5_per_class_metrics.png",
    caption: "Fig. 5: Grouped bar benchmark of Precision, Recall, and F1-Scores across all 4 operational target classes."
  },
  6: {
    title: "Fig 6: Feature Saliency",
    src: "/ieee_figures/fig6_feature_importance.png",
    caption: "Fig. 6: Top-15 network flow feature contributions derived from 1D-CNN convolutional filter attribution (Rate, IAT, and Tot sum as key discriminators)."
  },
  7: {
    title: "Fig 7: Model Architecture",
    src: "/ieee_figures/fig7_model_architecture.png",
    caption: "Fig. 7: End-to-end layered topology of SmartCity1DCNN showing sequential 1D convolutions, batch normalization, LeakyReLU activations, adaptive pooling, and classification head."
  }
};

export default function IeeeModal({ isOpen, onClose }) {
  const [activeFig, setActiveFig] = useState(1);

  if (!isOpen) return null;

  const current = IEEE_FIGURES[activeFig];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0a0f1d] border border-cyan-500/40 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="font-bold text-sm text-white tracking-wide">
                IEEE Research Publication Visualizations (300 DPI)
              </h3>
              <p className="text-[10px] text-slate-400">
                PyTorch SmartCity1DCNN Trained on 1.84M Rows across 20 Epochs on NVIDIA RTX 3050
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-1 p-2 bg-slate-950 border-b border-slate-800 text-xs">
          {Object.entries(IEEE_FIGURES).map(([key, fig]) => {
            const num = parseInt(key);
            const isCurrent = activeFig === num;
            return (
              <button
                key={num}
                onClick={() => setActiveFig(num)}
                className={`px-2.5 py-1 rounded transition-all ${
                  isCurrent 
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Fig {num}
              </button>
            );
          })}
        </div>

        {/* Figure View Area */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col items-center justify-center bg-black/40">
          <img 
            src={current.src} 
            alt={current.title} 
            className="max-h-[500px] object-contain rounded-lg border border-slate-800 shadow-2xl"
          />
          <p className="text-xs text-slate-300 text-center mt-3 max-w-2xl font-mono leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            {current.caption}
          </p>
        </div>

      </div>
    </div>
  );
}
