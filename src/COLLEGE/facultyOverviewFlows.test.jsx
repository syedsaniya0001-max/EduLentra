import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FacultyOverview from "./faculty/components/FacultyOverview";

const mocks = vi.hoisted(() => ({
  getDashboard: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("../api/facultyApi", () => ({
  facultyApi: { getDashboard: mocks.getDashboard },
}));

const dashboard = {
  stats: {
    totalStudents: 25,
    pendingOutpasses: 3,
    activeAssignments: 4,
    totalNotes: 6,
    avgAttendance: 80,
    attendanceRecords: 25,
  },
  timetable: [],
  timetableConfigured: false,
  recentActivities: [],
};

describe("Faculty dashboard overview", () => {
  beforeEach(() => {
    mocks.getDashboard.mockReset().mockResolvedValue(dashboard);
    mocks.navigate.mockReset();
  });

  afterEach(() => cleanup());

  it("shows database totals and reports the unconfigured timetable instead of inventing data", async () => {
    render(
      <FacultyOverview
        faculty={{ name: "Taylor Faculty", department: "CSE-AI" }}
        onNavigate={mocks.navigate}
      />
    );

    expect(await screen.findByText("25")).not.toBeNull();
    expect(screen.getByText("80%")).not.toBeNull();
    expect(screen.getByText("Add your recurring weekly classes to configure your timetable.")).not.toBeNull();
    expect(screen.queryByText(/Lectures Today/)).toBeNull();
    expect(screen.getByText("No recent activity is available.")).not.toBeNull();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Students Enrolled/ }));
    expect(mocks.navigate).toHaveBeenCalledWith("students");
    await user.click(screen.getByRole("button", { name: "Manage timetable" }));
    expect(mocks.navigate).toHaveBeenCalledWith("timetable");
  });

  it("shows today's classes from the saved weekly timetable", async () => {
    const day = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
    mocks.getDashboard.mockResolvedValue({
      ...dashboard,
      timetableConfigured: true,
      timetable: [{
        _id: "class-today",
        day,
        startTime: "09:00",
        endTime: "10:00",
        subject: "Machine Learning",
        branch: "CSE-AI",
        section: "A",
        room: "Lab 1",
      }],
    });

    render(
      <FacultyOverview
        faculty={{ name: "Taylor Faculty", department: "CSE-AI" }}
        onNavigate={mocks.navigate}
      />
    );

    expect(await screen.findByText("Machine Learning")).not.toBeNull();
    expect(screen.getByText(/09:00/).textContent).toContain("10:00");
    expect(screen.getByText("Lab 1")).not.toBeNull();
  });

  it("shows an explicit service error instead of demo statistics", async () => {
    mocks.getDashboard.mockRejectedValue(new Error("Dashboard service unavailable."));
    render(
      <FacultyOverview
        faculty={{ name: "Taylor Faculty" }}
        onNavigate={mocks.navigate}
      />
    );

    expect(await screen.findByRole("alert")).not.toBeNull();
    expect(screen.getByText("Dashboard service unavailable.")).not.toBeNull();
    expect(screen.queryByText("142")).toBeNull();
    expect(screen.getAllByText("Unavailable").length).toBeGreaterThan(0);
  });
});
