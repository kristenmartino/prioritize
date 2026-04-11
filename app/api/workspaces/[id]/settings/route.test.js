import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock api-auth before importing the route
const mockSupabase = {
  from: vi.fn(),
};

vi.mock("../../../../../lib/api-auth", () => ({
  withAuth: vi.fn((handler) => handler("test-user-id", mockSupabase)),
  verifyWorkspaceOwner: vi.fn(() => Promise.resolve(true)),
}));

import { GET, PUT } from "./route";
import { verifyWorkspaceOwner } from "../../../../../lib/api-auth";

function makeRequest(body) {
  return {
    json: () => Promise.resolve(body),
  };
}

const makeParams = (id) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/workspaces/[id]/settings", () => {
  it("returns settings with camelCase keys", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              view_mode: "map",
              sort_mode: "manual",
              map_color_by: "confidence",
              map_size_by: "score",
              map_label_mode: "always",
            },
            error: null,
          }),
        }),
      }),
    });

    const response = await GET({}, makeParams("ws-123"));
    const data = await response.json();

    expect(data.viewMode).toBe("map");
    expect(data.sortMode).toBe("manual");
    expect(data.mapColorBy).toBe("confidence");
    expect(data.mapSizeBy).toBe("score");
    expect(data.mapLabelMode).toBe("always");
  });

  it("returns defaults when DB values are null", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              view_mode: null,
              sort_mode: null,
              map_color_by: null,
              map_size_by: null,
              map_label_mode: null,
            },
            error: null,
          }),
        }),
      }),
    });

    const response = await GET({}, makeParams("ws-123"));
    const data = await response.json();

    expect(data.viewMode).toBe("list");
    expect(data.sortMode).toBe("rice");
    expect(data.mapColorBy).toBe("tier");
    expect(data.mapSizeBy).toBe("uniform");
    expect(data.mapLabelMode).toBe("hover");
  });

  it("returns 404 when workspace ownership fails", async () => {
    verifyWorkspaceOwner.mockResolvedValueOnce(false);

    const response = await GET({}, makeParams("ws-bad"));
    expect(response.status).toBe(404);
  });

  it("returns 500 on DB error", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "DB connection failed" },
          }),
        }),
      }),
    });

    const response = await GET({}, makeParams("ws-123"));
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("DB connection failed");
  });
});

describe("PUT /api/workspaces/[id]/settings", () => {
  it("updates settings and returns ok", async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    mockSupabase.from.mockReturnValue({ update: mockUpdate });

    const request = makeRequest({
      viewMode: "map",
      sortMode: "manual",
      mapColorBy: "confidence",
      mapSizeBy: "score",
      mapLabelMode: "always",
    });

    const response = await PUT(request, makeParams("ws-123"));
    const data = await response.json();

    expect(data.ok).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      view_mode: "map",
      sort_mode: "manual",
      map_color_by: "confidence",
      map_size_by: "score",
      map_label_mode: "always",
    });
  });

  it("uses defaults for missing values", async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    mockSupabase.from.mockReturnValue({ update: mockUpdate });

    const request = makeRequest({});
    const response = await PUT(request, makeParams("ws-123"));
    const data = await response.json();

    expect(data.ok).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      view_mode: "list",
      sort_mode: "rice",
      map_color_by: "tier",
      map_size_by: "uniform",
      map_label_mode: "hover",
    });
  });

  it("returns 404 when workspace ownership fails", async () => {
    verifyWorkspaceOwner.mockResolvedValueOnce(false);

    const request = makeRequest({ viewMode: "map" });
    const response = await PUT(request, makeParams("ws-bad"));
    expect(response.status).toBe(404);
  });

  it("returns 500 on DB error", async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: { message: "Update failed" } });
    mockSupabase.from.mockReturnValue({ update: vi.fn().mockReturnValue({ eq: mockEq }) });

    const request = makeRequest({ viewMode: "map" });
    const response = await PUT(request, makeParams("ws-123"));
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Update failed");
  });
});
