const { test } = require("node:test");
const assert = require("node:assert/strict");

const Faculty = require("../models/Faculty");
const FacultyTimetable = require("../models/FacultyTimetable");
const Student = require("../models/Student");
const {
  createFacultyTimetableEntry,
  deleteFacultyTimetableEntry,
  getFacultyTimetable,
  updateFacultyTimetableEntry,
} = require("../controllers/facultyTimetableController");

const methods = [
  [Faculty, "findOne"],
  [FacultyTimetable, "find"],
  [FacultyTimetable, "findOne"],
  [FacultyTimetable, "create"],
  [FacultyTimetable, "deleteOne"],
  [Student, "find"],
  [Student, "exists"],
];

const facultyId = "65f0c0a12345678901234567";
const entryId = "65f0c0a12345678901234568";
const faculty = {
  _id: facultyId,
  branch: "CSE-AI",
  department: "CSE-AI",
  subject: "Machine Learning",
};
const validEntry = {
  day: "Monday",
  section: "A",
  startTime: "09:00",
  endTime: "10:00",
  room: "Lab 1",
};

const invoke = async (controller, request) => {
  let statusCode;
  let body;
  const response = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(value) {
      body = value;
      return this;
    },
  };
  await controller(request, response);
  return { statusCode, body };
};

const query = (value) => ({
  select() { return this; },
  sort() { return this; },
  lean: async () => value,
});

const withStubs = async (stubs, action) => {
  const saved = methods.map(([model, method]) => [model, method, model[method]]);
  for (const [model, method, implementation] of stubs) {
    model[method] = implementation;
  }
  try {
    await action();
  } finally {
    for (const [model, method, implementation] of saved) {
      model[method] = implementation;
    }
  }
};

const conflictFree = (filter) => {
  assert.ok(["Monday", "Tuesday"].includes(filter.day));
  assert.ok(filter.startTime.$lt);
  assert.ok(filter.endTime.$gt);
  return { select: async () => null };
};

test("faculty can list only their own weekly timetable and actual branch sections", async () => {
  await withStubs([
    [Faculty, "findOne", (filter) => {
      assert.deepEqual(filter, { _id: facultyId, isActive: true });
      return { select: async () => faculty };
    }],
    [FacultyTimetable, "find", (filter) => {
      assert.deepEqual(filter, { faculty: facultyId });
      return query([{ _id: entryId, ...validEntry, subject: faculty.subject }]);
    }],
    [Student, "find", (filter) => {
      assert.deepEqual(filter, { branch: "CSE-AI", isActive: true });
      return query([{ section: "A" }, { section: "B" }, { section: "" }]);
    }],
  ], async () => {
    const result = await invoke(getFacultyTimetable, {
      user: { userId: facultyId },
    });
    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.body.sections, ["A", "B"]);
    assert.equal(result.body.subject, "Machine Learning");
    assert.equal(result.body.timetable[0]._id, entryId);
  });
});

test("faculty can create a valid class using server-owned branch and subject", async () => {
  let created;
  await withStubs([
    [Faculty, "findOne", () => ({ select: async () => faculty })],
    [Student, "exists", async (filter) => {
      assert.deepEqual(filter, {
        branch: "CSE-AI",
        section: "A",
        isActive: true,
      });
      return { _id: "student-1" };
    }],
    [FacultyTimetable, "findOne", (filter) => conflictFree(filter)],
    [FacultyTimetable, "create", async (entry) => {
      created = entry;
      return { ...entry, _id: entryId };
    }],
  ], async () => {
    const result = await invoke(createFacultyTimetableEntry, {
      user: { userId: facultyId },
      body: { ...validEntry, branch: "UNTRUSTED", subject: "UNTRUSTED" },
    });
    assert.equal(result.statusCode, 201);
    assert.equal(created.faculty, facultyId);
    assert.equal(created.branch, "CSE-AI");
    assert.equal(created.subject, "Machine Learning");
    assert.equal(result.body.entry._id, entryId);
  });
});

test("faculty timetable rejects invalid times and sections before creating records", async () => {
  await withStubs([
    [Faculty, "findOne", () => ({ select: async () => faculty })],
    [Student, "exists", async () => ({ _id: "student-1" })],
    [FacultyTimetable, "findOne", () => {
      assert.fail("Invalid time ranges must be rejected before conflict lookup.");
    }],
    [FacultyTimetable, "create", async () => {
      assert.fail("Invalid time ranges must not be persisted.");
    }],
  ], async () => {
    const result = await invoke(createFacultyTimetableEntry, {
      user: { userId: facultyId },
      body: { ...validEntry, startTime: "10:00", endTime: "09:00" },
    });
    assert.equal(result.statusCode, 400);
  });
});

test("faculty timetable rejects overlapping faculty, section, or room reservations", async () => {
  await withStubs([
    [Faculty, "findOne", () => ({ select: async () => faculty })],
    [Student, "exists", async () => ({ _id: "student-1" })],
    [FacultyTimetable, "findOne", (filter) => ({
      select: async () =>
        filter.faculty || filter.room ? { _id: "conflict" } : null,
    })],
    [FacultyTimetable, "create", async () => {
      assert.fail("Conflicting classes must not be persisted.");
    }],
  ], async () => {
    const result = await invoke(createFacultyTimetableEntry, {
      user: { userId: facultyId },
      body: validEntry,
    });
    assert.equal(result.statusCode, 409);
    assert.match(result.body.message, /overlaps another entry/);
  });
});

test("faculty can update and delete only entries they own", async () => {
  const existing = {
    _id: entryId,
    day: validEntry.day,
    startTime: validEntry.startTime,
    endTime: validEntry.endTime,
    section: validEntry.section,
    room: validEntry.room,
    subject: faculty.subject,
    save: async () => existing,
  };
  await withStubs([
    [Faculty, "findOne", () => ({ select: async () => faculty })],
    [Student, "exists", async () => ({ _id: "student-1" })],
    [FacultyTimetable, "findOne", (filter) => {
      if (typeof filter._id === "string") {
        assert.deepEqual(filter, { _id: entryId, faculty: facultyId });
        return existing;
      }
      return conflictFree(filter);
    }],
    [FacultyTimetable, "deleteOne", async (filter) => {
      assert.deepEqual(filter, { _id: entryId, faculty: facultyId });
      return { deletedCount: 1 };
    }],
  ], async () => {
    const updated = await invoke(updateFacultyTimetableEntry, {
      user: { userId: facultyId },
      params: { entryId },
      body: { ...validEntry, day: "Tuesday", startTime: "11:00", endTime: "12:00" },
    });
    assert.equal(updated.statusCode, 200);
    assert.equal(existing.day, "Tuesday");
    assert.equal(existing.subject, "Machine Learning");

    const deleted = await invoke(deleteFacultyTimetableEntry, {
      user: { userId: facultyId },
      params: { entryId },
    });
    assert.equal(deleted.statusCode, 200);
  });
});
