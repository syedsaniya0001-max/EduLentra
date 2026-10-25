import { afterEach, describe, expect, it, vi } from "vitest";
import { assignmentsApi } from "./assignmentsApi";

describe("assignment submission API", () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it("sends the response and optional attachment link to the backend", async () => {
    sessionStorage.setItem("edulentraToken", "student-token");
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: "Assignment submitted successfully.",
        submission: {
          answer: "Completed response",
          fileUrl: "https://files.example.edu/assignment.pdf",
        },
      }),
    });
    vi.stubGlobal("fetch", fetch);

    const result = await assignmentsApi.submit(
      "assignment-1",
      "Completed response",
      "https://files.example.edu/assignment.pdf"
    );

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/students/assignments/assignment-1/submissions"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          answer: "Completed response",
          fileUrl: "https://files.example.edu/assignment.pdf",
        }),
      })
    );
    expect(result.submission.fileUrl).toBe("https://files.example.edu/assignment.pdf");
  });
});
