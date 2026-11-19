import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("App render error:", error, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
          <div className="max-w-md text-center space-y-3">
            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="text-sm text-neutral-400">The app hit a render error. Try reloading.</p>
            <pre className="text-xs text-rose-300 bg-white/5 border border-white/10 rounded-xl p-3 text-left overflow-auto max-h-40 whitespace-pre-wrap">{String(this.state.error?.message || this.state.error)}</pre>
            <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black font-semibold text-sm">Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}