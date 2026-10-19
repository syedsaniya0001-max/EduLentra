import { API_BASE_URL } from "./config";
import { clearAuthSession, storeAuthSession } from "./authSession";
import { announcementsApi } from "./announcementsApi";

const PROFILE_KEY = "facultyPortalProfile";
const TOKEN_KEY = "facultyToken";
const DATA_PREFIX = "facultyPortal:";

const defaultFaculty = {
  name: "Faculty Member",
  email: "",
  department: "Computer Science & Engineering",
  designation: "Faculty Advisor",
  qualification: "",
  experience: "",
  subjects: [],
  classes: []
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

const readRecords = (name) => readJson(`${DATA_PREFIX}${name}`, []);
const writeRecords = (name, records) =>
  writeJson(`${DATA_PREFIX}${name}`, records);

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
      department: result.user?.department || defaultFaculty.department
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
    return this.getCurrentUser();
  },

  async updateProfile(profile) {
    const current = this.getCurrentUser();
    const updated = saveProfile({ ...current, ...profile });
    return { faculty: updated };
  },

  async changePassword(currentPassword, newPassword) {
    const faculty = this.getCurrentUser();

    return request("/api/set-password", {
      method: "PUT",
      body: JSON.stringify({
        role: "faculty",
        id: faculty.fid || faculty.email,
        currentPassword,
        newPassword
      })
    });
  },

  async getDashboard() {
    return {};
  },

  async getStudents(search = "", branch = "All") {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (branch !== "All") query.set("branch", branch);
    const result = await request(`/api/students?${query.toString()}`);
    const students = result.students || [];

    return students
      .map((student) => ({
        ...student,
        id: student._id,
        rollNumber: student.rollNumber || "",
        branch: student.branch || "",
      }));
  },

  async getOutpasses() {
    return readRecords("outpasses");
  },

  async approveOutpass(id, remarks) {
    writeRecords(
      "outpasses",
      readRecords("outpasses").map((item) =>
        item.id === id
          ? { ...item, status: "Approved", remarks }
          : item
      )
    );
  },

  async rejectOutpass(id, remarks) {
    writeRecords(
      "outpasses",
      readRecords("outpasses").map((item) =>
        item.id === id
          ? { ...item, status: "Rejected", remarks }
          : item
      )
    );
  },

  async getAttendanceRecords(date, subject, className) {
    return readRecords("attendance").filter(
      (record) =>
        record.date === date &&
        record.subject === subject &&
        record.class === className
    );
  },

  async markAttendance(payload) {
    const records = readRecords("attendance");

    const existingIndex = records.findIndex(
      (record) =>
        record.date === payload.date &&
        record.subject === payload.subject &&
        record.class === payload.class
    );

    const nextRecord = {
      ...payload,
      id: records[existingIndex]?.id || crypto.randomUUID()
    };

    if (existingIndex < 0) {
      records.push(nextRecord);
    } else {
      records[existingIndex] = nextRecord;
    }

    writeRecords("attendance", records);
    return { message: "Attendance saved on this device." };
  },

  async getAssignments() {
    return readRecords("assignments");
  },

  async createAssignment(assignment) {
    const records = readRecords("assignments");

    records.push({
      ...assignment,
      id: crypto.randomUUID(),
      submissions: []
    });

    writeRecords("assignments", records);
  },

  async gradeSubmission(assignmentId, submissionId, marks, feedback) {
    const assignments = readRecords("assignments").map((assignment) =>
      assignment.id === assignmentId
        ? {
            ...assignment,
            submissions: (assignment.submissions || []).map((submission) =>
              submission.id === submissionId
                ? { ...submission, marks, feedback, status: "Graded" }
                : submission
            )
          }
        : assignment
    );

    writeRecords("assignments", assignments);
  },

  async getNotes(search = "", subject = "All") {
    const normalizedSearch = search.toLowerCase();

    return readRecords("notes").filter((note) => {
      const matchesSubject =
        subject === "All" || note.subject === subject;

      const matchesSearch =
        !normalizedSearch ||
        `${note.title} ${note.description || ""}`
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesSubject && matchesSearch;
    });
  },

  async uploadNote(note) {
    const records = readRecords("notes");

    records.push({
      ...note,
      id: crypto.randomUUID(),
      uploadedAt: new Date().toISOString()
    });

    writeRecords("notes", records);
  },

  async deleteNote(id) {
    writeRecords(
      "notes",
      readRecords("notes").filter((note) => note.id !== id)
    );
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
