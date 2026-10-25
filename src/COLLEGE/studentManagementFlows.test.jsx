import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import StudentManagement from "./Edulentra-Hod/src/pages/hod/StudentManagement";

const mocks = vi.hoisted(() => ({
  getDepartment: vi.fn(),
}));

vi.mock("../api/attendanceApi", () => ({
  attendanceApi: { getDepartment: mocks.getDepartment },
}));

vi.mock("./Edulentra-Hod/src/components/hod/HODLayout", () => ({
  default: ({ children }) => children,
}));

const students = [
  {
    _id: "student-1",
    name: "Maya Student",
    rollNumber: "ST-101",
    email: "maya@example.edu",
    branch: "CSE-AI",
    section: "A",
    entryType: "Regular",
    createdAt: new Date().toISOString(),
    present: 8,
    absent: 2,
    late: 0,
    total: 10,
    percentage: 80,
    status: "Average",
  },
  {
    _id: "student-2",
    name: "Noah Student",
    rollNumber: "ST-102",
    email: "noah@example.edu",
    branch: "CSE-AI",
    section: "B",
    entryType: "Regular",
    createdAt: new Date().toISOString(),
    present: 6,
    absent: 4,
    late: 0,
    total: 10,
    percentage: 60,
    status: "Critical",
  },
];

describe("HOD student management", () => {
  beforeEach(() => {
    mocks.getDepartment.mockReset().mockResolvedValue({
      department: "CSE-AI",
      summary: { studentCount: 2 },
      students,
    });
  });

  afterEach(() => cleanup());

  it("shows real department students and opens an individual detail view", async () => {
    const user = userEvent.setup();
    render(<StudentManagement />);

    expect(await screen.findByText("Maya Student")).not.toBeNull();
    expect(screen.getByText("Noah Student")).not.toBeNull();
    expect(screen.getByText(/CSE-AI/)).not.toBeNull();
    expect(screen.getByText("60%")).not.toBeNull();
    expect(screen.getByText("1", { selector: "strong" })).not.toBeNull();

    await user.click(screen.getAllByRole("button", { name: "View" })[0]);
    expect(screen.getByRole("dialog").textContent).toContain("maya@example.edu");
    expect(screen.getByRole("dialog").textContent).toContain("8 present, 2 absent, 0 late");
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("filters live student records by section and search text", async () => {
    const user = userEvent.setup();
    render(<StudentManagement />);

    await screen.findByText("Maya Student");
    await user.selectOptions(screen.getByLabelText("Filter students by section"), "B");
    expect(screen.queryByText("Maya Student")).toBeNull();
    expect(screen.getByText("Noah Student")).not.toBeNull();

    await user.clear(screen.getByLabelText("Search students"));
    await user.type(screen.getByLabelText("Search students"), "ST-101");
    expect(screen.getByText("No students match the selected filters.")).not.toBeNull();
  });

  it("displays API failures rather than substituting sample student data", async () => {
    mocks.getDepartment.mockRejectedValue(new Error("Department service unavailable."));
    render(<StudentManagement />);

    expect(await screen.findByRole("alert")).not.toBeNull();
    expect(screen.getByText("Department service unavailable.")).not.toBeNull();
    expect(screen.queryByText("Rahul Kumar")).toBeNull();
  });
});
