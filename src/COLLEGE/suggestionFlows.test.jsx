import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import StudentDashboard from "./StudentDashboard";
import SuggestionManagement from "./Edulentra-Hod/src/pages/hod/SuggestionManagement";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  getMine: vi.fn(),
  getDepartment: vi.fn(),
  update: vi.fn(),
}));

vi.mock("../api/suggestionsApi", () => ({
  suggestionsApi: {
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

const sampleSuggestion = {
  _id: "suggestion-1",
  message: "Add more study spaces.",
  status: "SUBMITTED",
  response: "",
  createdAt: "2026-10-25T08:00:00.000Z",
  student: { name: "A Student", rollNumber: "STU-101" },
};

describe("student suggestion workflow", () => {
  beforeEach(() => {
    mocks.create.mockReset();
    mocks.getMine.mockReset();
    mocks.getDepartment.mockReset();
    mocks.update.mockReset();
    mocks.getMine.mockResolvedValue([]);
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => cleanup());

  it("submits and displays a database-confirmed suggestion", async () => {
    const user = userEvent.setup();
    mocks.create.mockResolvedValue(sampleSuggestion);
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);

    await user.click(screen.getByRole("button", { name: /Suggestions/ }));
    await user.type(
      screen.getByPlaceholderText("Enter your suggestion..."),
      "Add more study spaces."
    );
    await user.click(screen.getByRole("button", { name: "Submit Suggestion" }));

    expect(mocks.create).toHaveBeenCalledWith("Add more study spaces.");
    expect((await screen.findByRole("status")).textContent).toContain(
      "Your suggestion has been submitted."
    );
    expect(screen.getByText("Add more study spaces.")).not.toBeNull();
  });
});

describe("HOD suggestion review workflow", () => {
  beforeEach(() => {
    mocks.getDepartment.mockReset();
    mocks.update.mockReset();
    mocks.getDepartment.mockResolvedValue([sampleSuggestion]);
  });

  afterEach(() => cleanup());

  it("loads department suggestions and saves an HOD response", async () => {
    const user = userEvent.setup();
    mocks.update.mockResolvedValue({
      ...sampleSuggestion,
      status: "ACCEPTED",
      response: "We will add more study spaces.",
    });
    render(<MemoryRouter><SuggestionManagement /></MemoryRouter>);

    expect(await screen.findByText("A Student · STU-101")).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Review" }));
    await user.selectOptions(screen.getByLabelText("Review status"), "ACCEPTED");
    await user.type(
      screen.getByLabelText("Response to student"),
      "We will add more study spaces."
    );
    await user.click(screen.getByRole("button", { name: "Save review" }));

    expect(mocks.update).toHaveBeenCalledWith("suggestion-1", {
      status: "ACCEPTED",
      response: "We will add more study spaces.",
    });
    expect((await screen.findByRole("status")).textContent).toContain(
      "Suggestion review saved."
    );
  });
});
