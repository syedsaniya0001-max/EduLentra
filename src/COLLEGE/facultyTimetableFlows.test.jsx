import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TimetableManagement from "./faculty/components/TimetableManagement";

const mocks = vi.hoisted(() => ({
  getTimetable: vi.fn(),
  createTimetableEntry: vi.fn(),
  updateTimetableEntry: vi.fn(),
  deleteTimetableEntry: vi.fn(),
}));

vi.mock("../api/facultyApi", () => ({
  facultyApi: {
    getTimetable: mocks.getTimetable,
    createTimetableEntry: mocks.createTimetableEntry,
    updateTimetableEntry: mocks.updateTimetableEntry,
    deleteTimetableEntry: mocks.deleteTimetableEntry,
  },
}));

const entry = {
  _id: "entry-1",
  day: "Monday",
  section: "A",
  startTime: "09:00",
  endTime: "10:00",
  subject: "Machine Learning",
  room: "Lab 1",
  branch: "CSE-AI",
};

describe("Faculty weekly timetable management", () => {
  beforeEach(() => {
    mocks.getTimetable.mockReset().mockResolvedValue({
      subject: "Machine Learning",
      sections: ["A", "B"],
      timetable: [],
    });
    mocks.createTimetableEntry.mockReset();
    mocks.updateTimetableEntry.mockReset();
    mocks.deleteTimetableEntry.mockReset();
  });

  afterEach(() => cleanup());

  it("creates a weekly class and displays the database-confirmed entry", async () => {
    const user = userEvent.setup();
    mocks.createTimetableEntry.mockResolvedValue(entry);
    render(<TimetableManagement />);

    await user.selectOptions(await screen.findByLabelText("Day"), "Monday");
    await user.selectOptions(screen.getByLabelText("Section"), "A");
    await user.type(screen.getByLabelText("Start time"), "09:00");
    await user.type(screen.getByLabelText("End time"), "10:00");
    await user.type(screen.getByLabelText("Room (optional)"), "Lab 1");
    await user.click(screen.getByRole("button", { name: "Add class" }));

    expect(mocks.createTimetableEntry).toHaveBeenCalledWith({
      day: "Monday",
      section: "A",
      startTime: "09:00",
      endTime: "10:00",
      room: "Lab 1",
    });
    expect(await screen.findByText("Machine Learning")).not.toBeNull();
    expect(screen.getByRole("status").textContent).toContain("Class added");
  });

  it("edits and deletes a saved class through the timetable service", async () => {
    const user = userEvent.setup();
    mocks.getTimetable.mockResolvedValue({
      subject: "Machine Learning",
      sections: ["A", "B"],
      timetable: [entry],
    });
    mocks.updateTimetableEntry.mockResolvedValue({
      ...entry,
      day: "Tuesday",
    });
    mocks.deleteTimetableEntry.mockResolvedValue({});
    render(<TimetableManagement />);

    await user.click(await screen.findByRole("button", { name: "Edit" }));
    await user.selectOptions(screen.getByLabelText("Day"), "Tuesday");
    await user.click(screen.getByRole("button", { name: "Save class" }));
    expect(mocks.updateTimetableEntry).toHaveBeenCalledWith("entry-1", {
      day: "Tuesday",
      section: "A",
      startTime: "09:00",
      endTime: "10:00",
      room: "Lab 1",
    });

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(mocks.deleteTimetableEntry).toHaveBeenCalledWith("entry-1");
    expect(await screen.findByText("No weekly classes are scheduled yet.")).not.toBeNull();
  });

  it("reports overlap errors without pretending the class was saved", async () => {
    const user = userEvent.setup();
    mocks.createTimetableEntry.mockRejectedValue(
      new Error("This class overlaps another entry in your timetable.")
    );
    render(<TimetableManagement />);

    await user.selectOptions(await screen.findByLabelText("Section"), "A");
    await user.type(screen.getByLabelText("Start time"), "09:00");
    await user.type(screen.getByLabelText("End time"), "10:00");
    await user.click(screen.getByRole("button", { name: "Add class" }));

    expect(await screen.findByRole("alert")).not.toBeNull();
    expect(screen.getByRole("alert").textContent).toContain("overlaps another entry");
    expect(screen.getByText("No weekly classes are scheduled yet.")).not.toBeNull();
  });
});
