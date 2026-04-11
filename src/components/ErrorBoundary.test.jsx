import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement, useState } from "react";

// Mock theme
vi.mock("../theme", () => ({
  C: {
    surface: "#1e1e2e", danger: "#f38ba8", dangerDim: "#f38ba820",
    text: "#cdd6f4", textMuted: "#a6adc8", accent: "#a6e3a1",
    accentGlow: "#a6e3a110", bg: "#11111b",
  },
}));

import { ErrorBoundary } from "./ErrorBoundary";

// We can't use React Testing Library (not installed), so test the class directly

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    const boundary = new ErrorBoundary({ name: "Test", children: "hello" });
    boundary.state = { hasError: false, error: null };
    const result = boundary.render();
    expect(result).toBe("hello");
  });

  it("getDerivedStateFromError returns error state", () => {
    const err = new Error("boom");
    const state = ErrorBoundary.getDerivedStateFromError(err);
    expect(state).toEqual({ hasError: true, error: err });
  });

  it("componentDidCatch logs the error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const boundary = new ErrorBoundary({ name: "TestPanel" });
    const err = new Error("test error");
    boundary.componentDidCatch(err, { componentStack: "stack" });
    expect(spy).toHaveBeenCalledWith(
      "[ErrorBoundary:TestPanel]",
      err,
      { componentStack: "stack" }
    );
    spy.mockRestore();
  });

  it("handleReset clears error state", () => {
    const boundary = new ErrorBoundary({ name: "Test" });
    boundary.state = { hasError: true, error: new Error("oops") };
    boundary.setState = vi.fn((s) => { boundary.state = s; });
    boundary.handleReset();
    expect(boundary.setState).toHaveBeenCalledWith({ hasError: false, error: null });
  });

  it("renders fallback UI with error message when hasError", () => {
    const boundary = new ErrorBoundary({ name: "Canvas" });
    boundary.state = { hasError: true, error: new Error("Something broke") };
    const result = boundary.render();
    // result is a React element tree — check its structure
    expect(result).toBeTruthy();
    expect(result.type).toBe("div");
    // The fallback should contain the error panel name and error message
    const flatText = JSON.stringify(result);
    expect(flatText).toContain("Canvas");
    expect(flatText).toContain("Something broke");
    expect(flatText).toContain("Try Again");
  });

  it("uses default name when name prop not provided", () => {
    const boundary = new ErrorBoundary({});
    boundary.state = { hasError: true, error: null };
    const result = boundary.render();
    const flatText = JSON.stringify(result);
    expect(flatText).toContain("Panel");
    expect(flatText).toContain("Something went wrong");
  });
});
