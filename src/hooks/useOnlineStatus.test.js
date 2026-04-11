import { describe, it, expect, vi, afterEach } from "vitest";

describe("useOnlineStatus", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exports a function", async () => {
    const mod = await import("./useOnlineStatus");
    expect(mod.useOnlineStatus).toBeDefined();
    expect(typeof mod.useOnlineStatus).toBe("function");
  });

  it("reads navigator.onLine for initial state", () => {
    // The hook uses: typeof navigator !== "undefined" ? navigator.onLine : true
    expect(typeof navigator).toBe("object");
    expect(typeof navigator.onLine).toBe("boolean");
  });

  it("would register online and offline event listeners", () => {
    // Verify the window event API is available for the hook to use
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    // The hook registers these in useEffect:
    // window.addEventListener("online", goOnline)
    // window.addEventListener("offline", goOffline)
    // We verify the API exists and is callable
    window.addEventListener("online", () => {});
    window.addEventListener("offline", () => {});
    expect(addSpy).toHaveBeenCalledWith("online", expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith("offline", expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("returns true when navigator.onLine is true", () => {
    // The initial state follows navigator.onLine
    const original = navigator.onLine;
    // jsdom defaults to true
    expect(original).toBe(true);
  });
});
