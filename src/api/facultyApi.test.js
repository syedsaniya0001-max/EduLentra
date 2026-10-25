import { afterEach, describe, expect, it, vi } from "vitest";
import { facultyApi } from "./facultyApi";

const profile = {
  id: "FAC-17",
  name: "Taylor Faculty",
  email: "taylor@example.edu",
  department: "Science",
  branch: "Physics",
  subject: "Physics",
  phone: "5551234567",
  office: "Room 12",
  designation: "Lecturer",
  qualification: "MSc",
  experience: "5 years",
  image: "",
};

describe("Faculty profile API adapter", () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it("loads the persisted profile and synchronizes the session", async () => {
    sessionStorage.setItem("edulentraToken", "faculty-token");
    sessionStorage.setItem(
      "edulentraUser",
      JSON.stringify({ role: "faculty", username: "FAC-17" })
    );
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ faculty: profile }),
    });
    vi.stubGlobal("fetch", fetch);

    const result = await facultyApi.getProfile();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/faculty/profile"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer faculty-token",
        }),
      })
    );
    expect(result).toMatchObject(profile);
    expect(facultyApi.getCurrentUser()).toMatchObject(profile);
    expect(JSON.parse(sessionStorage.getItem("edulentraUser"))).toMatchObject({
      name: "Taylor Faculty",
      department: "Science",
    });
  });

  it("sends only editable fields and caches server-confirmed updates", async () => {
    localStorage.setItem("facultyToken", "faculty-token");
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ faculty: { ...profile, name: "Updated Faculty" } }),
    });
    vi.stubGlobal("fetch", fetch);

    const result = await facultyApi.updateProfile({
      ...profile,
      name: "Updated Faculty",
      department: "Unapproved Department",
      subject: "Unapproved Subject",
    });

    const [, options] = fetch.mock.calls[0];
    expect(options.method).toBe("PATCH");
    expect(JSON.parse(options.body)).toEqual({
      name: "Updated Faculty",
      phone: "5551234567",
      office: "Room 12",
      designation: "Lecturer",
      qualification: "MSc",
      experience: "5 years",
    });
    expect(result.faculty.name).toBe("Updated Faculty");
    expect(result.faculty.department).toBe("Science");
    expect(facultyApi.getCurrentUser().name).toBe("Updated Faculty");
  });

  it("changes password through the protected Faculty endpoint", async () => {
    localStorage.setItem("facultyToken", "faculty-token");
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Password changed successfully." }),
    });
    vi.stubGlobal("fetch", fetch);

    await facultyApi.changePassword("CurrentPassword123", "NewPassword123");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/faculty/password"),
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          currentPassword: "CurrentPassword123",
          newPassword: "NewPassword123",
        }),
      })
    );
  });

  it("surfaces service errors rather than caching a success-shaped profile", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Profile is unavailable." }),
    });
    vi.stubGlobal("fetch", fetch);

    await expect(facultyApi.getProfile()).rejects.toThrow("Profile is unavailable.");
    expect(localStorage.getItem("facultyPortalProfile")).toBeNull();
  });
});
