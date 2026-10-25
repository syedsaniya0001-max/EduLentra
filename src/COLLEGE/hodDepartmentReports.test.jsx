import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DepartmentReports from "./Edulentra-Hod/src/pages/hod/DepartmentReports";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock("../api/hodReportsApi", () => ({
  hodReportsApi: { get: mocks.get },
}));

vi.mock("./Edulentra-Hod/src/components/hod/HODLayout", () => ({
  default: ({ children }) => children,
}));

const reportData = {
  department: "CSE-AI",
  generatedAt: "2026-10-25T10:00:00.000Z",
  summary: {
    studentCount: 2,
    facultyCount: 1,
    attendanceRecords: 3,
    attendancePercentage: 66.7,
  },
  students: [{
    name: "Maya Student",
    rollNumber: "ST-101",
    section: "A",
    entryType: "Regular",
    present: 2,
    absent: 1,
    late: 0,
    total: 3,
    attendancePercentage: 66.7,
  }],
  faculty: [{
    name: "Faculty One",
    facultyId: "FAC-1",
    subject: "Machine Learning",
    department: "CSE-AI",
  }],
};

describe("HOD department reports", () => {
  let originalCreateObjectURL;
  let originalRevokeObjectURL;
  let clickSpy;

  beforeEach(() => {
    mocks.get.mockReset().mockResolvedValue(reportData);
    originalCreateObjectURL = URL.createObjectURL;
    originalRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => "blob:report");
    URL.revokeObjectURL = vi.fn();
    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    clickSpy.mockRestore();
  });

  it("renders real department figures and generates a downloadable CSV report", async () => {
    const user = userEvent.setup();
    render(<DepartmentReports />);

    expect(await screen.findByText(/Live reports for CSE-AI/)).not.toBeNull();
    expect(screen.getByText("66.7%")).not.toBeNull();
    expect(screen.queryByText("92%")).toBeNull();

    await user.click(screen.getAllByRole("button", { name: /Generate & Download/ })[0]);
    expect(mocks.get).toHaveBeenCalledTimes(2);
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:report");
    expect(await screen.findByRole("status")).not.toBeNull();
    expect(screen.getByRole("status").textContent).toContain("downloaded.");
  });

  it("filters report types and surfaces report service errors", async () => {
    const user = userEvent.setup();
    render(<DepartmentReports />);

    await screen.findByText("Department Student Directory");
    await user.selectOptions(screen.getByLabelText("Report type"), "Faculty");
    expect(screen.getByText("Department Faculty Directory")).not.toBeNull();
    expect(screen.queryByText("Department Student Directory")).toBeNull();

    cleanup();
    mocks.get.mockRejectedValue(new Error("Report service unavailable."));
    render(<DepartmentReports />);
    expect(await screen.findByRole("alert")).not.toBeNull();
    expect(screen.getByText("Report service unavailable.")).not.toBeNull();
  });
});
