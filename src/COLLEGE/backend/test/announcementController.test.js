const { afterEach, test } = require("node:test");
const assert = require("node:assert/strict");

const Admin = require("../models/Admin");
const Announcement = require("../models/Announcement");
const Faculty = require("../models/Faculty");
const HOD = require("../models/HOD");
const Student = require("../models/Student");
const {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  updateAnnouncement,
} = require("../controllers/announcementController");

const originalMethods = [
  [Admin, "findOne", Admin.findOne],
  [Announcement, "create", Announcement.create],
  [Announcement, "find", Announcement.find],
  [Announcement, "findById", Announcement.findById],
  [Announcement, "deleteOne", Announcement.deleteOne],
  [Announcement, "save", Announcement.save],
  [Faculty, "findOne", Faculty.findOne],
  [HOD, "findOne", HOD.findOne],
  [Student, "findOne", Student.findOne],
];

const invoke = async (controller, { user, body = {}, params = {} }) => {
  let statusCode;
  let responseBody;
  const emittedEvents = [];
  const response = {
    status(code) {
      statusCode = code;
      return this;
    },
    set() {
      return this;
    },
    json(value) {
      responseBody = value;
      return this;
    },
  };

  const request = {
    user,
    body,
    params,
    app: {
      get: () => ({
        to: () => ({ emit: (event) => emittedEvents.push(event) }),
      }),
    },
  };
  await controller(request, response);
  return { statusCode, body: responseBody, emittedEvents };
};

afterEach(() => {
  for (const [Model, method, original] of originalMethods) {
    Model[method] = original;
  }
});

test("student announcement lookup is limited to global or matching-role announcements", async () => {
  const profileId = "student-id";
  Student.findOne = async () => ({ _id: profileId, branch: "CSE-AI" });

  let query;
  Announcement.find = (filter) => {
    query = filter;
    return {
      sort() {
        return this;
      },
      lean: async () => [],
    };
  };

  const result = await invoke(getAnnouncements, {
    user: { userId: profileId, role: "student" },
  });

  assert.equal(result.statusCode, 200);
  assert.equal(query.isActive, true);
  assert.deepEqual(query.$and[2], {
    targetRole: { $in: ["ALL", "STUDENT"] },
  });
  assert.deepEqual(query.$and[3].$or[0], {
    targetDepartment: { $regex: "^(?:CSE|CSE-AI)$", $options: "i" },
  });
});

test("announcement lookup excludes drafts, future publications, and expired items", async () => {
  Student.findOne = async () => ({
    _id: "student-id",
    branch: "CSE",
    section: "A",
  });

  let query;
  Announcement.find = (filter) => {
    query = filter;
    return {
      sort() {
        return this;
      },
      lean: async () => [],
    };
  };

  const result = await invoke(getAnnouncements, {
    user: { userId: "student-id", role: "student" },
  });

  assert.equal(result.statusCode, 200);
  assert.equal(query.isActive, true);
  assert.deepEqual(query.$and[0].$or[0], { publishAt: null });
  assert.ok(query.$and[0].$or[1].publishAt.$lte instanceof Date);
  assert.deepEqual(query.$and[1].$or[0], { expiresAt: null });
  assert.ok(query.$and[1].$or[1].expiresAt.$gt instanceof Date);
});

test("faculty announcements are restricted to students in the faculty branch", async () => {
  Faculty.findOne = async () => ({
    _id: "faculty-id",
    name: "Faculty Member",
    branch: "CSE-AI",
    department: "CSE",
  });

  let savedAnnouncement;
  Announcement.create = async (announcement) => {
    savedAnnouncement = announcement;
    return {
      ...announcement,
      _id: { toString: () => "announcement-id" },
      toObject() {
        return { ...announcement, _id: this._id };
      },
    };
  };

  const result = await invoke(createAnnouncement, {
    user: { userId: "faculty-id", role: "faculty" },
    body: {
      title: "Exam schedule",
      message: "See the attached timetable.",
      targetRole: "STUDENT",
      date: "2026-10-10",
    },
  });

  assert.equal(result.statusCode, 201);
  assert.equal(savedAnnouncement.targetRole, "STUDENT");
  assert.equal(savedAnnouncement.targetDepartment, "CSE-AI");
  assert.equal(savedAnnouncement.createdByModel, "Faculty");
  assert.deepEqual(result.emittedEvents, ["announcements:changed"]);

  const denied = await invoke(createAnnouncement, {
    user: { userId: "faculty-id", role: "faculty" },
    body: {
      title: "Faculty only",
      message: "This audience is not permitted.",
      targetRole: "FACULTY",
      date: "2026-10-10",
    },
  });
  assert.equal(denied.statusCode, 403);
});

