import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import StudentList from "./faculty/components/StudentList";

const mocks = vi.hoisted(() => ({
  getStudents: vi.fn(),
}));

vi.mock("../api/facultyApi", () => ({
  facultyApi: { getStudents: mocks.getStudents },
}));

describe("Faculty student directory", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("uses real sections and filters within the faculty's assigned student directory", async () => {
    const user = userEvent.setup();
    mocks.getStudents.mockResolvedValue({
      sections: ["A", "C"],
      students: [{
        id: "student-a",
        name: "Maya Student",
        rollNumber: "ST-2026",
        email: "maya@example.edu",
        branch: "CSE-AI",
        section: "A",
        entryType: "Regular",
      }],
    });

    render(<StudentList />);

    expect(await screen.findByText("Maya Student")).not.toBeNull();
    const sectionFilter = screen.getByRole("combobox", {
      name: "Filter students by section",
    });
    expect([...sectionFilter.options].map((option) => option.value)).toEqual([
      "All",
      "A",
      "C",
    ]);

    await user.selectOptions(sectionFilter, "A");
    await waitFor(() => {
      expect(mocks.getStudents).toHaveBeenLastCalledWith("", "A");
    });
  });

  it("shows directory service errors rather than logging them silently", async () => {
    mocks.getStudents.mockRejectedValue(new Error("Directory unavailable."));
    render(<StudentList />);

    expect(await screen.findByRole("alert")).not.toBeNull();
    expect(screen.getByRole("alert").textContent).toContain("Directory unavailable.");
  });
});
