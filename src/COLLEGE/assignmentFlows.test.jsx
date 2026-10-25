import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AssignmentManagement from "./faculty/components/AssignmentManagement";

const mocks = vi.hoisted(() => ({
  getAssignments: vi.fn(),
  createAssignment: vi.fn(),
  gradeSubmission: vi.fn(),
}));

vi.mock("../api/facultyApi", () => ({
  facultyApi: {
    getAssignments: mocks.getAssignments,
    createAssignment: mocks.createAssignment,
    gradeSubmission: mocks.gradeSubmission,
  },
}));

const assignment = {
  id: "assignment-1",
  title: "Binary trees",
  description: "Implement tree traversals.",
  branch: "CSE-AI",
  section: "A",
  class: "CSE-AI (Section A)",
  subject: "Data Structures",
  dueDate: "2026-12-01",
  maxMarks: 25,
  status: "Open",
  submittedCount: 1,
  totalCount: 2,
  submissions: [{
    submissionId: "submission-1",
    studentName: "Maya Student",
    rollNumber: "ST-2026",
    answer: "Inorder traversal visits left, root, then right.",
    submittedAt: "2026-10-25T12:00:00.000Z",
    isLate: false,
    status: "Submitted",
    marks: null,
    feedback: "",
  }],
};

describe("faculty assignment workflow", () => {
  beforeEach(() => {
    mocks.getAssignments.mockReset().mockResolvedValue({
      assignments: [assignment],
      sections: ["A", "B"],
      branch: "CSE-AI",
      subject: "Data Structures",
    });
    mocks.createAssignment.mockReset().mockResolvedValue(assignment);
    mocks.gradeSubmission.mockReset().mockResolvedValue({});
  });

  afterEach(() => cleanup());

  it("loads real assignments and saves a grade to the assignment service", async () => {
    const user = userEvent.setup();
    mocks.getAssignments
      .mockResolvedValueOnce({
        assignments: [assignment],
        sections: ["A", "B"],
        branch: "CSE-AI",
        subject: "Data Structures",
      })
      .mockResolvedValueOnce({
        assignments: [{
          ...assignment,
          submissions: [{
            ...assignment.submissions[0],
            status: "Graded",
            marks: 20,
            feedback: "Good explanation.",
          }],
        }],
        sections: ["A", "B"],
        branch: "CSE-AI",
        subject: "Data Structures",
      });
    render(<AssignmentManagement />);

    expect(await screen.findByText("Binary trees")).not.toBeNull();
    await user.click(screen.getByRole("button", { name: /Review Submissions/ }));
    expect(screen.getByText("Inorder traversal visits left, root, then right.")).not.toBeNull();
    await user.type(screen.getByPlaceholderText("Score (/25)"), "20");
    await user.type(screen.getByPlaceholderText("Faculty Feedback / Remarks..."), "Good explanation.");
    await user.click(screen.getByRole("button", { name: "Save Grade" }));

    expect(mocks.gradeSubmission).toHaveBeenCalledWith(
      "assignment-1",
      "submission-1",
      "20",
      "Good explanation."
    );
    expect(await screen.findByText("Graded (20/25)")).not.toBeNull();
  });

  it("creates assignments for real sections and faculty-owned subject", async () => {
    const user = userEvent.setup();
    mocks.getAssignments
      .mockResolvedValueOnce({
        assignments: [],
        sections: ["A", "B"],
        branch: "CSE-AI",
        subject: "Data Structures",
      })
      .mockResolvedValueOnce({
        assignments: [assignment],
        sections: ["A", "B"],
        branch: "CSE-AI",
        subject: "Data Structures",
      });
    render(<AssignmentManagement />);

    await user.click(await screen.findByRole("button", { name: /Create Assignment/ }));
    await user.type(screen.getByPlaceholderText(/e\.g\. Assignment 4/), "Binary trees");
    await user.click(screen.getByRole("button", { name: "Publish Assignment" }));

    expect(mocks.createAssignment).toHaveBeenCalledWith(expect.objectContaining({
      title: "Binary trees",
      section: "*",
      dueDate: expect.any(String),
      maxMarks: 25,
    }));
  });
});
