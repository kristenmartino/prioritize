import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSupabase = {
  from: vi.fn(),
};

vi.mock("../../../../../lib/api-auth", () => ({
  withAuth: vi.fn((handler) => handler("test-user-id", mockSupabase)),
  verifyWorkspaceOwner: vi.fn(() => Promise.resolve(true)),
}));

import { GET, POST } from "./route";
import { verifyWorkspaceOwner } from "../../../../../lib/api-auth";

const makeParams = (id) => ({ params: Promise.resolve({ id }) });
function makeRequest(body, url) {
  return {
    json: () => Promise.resolve(body),
    url: url || "http://localhost/api/workspaces/ws-1/signals",
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/workspaces/[id]/signals", () => {
  it("returns signals list", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              { id: "s-1", title: "User feedback", type: "research", body: "Users want X" },
              { id: "s-2", title: "Market data", type: "metric", body: "30% growth" },
            ],
            error: null,
          }),
        }),
      }),
    });

    const response = await GET(
      makeRequest(null, "http://localhost/api/workspaces/ws-1/signals"),
      makeParams("ws-1")
    );
    const data = await response.json();

    expect(data.signals).toHaveLength(2);
    expect(data.signals[0].title).toBe("User feedback");
  });

  it("returns empty array when no signals", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });

    const response = await GET(
      makeRequest(null, "http://localhost/api/workspaces/ws-1/signals"),
      makeParams("ws-1")
    );
    const data = await response.json();
    expect(data.signals).toEqual([]);
  });

  it("filters by type query param", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ id: "s-1", title: "Metric", type: "metric" }],
              error: null,
            }),
          }),
        }),
      }),
    });

    const response = await GET(
      makeRequest(null, "http://localhost/api/workspaces/ws-1/signals?type=metric"),
      makeParams("ws-1")
    );
    const data = await response.json();
    expect(data.signals).toHaveLength(1);
  });

  it("returns 404 when ownership fails", async () => {
    verifyWorkspaceOwner.mockResolvedValueOnce(false);
    const response = await GET(
      makeRequest(null, "http://localhost/api/workspaces/ws-bad/signals"),
      makeParams("ws-bad")
    );
    expect(response.status).toBe(404);
  });

  it("returns 500 on DB error", async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Signals query failed" },
          }),
        }),
      }),
    });

    const response = await GET(
      makeRequest(null, "http://localhost/api/workspaces/ws-1/signals"),
      makeParams("ws-1")
    );
    expect(response.status).toBe(500);
  });
});

describe("POST /api/workspaces/[id]/signals", () => {
  it("creates a signal and returns 201", async () => {
    const createdSignal = {
      id: "s-new", title: "New signal", type: "note",
      body: "Important", workspace_id: "ws-1",
    };

    let callCount = 0;
    mockSupabase.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [{ position: 5 }] }),
              }),
            }),
          }),
        };
      }
      return {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: createdSignal, error: null }),
          }),
        }),
      };
    });

    const request = makeRequest({ title: "New signal", body: "Important" });
    const response = await POST(request, makeParams("ws-1"));
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.id).toBe("s-new");
    expect(data.title).toBe("New signal");
  });

  it("defaults type to note when not specified", async () => {
    let insertArgs;
    let callCount = 0;
    mockSupabase.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [] }),
              }),
            }),
          }),
        };
      }
      return {
        insert: vi.fn().mockImplementation((args) => {
          insertArgs = args;
          return {
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: "s-new", ...args }, error: null }),
            }),
          };
        }),
      };
    });

    const request = makeRequest({ title: "No type" });
    await POST(request, makeParams("ws-1"));
    expect(insertArgs.type).toBe("note");
  });

  it("returns 404 when ownership fails", async () => {
    verifyWorkspaceOwner.mockResolvedValueOnce(false);
    const response = await POST(makeRequest({ title: "Test" }), makeParams("ws-bad"));
    expect(response.status).toBe(404);
  });

  it("returns 500 on insert error", async () => {
    let callCount = 0;
    mockSupabase.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [] }),
              }),
            }),
          }),
        };
      }
      return {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: "Insert failed" } }),
          }),
        }),
      };
    });

    const response = await POST(makeRequest({ title: "Fail" }), makeParams("ws-1"));
    expect(response.status).toBe(500);
  });
});
