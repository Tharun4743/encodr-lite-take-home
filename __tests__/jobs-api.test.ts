import { beforeEach, describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/jobs/route";
import { issueToken } from "@/lib/server/auth";
import { __resetStore } from "@/lib/server/store";

describe("Jobs API route handlers", () => {
  const token = issueToken("u_demo");
  const authHeader = `Bearer ${token}`;

  beforeEach(() => {
    __resetStore();
  });

  it("GET /api/jobs returns 401 when unauthenticated", async () => {
    const req = new Request("http://localhost:3000/api/jobs", {
      method: "GET",
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("GET /api/jobs returns 200 with empty list when authenticated", async () => {
    const req = new Request("http://localhost:3000/api/jobs", {
      method: "GET",
      headers: { authorization: authHeader },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);
  });

  it("POST /api/jobs returns 401 when unauthenticated", async () => {
    const req = new Request("http://localhost:3000/api/jobs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sourceUrl: "https://cdn.example.com/clip.mp4" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("POST /api/jobs returns 422 with fieldErrors on invalid body", async () => {
    const req = new Request("http://localhost:3000/api/jobs", {
      method: "POST",
      headers: {
        authorization: authHeader,
        "content-type": "application/json",
      },
      body: JSON.stringify({ sourceUrl: "not-a-valid-url" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.detail).toBe("Validation failed");
    expect(body.fieldErrors?.sourceUrl).toBeDefined();
    expect(body.fieldErrors.sourceUrl.length).toBeGreaterThan(0);
  });

  it("POST /api/jobs creates job and returns 201 on valid input", async () => {
    const req = new Request("http://localhost:3000/api/jobs", {
      method: "POST",
      headers: {
        authorization: authHeader,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sourceUrl: "https://cdn.example.com/videos/nature.mp4",
        title: "Nature Video",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const created = await res.json();
    expect(created.id).toMatch(/^j_/);
    expect(created.title).toBe("Nature Video");
    expect(created.sourceUrl).toBe("https://cdn.example.com/videos/nature.mp4");
    expect(created.status).toBe("NEW");

    // Verify it appears in GET /api/jobs
    const listReq = new Request("http://localhost:3000/api/jobs", {
      headers: { authorization: authHeader },
    });
    const listRes = await GET(listReq);
    const jobs = await listRes.json();
    expect(jobs.length).toBe(1);
    expect(jobs[0].id).toBe(created.id);
  });
});
