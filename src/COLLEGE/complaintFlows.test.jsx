import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import StudentDashboard from "./StudentDashboard";
import ComplaintManagement from "./Edulentra-Hod/src/pages/hod/ComplaintManagement";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  getMine: vi.fn(),
  getDepartment: vi.fn(),
  update: vi.fn(),
}));

vi.mock("../api/complaintsApi", () => ({
  complaintsApi: {
    create: mocks.create,
    getMine: mocks.getMine,
    getDepartment: mocks.getDepartment,
    update: mocks.update,
  },
}));

vi.mock("../api/announcementsApi", () => ({
  announcementsApi: {
    getAll: vi.fn().mockResolvedValue([]),
    subscribeToAnnouncementUpdates: vi.fn(() => () => {}),
  },
}));

vi.mock("./PortalBackButton", () => ({ default: () => null }));
vi.mock("./Edulentra-Hod/src/components/hod/HODLayout", () => ({
  default: ({ children }) => children,
}));

const sampleComplaint = {
  _id: "complaint-1",
  subject: "Broken projector",
  description: "The classroom projector does not turn on.",
  status: "PENDING",
  response: "",
  createdAt: "2026-10-25T08:00:00.000Z",
  student: { name: "A Student", rollNumber: "STU-101" },
};

describe("student complaint workflow", () => {
  beforeEach(() => {
    mocks.create.mockReset();
    mocks.getMine.mockReset();
    mocks.getDepartment.mockReset();
    mocks.update.mockReset();
    mocks.getMine.mockResolvedValue([]);
    mocks.getDepartment.mockResolvedValue([sampleComplaint]);
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("submits complaint details and shows a success confirmation", async () => {
    const user = userEvent.setup();
    mocks.create.mockResolvedValue(sampleComplaint);
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);

    await user.click(screen.getByRole("button", { name: /complaints box/i }));
    await user.type(screen.getByLabelText("Subject"), "Broken projector");
    await user.type(
      screen.getByLabelText("Complaint details"),
      "The classroom projector does not turn on."
    );
    await user.click(screen.getByRole("button", { name: "Submit Complaint" }));

    expect(mocks.create).toHaveBeenCalledWith({
      subject: "Broken projector",
      description: "The classroom projector does not turn on.",
    });
    expect((await screen.findByRole("status")).textContent).toContain(
      "Your complaint has been submitted."
    );
    expect(screen.getByText("Broken projector")).not.toBeNull();
  });
});

describe("HOD complaint review workflow", () => {
  beforeEach(() => {
    mocks.getDepartment.mockReset();
    mocks.update.mockReset();
    mocks.getDepartment.mockResolvedValue([sampleComplaint]);
  });

  afterEach(() => {
    cleanup();
  });

  it("loads department complaints and saves a response for the student", async () => {
    const user = userEvent.setup();
    mocks.update.mockResolvedValue({
      ...sampleComplaint,
      status: "UNDER_REVIEW",
      response: "Facilities team has been notified.",
    });
    render(<MemoryRouter><ComplaintManagement /></MemoryRouter>);

    expect(await screen.findByText("A Student")).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Review" }));
    await user.type(
      screen.getByLabelText("Response to student"),
      "Facilities team has been notified."
    );
    await user.click(screen.getByRole("button", { name: "Save review" }));

    expect(mocks.update).toHaveBeenCalledWith("complaint-1", {
      status: "UNDER_REVIEW",
      response: "Facilities team has been notified.",
    });
    expect((await screen.findByRole("status")).textContent).toContain(
      "Complaint review saved."
    );
  });

  it("filters the department list by status", async () => {
    render(<MemoryRouter><ComplaintManagement /></MemoryRouter>);
    await screen.findByText("A Student");
    fireEvent.change(screen.getByLabelText("Filter complaints by status"), {
      target: { value: "RESOLVED" },
    });
    expect(screen.getByText("No complaints found.")).not.toBeNull();
  });
});
