import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import HODDashboard from "./Edulentra-Hod/src/pages/hod/HODDashboard";

const getDashboard = vi.hoisted(() => vi.fn());

vi.mock("../api/hodDashboardApi", () => ({
  hodDashboardApi: { get: getDashboard },
}));

vi.mock("./Edulentra-Hod/src/components/hod/HODLayout", () => ({
  default: ({ children }) => children,
}));

describe("HOD dashboard", () => {
  beforeEach(() => {
    getDashboard.mockReset();
    sessionStorage.clear();
    sessionStorage.setItem("edulentraUser", JSON.stringify({
      name: "HOD Test Name",
      username: "hod-101",
      role: "hod",
    }));
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  it("renders live department statistics and recent activity", async () => {
    getDashboard.mockResolvedValue({
      department: "CSE-AI",
      statistics: {
        studentCount: 128,
        facultyCount: 9,
        attendancePercentage: 87.5,
        pendingRequests: 4,
      },
      recentActivities: [{
        id: "suggestion-1",
        title: "Student suggestion submitted",
        description: "More study spaces",
        icon: "💡",
        createdAt: new Date().toISOString(),
      }],
    });

    render(<MemoryRouter><HODDashboard /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: "Welcome back, HOD Test Name 👋" })).not.toBeNull();
    expect(await screen.findByText("CSE-AI department overview")).not.toBeNull();
    expect(screen.getByText("128")).not.toBeNull();
    expect(screen.getByText("9")).not.toBeNull();
    expect(screen.getByText("87.5%")).not.toBeNull();
    expect(screen.getByText("4")).not.toBeNull();
    expect(screen.getByText("More study spaces")).not.toBeNull();
  });

  it("shows that attendance is unavailable when there are no records", async () => {
    getDashboard.mockResolvedValue({
      department: "CSE-AI",
      statistics: {
        studentCount: 0,
        facultyCount: 0,
        attendancePercentage: null,
        pendingRequests: 0,
      },
      recentActivities: [],
    });

    render(<MemoryRouter><HODDashboard /></MemoryRouter>);

    expect(await screen.findByText("No attendance records")).not.toBeNull();
    expect(screen.getByText("No recent department activity.")).not.toBeNull();
  });
});
