import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import OutpassApproval from "./faculty/components/OutpassApproval";

const mocks = vi.hoisted(() => ({
  getOutpasses: vi.fn(),
  approveOutpass: vi.fn(),
  rejectOutpass: vi.fn(),
}));

vi.mock("../api/facultyApi", () => ({
  facultyApi: {
    getOutpasses: mocks.getOutpasses,
    approveOutpass: mocks.approveOutpass,
    rejectOutpass: mocks.rejectOutpass,
  },
}));

const outpass = {
  id: "request-42",
  studentName: "Maya Student",
  rollNumber: "ST-2026",
  branch: "CSE-AI",
  section: "A",
  reason: "Medical appointment",
  destination: "City clinic",
  outDate: "10/26/2026",
  inDate: "10/26/2026",
  status: "APPROVED",
  reviewedAt: "2026-10-25T12:00:00.000Z",
  facultyRemarks: "Return by 8 PM.",
};

describe("Faculty outpass review", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows only real student location and approval details, not fabricated contact or gate pass data", async () => {
    const user = userEvent.setup();
    mocks.getOutpasses.mockResolvedValue([outpass]);
    render(<OutpassApproval />);

    await user.click(screen.getByRole("button", { name: "All" }));
    expect(await screen.findByText("Maya Student")).not.toBeNull();
    expect(screen.getByText("Roll No: ST-2026 • CSE-AI • Section A")).not.toBeNull();
    expect(screen.getByText(/Outpass approved on/)).not.toBeNull();
    expect(screen.getByText("Return by 8 PM.")).not.toBeNull();
    expect(screen.queryByText(/Gate Pass ID/)).toBeNull();
    expect(screen.queryByRole("link", { name: /Parent|Student/ })).toBeNull();
  });

  it("shows a retry option when the outpass service is unavailable", async () => {
    const user = userEvent.setup();
    mocks.getOutpasses
      .mockRejectedValueOnce(new Error("Outpass service unavailable."))
      .mockResolvedValueOnce([]);
    render(<OutpassApproval />);

    expect(await screen.findByRole("alert")).not.toBeNull();
    expect(screen.getByRole("alert").textContent).toContain("Outpass service unavailable.");
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("No Pending Requests")).not.toBeNull();
    expect(mocks.getOutpasses).toHaveBeenCalledTimes(2);
  });
});
