import { API_BASE_URL } from "./config";

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
const writeRecords = (name, records) => writeJson(`${DATA_PREFIX}${name}`, records);

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || result.error || "Faculty service request failed.");
  }

  return result;
}

const saveProfile = (profile) => {
  const nextProfile = { ...defaultFaculty, ...profile };
  writeJson(PROFILE_KEY, nextProfile);
  return nextProfile;
};

export const facultyApi = {
  async login(email, password) {
    const faculties = await request("/api/faculties");
    const account = faculties.find(
      (faculty) =>
        faculty.email?.toLowerCase() === email.toLowerCase() ||
        faculty.fid?.toLowerCase() === email.toLowerCase()
    );
    const loginId = account?.fid || email;
    const result = await request("/api/login", {
      method: "POST",
      body: JSON.stringify({ role: "faculty", id: loginId, password })
    });

    saveProfile({
      ...account,
      name: result.name || account?.name || email,
      email,
      id: account?._id || account?.fid || loginId,
      fid: loginId,
      department: account?.department || account?.dept || defaultFaculty.department
    });
    localStorage.setItem(TOKEN_KEY, "active");
    return { ...result, message: "Login successful! Entering portal..." };
  },

  async signup(details) {
    const account = await request("/api/faculties", {
      method: "POST",
      body: JSON.stringify({
        name: details.name,
        fid: details.email,
        subject: details.subject,
        dept: details.department,
        password: details.password
      })
    });
    saveProfile({
      ...account,
      ...details,
      id: account._id || details.id,
      fid: details.email,
      department: details.department
    });
    localStorage.setItem(TOKEN_KEY, "active");
    return { ...account, message: "Registration request submitted successfully." };
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
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

  async getStudents(search = "", branch = "All", semester = "All") {
    const students = await request("/api/students");
    const normalizedSearch = search.toLowerCase();
    return students
      .map((student) => ({
        ...student,
        id: student._id,
        rollNumber: student.rollNumber || student.roll || "",
        branch: student.branch || "",
        semester: student.semester || ""
      }))
      .filter((student) => {
        const matchesSearch =
          !normalizedSearch ||
          student.name?.toLowerCase().includes(normalizedSearch) ||
          student.rollNumber.toLowerCase().includes(normalizedSearch);
        const matchesBranch = branch === "All" || student.branch.includes(branch);
        const matchesSemester = semester === "All" || student.semester === semester;
        return matchesSearch && matchesBranch && matchesSemester;
      });
  },

  async getOutpasses() {
    return readRecords("outpasses");
  },

  async approveOutpass(id, remarks) {
    writeRecords(
      "outpasses",
      readRecords("outpasses").map((item) =>
        item.id === id ? { ...item, status: "Approved", remarks } : item
      )
    );
  },

  async rejectOutpass(id, remarks) {
    writeRecords(
      "outpasses",
      readRecords("outpasses").map((item) =>
        item.id === id ? { ...item, status: "Rejected", remarks } : item
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
    const nextRecord = { ...payload, id: records[existingIndex]?.id || crypto.randomUUID() };

    if (existingIndex < 0) records.push(nextRecord);
    else records[existingIndex] = nextRecord;

    writeRecords("attendance", records);
    return { message: "Attendance saved on this device." };
  },

  async getAssignments() {
    return readRecords("assignments");
  },

  async createAssignment(assignment) {
    const records = readRecords("assignments");
    records.push({ ...assignment, id: crypto.randomUUID(), submissions: [] });
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
      const matchesSubject = subject === "All" || note.subject === subject;
      const matchesSearch =
        !normalizedSearch ||
        `${note.title} ${note.description || ""}`.toLowerCase().includes(normalizedSearch);
      return matchesSubject && matchesSearch;
    });
  },

  async uploadNote(note) {
    const records = readRecords("notes");
    records.push({ ...note, id: crypto.randomUUID(), uploadedAt: new Date().toISOString() });
    writeRecords("notes", records);
  },

  async deleteNote(id) {
    writeRecords("notes", readRecords("notes").filter((note) => note.id !== id));
  },

  async getAnnouncements() {
    return readRecords("announcements");
  },

  async postAnnouncement(announcement) {
    const records = readRecords("announcements");
    records.unshift({ ...announcement, id: crypto.randomUUID(), postedAt: new Date().toISOString() });
    writeRecords("announcements", records);
  },

  async deleteAnnouncement(id) {
    writeRecords(
      "announcements",
      readRecords("announcements").filter((announcement) => announcement.id !== id)
    );
  }
};
