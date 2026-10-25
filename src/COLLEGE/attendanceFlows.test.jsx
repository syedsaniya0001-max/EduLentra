import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AttendanceManagement from "./faculty/components/AttendanceManagement";
import AttendanceMonitoring from "./Edulentra-Hod/src/pages/hod/AttendanceMonitoring";

const mocks = vi.hoisted(() => ({
  getAttendanceRoster: vi.fn(),
  markAttendance: vi.fn(),
  getDepartment: vi.fn(),
}));

vi.mock("../api/facultyApi", () => ({
  facultyApi: {
    getAttendanceRoster: mocks.getAttendanceRoster,
    markAttendance: mocks.markAttendance,
  },
}));

vi.mock("../api/attendanceApi", () => ({
  attendanceApi: {
    getMine: vi.fn(),
    getDepartment: mocks.getDepartment,
  },
}));

vi.mock("./Edulentra-Hod/src/components/hod/HODLayout", () => ({
  default: ({ children }) => children,
}));

describe("attendance workflows", () => {
  beforeEach(() => {
    mocks.getAttendanceRoster.mockReset().mockResolvedValue({
      branch: "CSE-AI",
      subject: "Machine Learning",
      sections: ["A"],
      students: [{
        id: "65f0c0a12345678901234568",
        name: "Maya Student",
        rollNumber: "ST-2026",
        section: "A",
        attendanceStatus: null,
      }],
    });
    mocks.markAttendance.mockReset().mockResolvedValue({
      message: "Attendance saved successfully.",
    });
    mocks.getDepartment.mockReset().mockResolvedValue({
      department: "CSE-AI",
      summary: {
        studentCount: 1,
        totalRecords: 5,
        percentage: 80,
        goodCount: 1,
        lowCount: 0,
        criticalCount: 0,
      },
      students: [{
        _id: "65f0c0a12345678901234568",
        name: "Maya Student",
        rollNumber: "ST-2026",
        section: "A",
        present: 3,
        absent: 1,
        late: 1,
        total: 5,
        percentage: 80,
        status: "Average",
      }],
    });
  });

  afterEach(() => cleanup());

  it("lets faculty mark and save attendance for the fetched roster", async () => {
    const user = userEvent.setup();
    render(<AttendanceManagement />);

    expect(await screen.findByText("Maya Student")).not.toBeNull();
    expect(screen.getByLabelText("Branch").value).toBe("CSE-AI");
    await user.click(screen.getByRole("button", { name: "Present" }));
    await user.click(screen.getByRole("button", { name: "Save attendance" }));

    expect(mocks.markAttendance).toHaveBeenCalledWith(expect.objectContaining({
      section: "All",
      records: [{
        studentId: "65f0c0a12345678901234568",
        status: "PRESENT",
      }],
    }));
    expect(await screen.findByRole("status")).not.toBeNull();
  });

  it("shows HOD department attendance and filters by real sections", async () => {
    render(<AttendanceMonitoring />);

    expect(await screen.findByText("Maya Student")).not.toBeNull();
    expect(screen.getAllByText("80%")).toHaveLength(2);
    fireEvent.change(screen.getByLabelText("Section"), { target: { value: "A" } });
    expect(screen.getByText("ST-2026")).not.toBeNull();
  });
});
