import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HODProfile from "./Edulentra-Hod/src/pages/hod/HODProfile";

const mocks = vi.hoisted(() => ({
  getAuthUser: vi.fn(),
  updateAuthUser: vi.fn(),
  update: vi.fn(),
  getDepartmentReport: vi.fn(),
}));

vi.mock("../api/authSession", () => ({
  getAuthUser: mocks.getAuthUser,
  updateAuthUser: mocks.updateAuthUser,
}));

vi.mock("../api/hodProfileApi", () => ({
  hodProfileApi: { update: mocks.update },
}));

vi.mock("../api/hodReportsApi", () => ({
  hodReportsApi: { get: mocks.getDepartmentReport },
}));

vi.mock("./Edulentra-Hod/src/components/hod/HODLayout", () => ({
  default: ({ children }) => children,
}));

describe("HOD profile", () => {
  beforeEach(() => {
    mocks.getAuthUser.mockReset().mockReturnValue({
      name: "Original HOD",
      username: "HOD-101",
      email: "hod@example.edu",
      department: "CSE-AI",
    });
    mocks.updateAuthUser.mockReset().mockImplementation((updates) => updates);
    mocks.update.mockReset();
    mocks.getDepartmentReport.mockReset().mockResolvedValue({
      summary: { studentCount: 26, facultyCount: 4 },
    });
  });

  afterEach(() => cleanup());

  it("saves name and email and synchronizes the signed-in profile", async () => {
    const user = userEvent.setup();
    const updatedProfile = {
      name: "Updated HOD",
      username: "HOD-101",
      email: "updated@example.edu",
      department: "CSE-AI",
    };
    mocks.update.mockResolvedValue({ user: updatedProfile });
    mocks.updateAuthUser.mockReturnValue(updatedProfile);

    render(<HODProfile />);
    await user.click(screen.getByRole("button", { name: "Edit Profile" }));
    await user.clear(screen.getByLabelText("Full Name"));
    await user.type(screen.getByLabelText("Full Name"), "Updated HOD");
    await user.clear(screen.getByLabelText("Email"));
    await user.type(screen.getByLabelText("Email"), "updated@example.edu");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect((await screen.findAllByText("Updated HOD"))).toHaveLength(2);
    expect(screen.getByText("updated@example.edu")).not.toBeNull();
    expect(screen.getByRole("status").textContent).toContain("updated successfully");
    expect(mocks.update).toHaveBeenCalledWith({
      name: "Updated HOD",
      email: "updated@example.edu",
    });
    expect(mocks.updateAuthUser).toHaveBeenCalledWith(updatedProfile);
  });

  it("keeps the form open and shows a server error when saving fails", async () => {
    const user = userEvent.setup();
    mocks.update.mockRejectedValue(new Error("Email is already in use."));
    render(<HODProfile />);

    await user.click(screen.getByRole("button", { name: "Edit Profile" }));
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByRole("alert")).not.toBeNull();
    expect(screen.getByRole("alert").textContent).toContain("Email is already in use.");
    expect(screen.getByRole("button", { name: "Save Changes" })).not.toBeNull();
  });

  it("cancels edits without changing the displayed profile", async () => {
    const user = userEvent.setup();
    render(<HODProfile />);

    await user.click(screen.getByRole("button", { name: "Edit Profile" }));
    await user.clear(screen.getByLabelText("Full Name"));
    await user.type(screen.getByLabelText("Full Name"), "Unsaved Name");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getAllByText("Original HOD")).toHaveLength(2);
    expect(screen.queryByLabelText("Full Name")).toBeNull();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("loads department totals from the report service", async () => {
    render(<HODProfile />);

    expect(await screen.findByText("26")).not.toBeNull();
    expect(screen.getByText("4")).not.toBeNull();
  });

  it("shows an explicit error when department totals cannot be loaded", async () => {
    mocks.getDepartmentReport.mockRejectedValue(new Error("Report service unavailable."));
    render(<HODProfile />);

    expect(await screen.findByText(/Department totals unavailable/)).not.toBeNull();
    expect(screen.getAllByText("Unavailable")).toHaveLength(2);
  });
});
