import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Admin from "./Admin";
import StudentDashboard from "./StudentDashboard";

const apiMocks = vi.hoisted(() => ({
  getAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  subscribeToAnnouncementUpdates: vi.fn(() => () => {}),
}));

const approvalMocks = vi.hoisted(() => ({
  directory: vi.fn(),
  list: vi.fn(),
  decide: vi.fn(),
}));

let announcementUpdateHandler;

vi.mock("../api/announcementsApi", () => ({
  announcementsApi: {
    getAll: apiMocks.getAll,
    create: apiMocks.create,
    update: apiMocks.update,
    remove: apiMocks.remove,
    subscribeToAnnouncementUpdates: apiMocks.subscribeToAnnouncementUpdates,
  },
  announcementAudienceLabel: (announcement) =>
    announcement.targetRole === "STUDENT" ? "Students" : "Everyone",
  toLocalDateTime: (value) => value || "",
}));

vi.mock("../api/roleApprovalApi", () => ({
  roleApprovalApi: approvalMocks,
}));

vi.mock("./PortalBackButton", () => ({ default: () => null }));

const studentAnnouncement = {
  id: "student-notice",
  title: "Student exam schedule",
  message: "The exam timetable is available.",
  category: "Academic",
  priority: "High",
  targetRole: "STUDENT",
  date: "2026-10-19",
  createdByName: "Campus Admin",
};

const renderInRouter = (component) =>
  render(<MemoryRouter>{component}</MemoryRouter>);

describe("role-aware announcement flows", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    apiMocks.getAll.mockReset();
    apiMocks.create.mockReset();
    apiMocks.update.mockReset();
    apiMocks.remove.mockReset();
    apiMocks.subscribeToAnnouncementUpdates.mockReset();
    announcementUpdateHandler = undefined;
    apiMocks.subscribeToAnnouncementUpdates.mockImplementation((onChange) => {
      announcementUpdateHandler = onChange;
      return () => {};
    });
    approvalMocks.directory.mockReset();
    approvalMocks.directory.mockImplementation(async (role) => ({
      [role]: [],
    }));
    approvalMocks.list.mockReset();
    approvalMocks.list.mockResolvedValue({ requests: [] });
    apiMocks.getAll.mockResolvedValue([]);
    sessionStorage.clear();
    localStorage.clear();
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        token: "admin-session-token",
        role: "admin",
        user: { _id: "admin-id", username: "campus-admin" },
      }),
    }));
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
    localStorage.clear();
    globalThis.fetch = originalFetch;
  });

  it("renders the server-filtered announcements for a student", async () => {
    const user = userEvent.setup();
    apiMocks.getAll.mockResolvedValue([studentAnnouncement]);
    renderInRouter(<StudentDashboard />);

    await user.click(screen.getByRole("button", { name: /announcements/i }));

    expect(await screen.findByText(/Student exam schedule/)).not.toBeNull();
    expect(screen.getByText(studentAnnouncement.message)).not.toBeNull();
    expect(screen.queryByText("No announcements have been published for you yet.")).toBeNull();

    apiMocks.getAll.mockResolvedValue([
      studentAnnouncement,
      {
        ...studentAnnouncement,
        id: "new-student-notice",
        title: "Campus closure",
      },
    ]);
    await act(async () => {
      await announcementUpdateHandler();
    });
    expect(await screen.findByText(/Campus closure/)).not.toBeNull();
  });

  it("lets an administrator publish a student-targeted announcement", async () => {
    const user = userEvent.setup();
    apiMocks.create.mockImplementation(async (values) => ({
      ...values,
      id: "created-notice",
    }));
    renderInRouter(<Admin />);

    await user.type(screen.getByPlaceholderText("Admin ID"), "campus-admin");
    await user.type(screen.getByPlaceholderText("Password"), "valid-password");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await user.click(await screen.findByRole("button", { name: /announcements/i }));
    await user.type(screen.getByLabelText("Announcement title"), "Student orientation");
    await user.selectOptions(screen.getByLabelText("Announcement audience"), "STUDENT");
    await user.type(
      screen.getByLabelText("Announcement message"),
      "Orientation starts at 9 AM."
    );
    await user.click(screen.getByRole("button", { name: "Save announcement" }));

    expect(apiMocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Student orientation",
        targetRole: "STUDENT",
        message: "Orientation starts at 9 AM.",
      })
    );
    expect(await screen.findByText("Student orientation")).not.toBeNull();
    expect(screen.getByRole("status").textContent).toMatch(/published/i);
  });
});
