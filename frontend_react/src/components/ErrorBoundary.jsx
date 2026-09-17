import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('[ErrorBoundary] Caught component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl text-red-300 font-mono text-xs">
          <div className="font-bold text-red-400 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Component Rendering Notice
          </div>
          <div className="text-[10px] text-red-300/80">{this.state.error?.message || 'Component temporarily recovering...'}</div>
        </div>
      );
    }
    return this.props.children;
  }
}
