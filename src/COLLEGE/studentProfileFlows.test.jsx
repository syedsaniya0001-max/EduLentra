import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import StudentDashboard from "./StudentDashboard";

const {
  getProfile,
  getMineAttendance,
  getAssignments,
  submitAssignment,
  getStudyMaterials,
} = vi.hoisted(() => ({
  getProfile: vi.fn(),
  getMineAttendance: vi.fn(),
  getAssignments: vi.fn(),
  submitAssignment: vi.fn(),
  getStudyMaterials: vi.fn(),
}));

vi.mock("../api/studentApi", () => ({
  studentApi: { getProfile },
}));

vi.mock("../api/attendanceApi", () => ({
  attendanceApi: {
    getMine: getMineAttendance,
    getDepartment: vi.fn(),
  },
}));

vi.mock("../api/assignmentsApi", () => ({
  assignmentsApi: {
    getMine: getAssignments,
    submit: submitAssignment,
  },
}));

vi.mock("../api/studyMaterialsApi", () => ({
  studyMaterialsApi: { getMine: getStudyMaterials },
}));

vi.mock("../api/announcementsApi", () => ({
  announcementsApi: {
    getAll: vi.fn().mockResolvedValue([]),
    subscribeToAnnouncementUpdates: vi.fn(() => () => {}),
  },
}));

vi.mock("../api/complaintsApi", () => ({
  complaintsApi: {
    create: vi.fn(),
    getMine: vi.fn().mockResolvedValue([]),
    getDepartment: vi.fn().mockResolvedValue([]),
    update: vi.fn(),
  },
}));

vi.mock("../api/outpassesApi", () => ({
  outpassesApi: { getMine: vi.fn().mockResolvedValue([]) },
}));

vi.mock("../api/suggestionsApi", () => ({
  suggestionsApi: { getMine: vi.fn().mockResolvedValue([]) },
}));

vi.mock("./PortalBackButton", () => ({ default: () => null }));

describe("student profile", () => {
  beforeEach(() => {
    getProfile.mockReset();
    getProfile.mockResolvedValue({
      name: "Maya Student",
      rollNumber: "ST-2026",
      email: "maya@example.edu",
      branch: "CSE-AI",
      section: "A",
      entryType: "Regular",
      createdAt: "2026-01-15T00:00:00.000Z",
    });
    getMineAttendance.mockResolvedValue({
      summary: { present: 1, absent: 1, late: 1, total: 3, percentage: 66.7 },
      subjects: [{
        subject: "Machine Learning",
        present: 1,
        absent: 1,
        late: 1,
        total: 3,
        percentage: 66.7,
      }],
      records: [{
        date: "2026-10-25T00:00:00.000Z",
        subject: "Machine Learning",
        period: "Period 1",
        status: "PRESENT",
      }],
    });
    getAssignments.mockResolvedValue([{
      id: "assignment-1",
      title: "Binary trees",
      description: "Explain tree traversal.",
      subject: "Data Structures",
      dueDate: "2026-12-01T23:59:59.999Z",
      maxMarks: 25,
      status: "Open",
      submission: null,
    }]);
    submitAssignment.mockReset().mockResolvedValue({
      message: "Assignment submitted successfully.",
    });
    getStudyMaterials.mockResolvedValue([{
      id: "material-1",
      title: "Unit 1 Notes",
      subject: "Machine Learning",
      unit: "Unit 1",
      section: "A",
      fileName: "unit1.pdf",
      fileUrl: "https://example.edu/unit1.pdf",
      uploadedDate: "10/25/2026",
    }]);
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => cleanup());

  it("shows the signed-in student's name and database profile instead of sample identity", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);

    expect(await screen.findByRole("heading", { name: "Hello, Maya Student 👋" })).not.toBeNull();
    expect(screen.getByText("Roll No: ST-2026")).not.toBeNull();

    await user.click(screen.getByRole("button", { name: /My Profile/ }));
    expect((await screen.findAllByText("Maya Student")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("ST-2026").length).toBeGreaterThan(0);
    expect(screen.getByText("maya@example.edu")).not.toBeNull();
    expect(screen.getByText("CSE-AI")).not.toBeNull();
    expect(screen.queryByText("Sai Student")).toBeNull();
    expect(screen.queryByText("EDU2026CSE001")).toBeNull();
  });

  it("shows attendance from the signed-in student's saved records", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);

    const attendanceLinks = await screen.findAllByRole("button", { name: /View Attendance/ });
    await user.click(attendanceLinks[0]);
    expect(await screen.findByText("66.7%", { selector: "strong" })).not.toBeNull();
    expect(screen.getAllByText("Machine Learning")).toHaveLength(2);
    expect(screen.getByText("Period 1")).not.toBeNull();
    expect(screen.getAllByText("PRESENT").length).toBeGreaterThan(0);
  });

  it("lets a student submit an assigned response", async () => {
    const user = userEvent.setup();
    getAssignments.mockResolvedValue([{
      id: "assignment-1",
      title: "Binary trees",
      description: "Explain tree traversal.",
      subject: "Data Structures",
      dueDate: "2026-12-01T23:59:59.999Z",
      maxMarks: 25,
      status: "Open",
      submission: null,
    }]);
    submitAssignment.mockResolvedValue({
      submission: {
        answer: "Inorder traversal visits left, root, then right.",
        fileUrl: "https://files.example.edu/trees.pdf",
        submittedAt: "2026-10-25T12:00:00.000Z",
        isLate: false,
        marks: null,
        feedback: "",
        gradedAt: null,
      },
    });
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);

    await user.click(screen.getByRole("button", { name: /Assignments/ }));
    await user.type(
      await screen.findByLabelText("Your response"),
      "Inorder traversal visits left, root, then right."
    );
    await user.type(
      screen.getByLabelText("Attachment URL (optional)"),
      "https://files.example.edu/trees.pdf"
    );
    await user.click(screen.getByRole("button", { name: "Submit assignment" }));

    expect(submitAssignment).toHaveBeenCalledWith(
      "assignment-1",
      "Inorder traversal visits left, root, then right.",
      "https://files.example.edu/trees.pdf"
    );
    const attachmentLink = await screen.findByRole("link", { name: "Open submitted attachment" });
    expect(attachmentLink.getAttribute("href"))
      .toBe("https://files.example.edu/trees.pdf");
    expect(await screen.findByRole("status")).not.toBeNull();
  });

  it("shows published study materials and their document links", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><StudentDashboard /></MemoryRouter>);

    await user.click(screen.getByRole("button", { name: /Notes/ }));
    expect(await screen.findByText("Unit 1 Notes")).not.toBeNull();
    expect(screen.getByRole("link", { name: "View / Download" }).getAttribute("href"))
      .toBe("https://example.edu/unit1.pdf");
  });
});
