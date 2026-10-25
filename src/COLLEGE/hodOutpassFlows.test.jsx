import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import OutpassApproval from "./Edulentra-Hod/src/pages/hod/OutpassApproval";

const mocks = vi.hoisted(() => ({
  getDepartment: vi.fn(),
  updateDepartment: vi.fn(),
}));

vi.mock("../api/outpassesApi", () => ({
  outpassesApi: {
    getDepartment: mocks.getDepartment,
    updateDepartment: mocks.updateDepartment,
  },
}));

vi.mock("./Edulentra-Hod/src/components/hod/HODLayout", () => ({
  default: ({ children }) => children,
}));

const sampleOutpass = {
  _id: "65f0c0a12345678901234567",
  student: { name: "Maya Student", rollNumber: "ST-2026" },
  reason: "Medical appointment",
  destination: "City clinic",
  fromDate: "2026-10-26T08:00:00.000Z",
  toDate: "2026-10-26T12:00:00.000Z",
  status: "PENDING",
};

describe("HOD outpass review workflow", () => {
  beforeEach(() => {
    mocks.getDepartment.mockReset();
    mocks.updateDepartment.mockReset();
    mocks.getDepartment.mockResolvedValue([sampleOutpass]);
  });

  afterEach(() => cleanup());

  it("loads live requests and submits a review decision", async () => {
    const user = userEvent.setup();
    mocks.updateDepartment.mockResolvedValue({
      ...sampleOutpass,
      status: "APPROVED",
      reviewRemarks: "Approved for the appointment.",
    });
    render(<MemoryRouter><OutpassApproval /></MemoryRouter>);

    expect(await screen.findByText("Maya Student")).not.toBeNull();
    expect(screen.getByText("ST-2026")).not.toBeNull();
    expect(screen.getAllByText("1", { selector: "strong" })).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Review" }));
    await user.type(screen.getByLabelText("Review note / rejection reason"), "Approved for the appointment.");
    await user.click(screen.getByRole("button", { name: "Approve" }));

    expect(mocks.updateDepartment).toHaveBeenCalledWith(sampleOutpass._id, {
      status: "APPROVED",
      remarks: "Approved for the appointment.",
    });
    expect((await screen.findByRole("status")).textContent).toBe("Outpass approved.");
    expect(screen.getByText("Approved for the appointment.")).not.toBeNull();
  });

  it("requires a reason before rejecting a request", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><OutpassApproval /></MemoryRouter>);

    await screen.findByText("Maya Student");
    await user.click(screen.getByRole("button", { name: "Review" }));
    await user.click(screen.getByRole("button", { name: "Reject" }));

    expect(mocks.updateDepartment).not.toHaveBeenCalled();
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Enter a reason before rejecting an outpass."
    );
  });
});
