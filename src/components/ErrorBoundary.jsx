import { Component } from "react";
import { C } from "../theme";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[ErrorBoundary:${this.props.name}]`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: 40, gap: 16, minHeight: 200,
          background: C.surface, borderRadius: 12,
          border: `1px solid ${C.danger}30`,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: C.dangerDim, display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 20, color: C.danger, fontWeight: 700,
          }}>!</div>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0 }}>
            {this.props.name || "Panel"} encountered an error
          </p>
          <p style={{
            fontSize: 11, color: C.textMuted, margin: 0,
            fontFamily: "'JetBrains Mono', monospace", maxWidth: 300,
            textAlign: "center", lineHeight: 1.5,
          }}>
            {this.state.error?.message || "Something went wrong"}
          </p>
          <button onClick={this.handleReset} style={{
            padding: "8px 20px", border: `1px solid ${C.accent}`,
            borderRadius: 8, background: C.accentGlow, color: C.accent,
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
