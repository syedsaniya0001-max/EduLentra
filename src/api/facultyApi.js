import { API_BASE_URL } from "./config";
import {
  clearAuthSession,
  getAuthUser,
  storeAuthSession,
  updateAuthUser,
} from "./authSession";
import { announcementsApi } from "./announcementsApi";

const PROFILE_KEY = "facultyPortalProfile";
const TOKEN_KEY = "facultyToken";

const defaultFaculty = {
  name: "",
  email: "",
  department: "",
  branch: "",
  subject: "",
  id: "",
  designation: "",
  phone: "",
  office: "",
  qualification: "",
  experience: "",
};

const readJson = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

async function request(path, options = {}) {
  const token =
    localStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem("edulentraToken");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message || result.error || "Faculty service request failed."
    );
  }

  return result;
}

const saveProfile = (profile) => {
  const nextProfile = { ...defaultFaculty, ...profile };
  writeJson(PROFILE_KEY, nextProfile);
  return nextProfile;
};

const syncFacultySession = (profile) => {
  if (!getAuthUser()) return;
  updateAuthUser({
    username: profile.id,
    name: profile.name,
    email: profile.email,
    department: profile.department,
    branch: profile.branch,
    subject: profile.subject,
  });
};

export const facultyApi = {
  // Faculty login using backend JWT authentication
  async login(facultyId, password) {
    const result = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: facultyId.trim(),
        password,
        role: "faculty"
      })
    });

    if (!result.token) {
      throw new Error(
        "Login did not return an authentication token. Please check the backend login response."
      );
    }

    // Save the real JWT, not the placeholder string "active".
    storeAuthSession(result, "faculty");

    saveProfile({
      ...(result.user || {}),
      name: result.user?.name || facultyId,
      id: result.user?.id || facultyId,
      fid: facultyId,
      department: result.user?.department || "",
    });

    return {
      ...result,
      message: "Login successful! Entering portal..."
    };
  },

  // Submit a Faculty registration request.
  // Registration is not a login and must not create a fake token.
  async signup(details) {
    const account = await request("/api/faculty/signup", {
      method: "POST",
      body: JSON.stringify({
        name: details.name,
        facultyId: details.id,
        email: details.email,
        subject: details.subject,
        department: details.department,
        branch: details.branch,
        password: details.password
      })
    });

    saveProfile({
      name: details.name,
      email: details.email,
      id: details.id,
      fid: details.id,
      department: details.department
    });

    return {
      requestId: account.requestId,
      message: "Registration request submitted successfully."
    };
  },

  logout() {
    clearAuthSession();
    localStorage.removeItem(PROFILE_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getCurrentUser() {
    return readJson(PROFILE_KEY, defaultFaculty);
  },

  async getProfile() {
    const result = await request("/api/faculty/profile");
    if (!result.faculty?.id || !result.faculty?.name) {
      throw new Error("The faculty profile service returned invalid data.");
    }
    const profile = saveProfile({
      ...result.faculty,
      fid: result.faculty.id,
    });
    syncFacultySession(profile);
    return profile;
  },

  async updateProfile(profile) {
    const result = await request("/api/faculty/profile", {
      method: "PATCH",
      body: JSON.stringify({
        name: profile.name,
        phone: profile.phone || "",
        office: profile.office || "",
        designation: profile.designation || "",
        qualification: profile.qualification || "",
        experience: profile.experience || "",
      }),
    });
    if (!result.faculty?.id || !result.faculty?.name) {
      throw new Error("The faculty profile service returned invalid data.");
    }
    const updated = saveProfile({
      ...result.faculty,
      fid: result.faculty.id,
    });
    syncFacultySession(updated);
    return { faculty: updated };
  },

  async changePassword(currentPassword, newPassword) {
    return request("/api/faculty/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async getDashboard() {
    const result = await request("/api/faculty/dashboard");
    const stats = result.stats;
    if (
      !stats ||
      !Number.isFinite(stats.totalStudents) ||
      !Number.isFinite(stats.pendingOutpasses) ||
      !Number.isFinite(stats.activeAssignments) ||
      !Number.isFinite(stats.totalNotes) ||
      !(stats.avgAttendance === null || Number.isFinite(stats.avgAttendance)) ||
      !Array.isArray(result.timetable) ||
      result.timetable.some(
        (entry) =>
          !entry.day ||
          !entry.startTime ||
          !entry.endTime ||
          !entry.section ||
          !entry.subject
      ) ||
      typeof result.timetableConfigured !== "boolean" ||
      !Array.isArray(result.recentActivities)
    ) {
      throw new Error("The faculty dashboard service returned invalid data.");
    }
    return result;
  },

  async getTimetable() {
    const result = await request("/api/faculty/timetable");
    if (!Array.isArray(result.timetable) || !Array.isArray(result.sections)) {
      throw new Error("The timetable service returned invalid data.");
    }
    return result;
  },

  async createTimetableEntry(entry) {
    const result = await request("/api/faculty/timetable", {
      method: "POST",
      body: JSON.stringify(entry),
    });
    if (!result.entry?._id) {
      throw new Error("The timetable service did not return the saved entry.");
    }
    return result.entry;
  },

  async updateTimetableEntry(id, entry) {
    const result = await request(`/api/faculty/timetable/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(entry),
    });
    if (!result.entry?._id) {
      throw new Error("The timetable service did not return the updated entry.");
    }
    return result.entry;
  },

  async deleteTimetableEntry(id) {
    return request(`/api/faculty/timetable/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  async getStudents(search = "", section = "All") {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (section !== "All") query.set("section", section);
    const result = await request(`/api/students?${query.toString()}`);
    if (!Array.isArray(result.students) || !Array.isArray(result.sections)) {
      throw new Error("The student directory returned an invalid response.");
    }
    return {
      sections: result.sections,
      students: result.students
      .map((student) => ({
        ...student,
        id: student._id,
        rollNumber: student.rollNumber || "",
        branch: student.branch || "",
      })),
    };
  },

  async getOutpasses() {
    const result = await request("/api/faculty/outpasses");
    if (!Array.isArray(result.outpasses)) {
      throw new Error("The outpass service returned an invalid response.");
    }
    return result.outpasses.map((outpass) => ({
      ...outpass,
      id: outpass._id || outpass.id,
      studentName: outpass.student?.name || "Student",
      rollNumber: outpass.student?.rollNumber || "",
      branch: outpass.student?.branch || "",
      section: outpass.student?.section || "",
      reason: outpass.reason || "",
      destination: outpass.destination || "",
      outDate: outpass.fromDate ? new Date(outpass.fromDate).toLocaleDateString() : "",
      inDate: outpass.toDate ? new Date(outpass.toDate).toLocaleDateString() : "",
      facultyRemarks: outpass.reviewRemarks || outpass.rejectionReason || "",
      status: outpass.status || "PENDING",
    }));
  },

  async approveOutpass(id, remarks) {
    const result = await request(`/api/faculty/outpasses/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "APPROVED",
        remarks,
      }),
    });
    return result.outpass;
  },

  async rejectOutpass(id, remarks) {
    const result = await request(`/api/faculty/outpasses/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "REJECTED",
        remarks,
      }),
    });
    return result.outpass;
  },

  async getAttendanceRoster(date, section, period) {
    const query = new URLSearchParams({ date, section, period });
    const result = await request(`/api/faculty/attendance?${query.toString()}`);
    if (!Array.isArray(result.students) || !Array.isArray(result.sections)) {
      throw new Error("The attendance service returned an invalid roster.");
    }
    return {
      branch: result.branch,
      subject: result.subject,
      sections: result.sections,
      students: result.students.map((student) => ({
        ...student,
        id: student._id,
      })),
    };
  },

  async markAttendance(payload) {
    return request("/api/faculty/attendance", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async getAssignments() {
    const result = await request("/api/faculty/assignments");
    if (!Array.isArray(result.assignments) || !Array.isArray(result.sections)) {
      throw new Error("The assignment service returned an invalid response.");
    }
    return result;
  },

  async createAssignment(assignment) {
    const result = await request("/api/faculty/assignments", {
      method: "POST",
      body: JSON.stringify(assignment),
    });
    return result.assignment;
  },

  async gradeSubmission(assignmentId, submissionId, marks, feedback) {
    const result = await request(
      `/api/faculty/assignments/${encodeURIComponent(assignmentId)}/submissions/${encodeURIComponent(submissionId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ marks, feedback }),
      }
    );
    return result.submission;
  },

  async getNotes(search = "", subject = "All") {
    const query = new URLSearchParams({ search, subject });
    const result = await request(`/api/faculty/materials?${query.toString()}`);
    if (!Array.isArray(result.materials) || !Array.isArray(result.sections)) {
      throw new Error("The study material service returned an invalid response.");
    }
    return {
      branch: result.branch,
      subject: result.subject,
      sections: result.sections,
      materials: result.materials.map((material) => ({
        ...material,
        id: material._id || material.id,
      })),
    };
  },

  async uploadNote(note) {
    const result = await request("/api/faculty/materials", {
      method: "POST",
      body: JSON.stringify(note),
    });
    return result.material;
  },

  async deleteNote(id) {
    return request(`/api/faculty/materials/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  async getAnnouncements() {
    return announcementsApi.getAll();
  },

  async postAnnouncement(announcement) {
    return announcementsApi.create(announcement);
  },

  async deleteAnnouncement(id) {
    return announcementsApi.remove(id);
  }
};
