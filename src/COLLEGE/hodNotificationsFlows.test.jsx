import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import HODNotifications from "./Edulentra-Hod/src/pages/hod/HODNotifications";

const mocks = vi.hoisted(() => ({
  getMine: vi.fn(),
  markRead: vi.fn(),
  markAllRead: vi.fn(),
}));

vi.mock("../api/hodNotificationsApi", () => ({
  hodNotificationsApi: {
    getMine: mocks.getMine,
    markRead: mocks.markRead,
    markAllRead: mocks.markAllRead,
  },
}));

vi.mock("./Edulentra-Hod/src/components/hod/HODLayout", () => ({
  default: ({ children }) => children,
}));

function CurrentPath() {
  const location = useLocation();
  return <output data-testid="current-path">{location.pathname}</output>;
}

const notifications = [
  {
    id: "notification-1",
    title: "Faculty approval request",
    text: "Taylor Faculty (FAC-1) is awaiting approval.",
    read: false,
    createdAt: "2026-10-25T10:00:00.000Z",
    target: "/hod/faculty-approval",
  },
  {
    id: "notification-2",
    title: "Student complaint",
    text: "Maya Student submitted: Lab access.",
    read: true,
    createdAt: "2026-10-24T10:00:00.000Z",
    target: "/hod/complaints",
  },
];

describe("HOD notifications", () => {
  beforeEach(() => {
    mocks.getMine.mockReset().mockResolvedValue(notifications);
    mocks.markRead.mockReset().mockResolvedValue({});
    mocks.markAllRead.mockReset().mockResolvedValue({});
  });

  afterEach(() => cleanup());

  it("loads department notifications, marks one read, and opens its review screen", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/hod/notifications"]}>
        <HODNotifications />
        <CurrentPath />
      </MemoryRouter>
    );

    const facultyNotification = await screen.findByRole("button", {
      name: /Faculty approval request/,
    });
    expect(screen.getByText(/Maya Student submitted/)).not.toBeNull();

    await user.click(facultyNotification);

    expect(mocks.markRead).toHaveBeenCalledWith("notification-1");
    await waitFor(() => {
      expect(screen.getByTestId("current-path").textContent).toBe(
        "/hod/faculty-approval"
      );
    });
  });

  it("marks every notification read and updates the unread display", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <HODNotifications />
      </MemoryRouter>
    );

    await screen.findByText("Student complaint");
    await user.click(screen.getByRole("button", { name: "Mark all as read" }));

    expect(mocks.markAllRead).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Mark all as read" })).toBeNull();
  });

  it("shows retryable API errors and an empty state", async () => {
    mocks.getMine.mockRejectedValue(new Error("Notification service unavailable."));
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <HODNotifications />
      </MemoryRouter>
    );

    expect(await screen.findByRole("alert")).not.toBeNull();
    expect(screen.getByText("Notification service unavailable.")).not.toBeNull();
    mocks.getMine.mockResolvedValue([]);
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText(/You're all caught up/)).not.toBeNull();
  });
});