test("administrators can publish global announcements", async () => {
  Admin.findOne = async () => ({
    _id: "admin-id",
    username: "campus-admin",
  });

  let savedAnnouncement;
  Announcement.create = async (announcement) => {
    savedAnnouncement = announcement;
    return {
      ...announcement,
      _id: { toString: () => "announcement-id" },
      toObject() {
        return { ...announcement, _id: this._id };
      },
    };
  };

  const result = await invoke(createAnnouncement, {
    user: { userId: "admin-id", role: "admin" },
    body: {
      title: "Campus notice",
      message: "This announcement is for everyone.",
      targetRole: "ALL",
      date: "2026-10-10",
    },
  });

  assert.equal(result.statusCode, 201);
  assert.equal(savedAnnouncement.targetRole, "ALL");
  assert.equal(savedAnnouncement.targetDepartment, null);
  assert.equal(savedAnnouncement.createdByName, "campus-admin");
});

test("announcement creation rejects an expiry before its scheduled publication", async () => {
  Admin.findOne = async () => ({ _id: "admin-id", username: "campus-admin" });
  let createCalled = false;
  Announcement.create = async () => {
    createCalled = true;
  };

  const result = await invoke(createAnnouncement, {
    user: { userId: "admin-id", role: "admin" },
    body: {
      title: "Invalid schedule",
      message: "The expiry precedes the publication time.",
      targetRole: "ALL",
      date: "2026-10-19",
      publishAt: "2026-10-22T00:00:00.000Z",
      expiresAt: "2026-10-21T00:00:00.000Z",
    },
  });

  assert.equal(result.statusCode, 400);
  assert.equal(createCalled, false);
  assert.deepEqual(result.emittedEvents, []);
});

test("HOD announcements are restricted to their department students or faculty", async () => {
  HOD.findOne = async () => ({
    _id: "hod-id",
    name: "Department HOD",
    department: "CSE",
  });

  let savedAnnouncement;
  Announcement.create = async (announcement) => {
    savedAnnouncement = announcement;
    return {
      ...announcement,
      _id: { toString: () => "announcement-id" },
      toObject() {
        return { ...announcement, _id: this._id };
      },
    };
  };

  const result = await invoke(createAnnouncement, {
    user: { userId: "hod-id", role: "hod" },
    body: {
      title: "Department meeting",
      message: "Meeting at 10 AM.",
      targetRole: "FACULTY",
      date: "2026-10-10",
    },
  });

  assert.equal(result.statusCode, 201);
  assert.equal(savedAnnouncement.targetDepartment, "CSE");
  assert.equal(savedAnnouncement.createdByModel, "HOD");
});

test("only administrators or the announcement author may delete it", async () => {
  Faculty.findOne = async () => ({ _id: "faculty-id" });
  Announcement.findById = async () => ({
    _id: "announcement-id",
    createdBy: { toString: () => "other-faculty" },
    createdByModel: "Faculty",
  });

  const result = await invoke(deleteAnnouncement, {
    user: { userId: "faculty-id", role: "faculty" },
    params: { id: "65f0c0a12345678901234567" },
  });

  assert.equal(result.statusCode, 403);
});

test("announcement author can update content and audience", async () => {
  Faculty.findOne = async () => ({
    _id: "faculty-id",
    branch: "CSE-AI",
    department: "CSE",
  });

  const existing = {
    _id: { toString: () => "announcement-id" },
    createdBy: { toString: () => "faculty-id" },
    createdByModel: "Faculty",
    isActive: true,
    save: async () => {},
    toObject() {
      return {
        _id: this._id,
        title: this.title,
        message: this.message,
        targetRole: this.targetRole,
        targetDepartment: this.targetDepartment,
      };
    },
  };
  Announcement.findById = async () => existing;

  const result = await invoke(updateAnnouncement, {
    user: { userId: "faculty-id", role: "faculty" },
    params: { id: "65f0c0a12345678901234567" },
    body: {
      title: "Updated notice",
      message: "Updated details.",
      targetRole: "STUDENT",
      category: "Academic",
      priority: "High",
      date: "2026-10-20",
    },
  });

  assert.equal(result.statusCode, 200);
  assert.equal(existing.title, "Updated notice");
  assert.equal(existing.targetDepartment, "CSE-AI");
  assert.equal(result.body.announcement.canEdit, true);
});
