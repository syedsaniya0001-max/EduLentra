import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NotesManagement from "./faculty/components/NotesManagement";

const mocks = vi.hoisted(() => ({
  getNotes: vi.fn(),
  uploadNote: vi.fn(),
  deleteNote: vi.fn(),
}));

vi.mock("../api/facultyApi", () => ({
  facultyApi: {
    getNotes: mocks.getNotes,
    uploadNote: mocks.uploadNote,
    deleteNote: mocks.deleteNote,
  },
}));

describe("faculty study materials workflow", () => {
  beforeEach(() => {
    mocks.getNotes.mockReset().mockResolvedValue({
      materials: [],
      sections: ["A", "B"],
      branch: "CSE-AI",
      subject: "Machine Learning",
    });
    mocks.uploadNote.mockReset().mockResolvedValue({
      id: "material-1",
      title: "Unit 1 Notes",
    });
    mocks.deleteNote.mockReset().mockResolvedValue({});
  });

  afterEach(() => cleanup());

  it("publishes a real document link for a selected student section", async () => {
    const user = userEvent.setup();
    render(<NotesManagement />);

    await user.click(await screen.findByRole("button", { name: /Upload New Material/ }));
    await user.type(screen.getByPlaceholderText(/Unit 3:/), "Unit 1 Notes");
    await user.selectOptions(screen.getByLabelText("Target Section"), "A");
    await user.type(screen.getByPlaceholderText("https://..."), "https://example.edu/unit1.pdf");
    await user.type(screen.getByPlaceholderText("e.g. Unit-1-Notes.pdf"), "unit1.pdf");
    await user.click(screen.getByRole("button", { name: "Publish Notes" }));

    expect(mocks.uploadNote).toHaveBeenCalledWith(expect.objectContaining({
      title: "Unit 1 Notes",
      section: "A",
      unit: "Unit 1",
      fileUrl: "https://example.edu/unit1.pdf",
      fileName: "unit1.pdf",
    }));
  });
});
