import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import FacultyProfile from "./faculty/components/FacultyProfile";

const mocks = vi.hoisted(() => ({
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
  getCurrentUser: vi.fn(),
}));

vi.mock("../api/facultyApi", () => ({
  facultyApi: {
    updateProfile: mocks.updateProfile,
    changePassword: mocks.changePassword,
    getCurrentUser: mocks.getCurrentUser,
  },
}));

const faculty = {
  id: "FAC-17",
  name: "Taylor Faculty",
  email: "taylor@example.edu",
  department: "Science",
  branch: "Physics",
  subject: "Physics",
  phone: "",
  office: "",
  designation: "",
  qualification: "",
  experience: "",
};

describe("Faculty profile persistence", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("saves editable details through the API and updates the dashboard profile", async () => {
    const user = userEvent.setup();
    const updated = { ...faculty, name: "Taylor A. Faculty", phone: "5551234567" };
    const onUpdateFaculty = vi.fn();
    mocks.updateProfile.mockResolvedValue({ faculty: updated });
    render(<FacultyProfile faculty={faculty} onUpdateFaculty={onUpdateFaculty} />);

    await user.clear(screen.getByLabelText("Full Name"));
    await user.type(screen.getByLabelText("Full Name"), updated.name);
    await user.type(screen.getByLabelText("Contact Phone"), updated.phone);
    await user.click(screen.getByRole("button", { name: "Save Profile Details" }));

    expect(mocks.updateProfile).toHaveBeenCalledWith({
      ...faculty,
      name: updated.name,
      phone: updated.phone,
    });
    expect(onUpdateFaculty).toHaveBeenCalledWith(updated);
    expect(await screen.findByText("Faculty profile updated successfully!")).not.toBeNull();
    expect(screen.getByLabelText("Assigned Subject").disabled).toBe(true);
    expect(screen.getByLabelText("Assigned Branch").disabled).toBe(true);
  });

  it("shows the backend error and does not claim profile changes were saved", async () => {
    const user = userEvent.setup();
    mocks.updateProfile.mockRejectedValue(new Error("Name already rejected."));
    render(<FacultyProfile faculty={faculty} />);

    await user.click(screen.getByRole("button", { name: "Save Profile Details" }));

    expect(await screen.findByText("Name already rejected.")).not.toBeNull();
    expect(screen.queryByText("Faculty profile updated successfully!")).toBeNull();
  });

  it("changes the password using current-password verification and shows success", async () => {
    const user = userEvent.setup();
    mocks.changePassword.mockResolvedValue({});
    render(<FacultyProfile faculty={faculty} />);

    await user.type(screen.getByLabelText("Current Password"), "CurrentPassword123");
    await user.type(screen.getByLabelText("New Password"), "NewPassword123");
    await user.type(screen.getByLabelText("Confirm New Password"), "NewPassword123");
    await user.click(screen.getByRole("button", { name: /Update Password/ }));

    expect(mocks.changePassword).toHaveBeenCalledWith(
      "CurrentPassword123",
      "NewPassword123"
    );
    expect(await screen.findByText("Account password changed successfully!")).not.toBeNull();
  });
});
