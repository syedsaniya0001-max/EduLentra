import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import StudentDashboard from "./StudentDashboard";

const mocks = vi.hoisted(() => ({
  getTasks: vi.fn(),
  createTask: vi.fn(),
  setCompletion: vi.fn(),
  removeTask: vi.fn(),
}));

vi.mock("../api/studentTasksApi", () => ({
  studentTasksApi: {
    getMine: mocks.getTasks,
    create: mocks.createTask,
    setCompletion: mocks.setCompletion,
    remove: mocks.removeTask,
  },
}));

vi.mock("../api/announcementsApi", () => ({
  announcementsApi: {
    getAll: vi.fn().mockResolvedValue([]),
    subscribeToAnnouncementUpdates: vi.fn(() => () => {}),
  },
}));

vi.mock("../api/complaintsApi", () => ({
  complaintsApi: { getMine: vi.fn().mockResolvedValue([]) },
}));

vi.mock("../api/outpassesApi", () => ({
  outpassesApi: { getMine: vi.fn().mockResolvedValue([]) },
}));

vi.mock("../api/suggestionsApi", () => ({
  suggestionsApi: { getMine: vi.fn().mockResolvedValue([]) },
}));

vi.mock("../api/studentApi", () => ({
  studentApi: { getProfile: vi.fn().mockResolvedValue({ name: "Planner Student" }) },
}));

vi.mock("../api/attendanceApi", () => ({
  attendanceApi: {
    getMine: vi.fn().mockResolvedValue({
      summary: { present: 0, absent: 0, late: 0, total: 0, percentage: 0 },
      subjects: [],
      records: [],
    }),
  },
}));

vi.mock("../api/assignmentsApi", () => ({
  assignmentsApi: { getMine: vi.fn().mockResolvedValue([]) },
}));

vi.mock("../api/studyMaterialsApi", () => ({
  studyMaterialsApi: { getMine: vi.fn().mockResolvedValue([]) },
}));

vi.mock("../api/placementsApi", () => ({
  placementsApi: { getAll: vi.fn().mockResolvedValue([]) },
}));

vi.mock("./PortalBackButton", () => ({ default: () => null }));

const todayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

describe("student planner workflow", () => {
  beforeEach(() => {
    mocks.getTasks.mockReset().mockResolvedValue([]);
    mocks.createTask.mockReset();
    mocks.setCompletion.mockReset();
    mocks.removeTask.mockReset().mockResolvedValue({});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("creates, completes, and deletes tasks using the student task service", async () => {
    const user = userEvent.setup();
    const task = {
      id: "task-1",
      title: "Prepare database assignment",
      category: "Assignment",
      date: todayKey(),
      time: "",
      description: "",
      completed: false,
    };
    mocks.createTask.mockResolvedValue(task);
    mocks.setCompletion.mockResolvedValue({ ...task, completed: true });
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);
    expect(await screen.findByText("No tasks for this date.")).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "+ Add Task" }));
    await user.type(screen.getByLabelText("Task Title"), task.title);
    await user.click(screen.getByRole("button", { name: "Save Task" }));

    expect(mocks.createTask).toHaveBeenCalledWith({
      title: task.title,
      category: "Assignment",
      date: task.date,
      time: "",
      description: "",
    });
    expect(await screen.findByText(task.title)).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Mark task complete" }));
    expect(mocks.setCompletion).toHaveBeenCalledWith("task-1", true);
    expect(await screen.findByRole("button", { name: "Mark task incomplete" })).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Delete task" }));
    expect(mocks.removeTask).toHaveBeenCalledWith("task-1");
    expect(await screen.findByText("No tasks for this date.")).not.toBeNull();
  });
});
