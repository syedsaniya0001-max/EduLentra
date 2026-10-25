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

const placementMocks = vi.hoisted(() => ({
  getAll: vi.fn(),
  create: vi.fn(),
  remove: vi.fn(),
}));

const eventMocks = vi.hoisted(() => ({
  getAll: vi.fn(),
  create: vi.fn(),
  remove: vi.fn(),
}));

const galleryMocks = vi.hoisted(() => ({
  getAll: vi.fn(),
  create: vi.fn(),
  remove: vi.fn(),
}));

const notificationMocks = vi.hoisted(() => ({
  getMine: vi.fn(),
  markAllRead: vi.fn(),
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

vi.mock("../api/placementsApi", () => ({
  placementsApi: placementMocks,
}));

vi.mock("../api/eventsApi", () => ({
  eventsApi: eventMocks,
}));

vi.mock("../api/galleryApi", () => ({
  galleryApi: galleryMocks,
}));

vi.mock("../api/notificationsApi", () => ({
  notificationsApi: notificationMocks,
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
    placementMocks.getAll.mockReset().mockResolvedValue([]);
    placementMocks.create.mockReset();
    placementMocks.remove.mockReset();
    eventMocks.getAll.mockReset().mockResolvedValue([]);
    eventMocks.create.mockReset();
    eventMocks.remove.mockReset();
    galleryMocks.getAll.mockReset().mockResolvedValue([]);
    galleryMocks.create.mockReset();
    galleryMocks.remove.mockReset();
    notificationMocks.getMine.mockReset().mockResolvedValue([]);
    notificationMocks.markAllRead.mockReset().mockResolvedValue({});
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

    expect(await screen.findByRole("heading", { name: /campus-admin/i })).not.toBeNull();
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

  it("lets administrators find and filter students from branches outside the preset list", async () => {
    const user = userEvent.setup();
    approvalMocks.directory.mockImplementation(async (role) => {
      if (role === "students") {
        return {
          students: [{
            _id: "bio-student",
            name: "Kai Student",
            rollNumber: "BIO-001",
            branch: "BIO-TECH",
            section: "A",
          }],
        };
      }
      return role === "faculty" ? { faculty: [] } : { hods: [] };
    });

    renderInRouter(<Admin />);
    await user.type(screen.getByPlaceholderText("Admin ID"), "campus-admin");
    await user.type(screen.getByPlaceholderText("Password"), "correct-password");
    await user.click(screen.getByRole("button", { name: "Login" }));

    const branchCard = await screen.findByRole("button", { name: /BIO-TECH/ });
    await user.click(branchCard);

    expect(await screen.findByText("Kai Student")).not.toBeNull();
    expect(screen.getByText("BIO-TECH · A")).not.toBeNull();
  });

  it("lets an administrator publish a placement to the database service", async () => {
    const user = userEvent.setup();
    placementMocks.create.mockImplementation(async (draft) => ({
      ...draft,
      id: "placement-1",
    }));
    renderInRouter(<Admin />);

    await user.type(screen.getByPlaceholderText("Admin ID"), "campus-admin");
    await user.type(screen.getByPlaceholderText("Password"), "valid-password");
    await user.click(screen.getByRole("button", { name: "Login" }));
    await user.click(await screen.findByRole("button", { name: /Placements/ }));
    await user.type(screen.getByLabelText("Company name"), "Example Corp");
    await user.type(screen.getByLabelText("Job role"), "Graduate Engineer");
    await user.type(screen.getByLabelText("Placement location"), "Hyderabad");
    await user.type(screen.getByLabelText("Placement details"), "Apply through the careers portal.");
    await user.click(screen.getByRole("button", { name: "Publish placement" }));

    expect(placementMocks.create).toHaveBeenCalledWith(expect.objectContaining({
      company: "Example Corp",
      role: "Graduate Engineer",
      branch: "ECE",
      location: "Hyderabad",
      description: "Apply through the careers portal.",
    }));
    expect(await screen.findByText("Example Corp")).not.toBeNull();
  });

  it("lets an administrator publish an event and shows it to students", async () => {
    const user = userEvent.setup();
    const event = {
      id: "campus-event-1",
      title: "Science Fair",
      category: "Academic",
      date: "2026-11-15",
      location: "Main Hall",
      description: "Student research showcase",
    };
    eventMocks.create.mockResolvedValue(event);
    renderInRouter(<Admin />);

    await user.type(screen.getByPlaceholderText("Admin ID"), "campus-admin");
    await user.type(screen.getByPlaceholderText("Password"), "valid-password");
    await user.click(screen.getByRole("button", { name: "Login" }));
    await user.click(await screen.findByRole("button", { name: /Events/ }));
    await user.type(screen.getByLabelText("Event title"), event.title);
    await user.selectOptions(screen.getByLabelText("Event category"), event.category);
    await user.clear(screen.getByLabelText("Event date"));
    await user.type(screen.getByLabelText("Event date"), event.date);
    await user.type(screen.getByLabelText("Event location"), event.location);
    await user.type(screen.getByLabelText("Event description"), event.description);
    await user.click(screen.getByRole("button", { name: "Add event" }));

    expect(eventMocks.create).toHaveBeenCalledWith({
      title: event.title,
      category: event.category,
      date: event.date,
      location: event.location,
      description: event.description,
    });
    expect(await screen.findByText(event.title)).not.toBeNull();

    eventMocks.getAll.mockResolvedValue([event]);
    cleanup();
    renderInRouter(<StudentDashboard />);
    await user.click(screen.getByRole("button", { name: /Campus Events/ }));
    expect(await screen.findByText(event.title)).not.toBeNull();
    expect(screen.getByText(/Main Hall/)).not.toBeNull();
  });

  it("lets an administrator publish a gallery post and shows it to students", async () => {
    const user = userEvent.setup();
    const post = {
      id: "gallery-post-1",
      title: "Robotics team wins",
      category: "Achievement",
      date: "2026-10-20",
      description: "The college team won first place.",
      imageUrl: "",
    };
    galleryMocks.create.mockResolvedValue(post);
    renderInRouter(<Admin />);

    await user.type(screen.getByPlaceholderText("Admin ID"), "campus-admin");
    await user.type(screen.getByPlaceholderText("Password"), "valid-password");
    await user.click(screen.getByRole("button", { name: "Login" }));
    await user.click(await screen.findByRole("button", { name: /Achievements \/ Gallery/ }));
    await user.type(screen.getByLabelText("Post title"), post.title);
    await user.selectOptions(screen.getByLabelText("Post category"), post.category);
    await user.clear(screen.getByLabelText("Post date"));
    await user.type(screen.getByLabelText("Post date"), post.date);
    await user.type(screen.getByLabelText("Post description"), post.description);
    await user.click(screen.getByRole("button", { name: "Publish post" }));

    expect(galleryMocks.create).toHaveBeenCalledWith({
      title: post.title,
      category: post.category,
      date: post.date,
      description: post.description,
      imageUrl: "",
    });
    expect(await screen.findByText(post.title)).not.toBeNull();

    galleryMocks.getAll.mockResolvedValue([post]);
    cleanup();
    renderInRouter(<StudentDashboard />);
    await user.click(screen.getByRole("button", { name: /Achievements & Gallery/ }));
    expect(await screen.findByText(post.title)).not.toBeNull();
    expect(screen.getByText(post.description)).not.toBeNull();
  });

  it("loads real HOD approval notifications and persists mark-as-read", async () => {
    const user = userEvent.setup();
    notificationMocks.getMine.mockResolvedValue([{
      id: "notification-1",
      requestId: "hod-request-1",
      title: "HOD approval request",
      text: "Alex HOD (HOD-101) requested approval for CSE-AI.",
      read: false,
      createdAt: "2026-10-25T10:00:00.000Z",
    }]);
    renderInRouter(<Admin />);

    await user.type(screen.getByPlaceholderText("Admin ID"), "campus-admin");
    await user.type(screen.getByPlaceholderText("Password"), "valid-password");
    await user.click(screen.getByRole("button", { name: "Login" }));
    const notificationsNav = screen.getAllByRole("button", { name: /Notifications/ })
      .find((button) => button.classList.contains("nav-item"));
    await user.click(notificationsNav);

    expect(await screen.findByText(/Alex HOD \(HOD-101\)/)).not.toBeNull();
    expect(screen.getByText("New")).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Mark all read" }));

    expect(notificationMocks.markAllRead).toHaveBeenCalledOnce();
    expect(await screen.findByText("Read")).not.toBeNull();
  });

  it("shows live branch-eligible placement opportunities to students", async () => {
    const user = userEvent.setup();
    placementMocks.getAll.mockResolvedValue([{
      id: "placement-1",
      company: "Example Corp",
      role: "Graduate Engineer",
      branch: "CSE-AI",
      location: "Hyderabad",
      deadline: "2026-12-01",
      eligibility: "7 CGPA",
      package: "8 LPA",
      description: "Apply through the careers portal.",
      applyLink: "https://example.com/careers",
    }]);
    renderInRouter(<StudentDashboard />);

    await user.click(screen.getByRole("button", { name: /Placements/ }));
    expect(await screen.findByText("Example Corp")).not.toBeNull();
    expect(screen.getByRole("link", { name: "Apply / View Details" }).getAttribute("href"))
      .toBe("https://example.com/careers");
  });

  it("lets an administrator set their display name", async () => {
    const user = userEvent.setup();
    renderInRouter(<Admin />);

    await user.type(screen.getByPlaceholderText("Admin ID"), "campus-admin");
    await user.type(screen.getByPlaceholderText("Password"), "valid-password");
    await user.click(screen.getByRole("button", { name: "Login" }));
    await user.click(await screen.findByRole("button", { name: "Admin Profile" }));

    const displayName = screen.getByLabelText("Display name");
    await user.clear(displayName);
    await user.type(displayName, "Taylor Admin");
    await user.click(screen.getByRole("button", { name: "Save name" }));

    expect(await screen.findByRole("heading", { name: "Taylor Admin" })).not.toBeNull();
    expect((await screen.findByRole("status")).textContent).toBe("Display name updated.");
  });

  it("lets an administrator load, unpublish, edit, and delete an announcement", async () => {
    const user = userEvent.setup();
    const initialAnnouncement = {
      ...studentAnnouncement,
      id: "managed-notice",
      isActive: true,
      publishAt: null,
      expiresAt: null,
    };
    apiMocks.getAll.mockResolvedValue([initialAnnouncement]);
    apiMocks.update.mockImplementation(async (_id, values) => ({
      ...initialAnnouncement,
      ...values,
    }));
    apiMocks.remove.mockResolvedValue({ message: "Announcement deleted." });
    renderInRouter(<Admin />);

    await user.type(screen.getByPlaceholderText("Admin ID"), "campus-admin");
    await user.type(screen.getByPlaceholderText("Password"), "valid-password");
    await user.click(screen.getByRole("button", { name: "Login" }));
    await user.click(await screen.findByRole("button", { name: /announcements/i }));
    expect(await screen.findByText(/Student exam schedule/)).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Unpublish" }));
    expect(apiMocks.update).toHaveBeenLastCalledWith(
      "managed-notice",
      expect.objectContaining({ isActive: false })
    );
    expect((await screen.findAllByText("Draft / unpublished")).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Edit announcement" }));
    const titleInput = screen.getByLabelText("Announcement title");
    await user.clear(titleInput);
    await user.type(titleInput, "Updated student notice");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(apiMocks.update).toHaveBeenLastCalledWith(
      "managed-notice",
      expect.objectContaining({
        title: "Updated student notice",
        targetRole: "STUDENT",
      })
    );
    expect(await screen.findByText("Updated student notice")).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Delete announcement" }));
    expect(apiMocks.remove).toHaveBeenCalledWith("managed-notice");
    expect(await screen.findByText("No announcements match your search or filters."))
      .not.toBeNull();
  });
});
