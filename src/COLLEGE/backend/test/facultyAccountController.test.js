const { afterEach, test } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");

const Faculty = require("../models/Faculty");
const {
  getFacultyProfile,
  updateFacultyProfile,
} = require("../controllers/facultyAccountController");

const originalFindOne = Faculty.findOne;
const originalCompare = bcrypt.compare;
const originalHash = bcrypt.hash;

const invoke = async (controller, { userId = "faculty-id", body = {} } = {}) => {
  let statusCode;
  let responseBody;
  const response = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(value) {
      responseBody = value;
      return this;
    },
  };
  await controller({ user: { userId }, body }, response);
  return { statusCode, body: responseBody };
};

afterEach(() => {
  Faculty.findOne = originalFindOne;
  bcrypt.compare = originalCompare;
  bcrypt.hash = originalHash;
});

test("faculty profile retrieval returns only the active account's saved details", async () => {
  let filter;
  Faculty.findOne = async (query) => {
    filter = query;
    return {
      facultyId: "FAC-17",
      name: "Taylor Faculty",
      email: "taylor@example.edu",
      department: "Science",
      branch: "Physics",
      subject: "Physics",
      phone: "555-1234567",
      office: "Room 12",
      designation: "Lecturer",
      qualification: "MSc",
      experience: "5 years",
      image: "",
    };
  };

  const result = await invoke(getFacultyProfile);
  assert.equal(result.statusCode, 200);
  assert.deepEqual(filter, { _id: "faculty-id", isActive: true });
  assert.deepEqual(result.body.faculty, {
    id: "FAC-17",
    username: "FAC-17",
    name: "Taylor Faculty",
    email: "taylor@example.edu",
    department: "Science",
    branch: "Physics",
    subject: "Physics",
    image: "",
    phone: "555-1234567",
    office: "Room 12",
    designation: "Lecturer",
    qualification: "MSc",
    experience: "5 years",
  });
});

test("faculty can save validated profile details without changing assigned fields", async () => {
  const faculty = {
    facultyId: "FAC-17",
    name: "Old Name",
    department: "Science",
    branch: "Physics",
    subject: "Physics",
    save: async () => {},
  };
  Faculty.findOne = async () => faculty;

  const result = await invoke(updateFacultyProfile, {
    body: {
      name: "  New Name  ",
      phone: "+1 (555) 123-4567",
      office: "Room 12",
      designation: "Lecturer",
      qualification: "MSc",
      experience: "5 years",
      department: "Changed Department",
      subject: "Changed Subject",
      branch: "Changed Branch",
    },
  });

  assert.equal(result.statusCode, 200);
  assert.equal(faculty.name, "New Name");
  assert.equal(faculty.department, "Science");
  assert.equal(faculty.branch, "Physics");
  assert.equal(faculty.subject, "Physics");
  assert.equal(faculty.phone, "+1 (555) 123-4567");
  assert.equal(result.body.faculty.name, "New Name");
  assert.equal(result.body.faculty.subject, "Physics");
});

test("profile validation rejects invalid name, phone, and oversized values", async () => {
  let lookupCount = 0;
  Faculty.findOne = async () => {
    lookupCount += 1;
    return { save: async () => {} };
  };

  const invalidName = await invoke(updateFacultyProfile, {
    body: { name: " " },
  });
  assert.equal(invalidName.statusCode, 400);

  const invalidPhone = await invoke(updateFacultyProfile, {
    body: { name: "Valid Name", phone: "call me" },
  });
  assert.equal(invalidPhone.statusCode, 400);

  const oversized = await invoke(updateFacultyProfile, {
    body: { name: "Valid Name", office: "x".repeat(121) },
  });
  assert.equal(oversized.statusCode, 400);
  assert.equal(lookupCount, 0);
});

test("inactive faculty accounts cannot read or update profile data", async () => {
  Faculty.findOne = async () => null;

  const read = await invoke(getFacultyProfile);
  const update = await invoke(updateFacultyProfile, {
    body: { name: "Valid Name" },
  });

  assert.equal(read.statusCode, 404);
  assert.equal(update.statusCode, 404);
});

test("faculty password change verifies current password and persists a new hash", async () => {
  const oldHash = await bcrypt.hash("CurrentPassword123", 4);
  const faculty = {
    password: oldHash,
    save: async () => {},
  };
  Faculty.findOne = async (filter) => {
    assert.deepEqual(filter, { _id: "faculty-id", isActive: true });
    return faculty;
  };

  const result = await invoke(
    require("../controllers/facultyAccountController").changeFacultyPassword,
    {
      body: {
        currentPassword: "CurrentPassword123",
        newPassword: "NewPassword123",
      },
    }
  );

  assert.equal(result.statusCode, 200);
  assert.equal(result.body.message, "Password changed successfully.");
  assert.notEqual(faculty.password, oldHash);
  assert.equal(await bcrypt.compare("NewPassword123", faculty.password), true);
  assert.equal(await bcrypt.compare("CurrentPassword123", faculty.password), false);
});

test("faculty password change rejects wrong current passwords and invalid new passwords", async () => {
  const faculty = {
    password: "stored-hash",
    save: async () => {},
  };
  let lookupCount = 0;
  Faculty.findOne = async () => {
    lookupCount += 1;
    return faculty;
  };
  bcrypt.compare = async () => false;

  const invalidNewPassword = await invoke(
    require("../controllers/facultyAccountController").changeFacultyPassword,
    {
      body: { currentPassword: "current", newPassword: "short" },
    }
  );
  assert.equal(invalidNewPassword.statusCode, 400);
  assert.equal(lookupCount, 0);

  const wrongCurrentPassword = await invoke(
    require("../controllers/facultyAccountController").changeFacultyPassword,
    {
      body: { currentPassword: "wrong", newPassword: "ValidPassword123" },
    }
  );
  assert.equal(wrongCurrentPassword.statusCode, 401);
  assert.equal(faculty.password, "stored-hash");
  assert.equal(lookupCount, 1);
});
