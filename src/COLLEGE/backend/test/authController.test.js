const { afterEach, test } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const models = {
  admin: require("../models/Admin"),
  student: require("../models/Student"),
  faculty: require("../models/Faculty"),
  hod: require("../models/HOD"),
};
const { login } = require("../controllers/authController");

const originalFindOne = Object.fromEntries(
  Object.entries(models).map(([role, Model]) => [role, Model.findOne])
);
const originalJwtSecret = process.env.JWT_SECRET;

const invokeLogin = async (body) => {
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

  await login({ body }, response);
  return { statusCode, body: responseBody };
};

afterEach(() => {
  for (const [role, Model] of Object.entries(models)) {
    Model.findOne = originalFindOne[role];
  }
  if (originalJwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalJwtSecret;
  }
});

test("all four active account roles authenticate with role-specific identifiers and issue signed JWTs", async () => {
  process.env.JWT_SECRET = "test-secret-that-is-long-enough-for-auth-tests";
  const password = "TestPassword!2026";
  const hash = await bcrypt.hash(password, 4);
  const cases = [
    ["admin", "Demo-Admin", "username"],
    ["student", "DEMO-STU-001", "rollNumber"],
    ["faculty", "DEMO-FAC-001", "facultyId"],
    ["hod", "DEMO-HOD-001", "hodId"],
  ];

  for (const [role, identifier, field] of cases) {
    const Model = models[role];
    Model.findOne = async (query) => {
      assert.deepEqual(query, {
        [field]: role === "admin" ? identifier.toLowerCase() : identifier,
        isActive: true,
      });
      return {
        _id: `user-${role}`,
        name: `Test ${role}`,
        [field]: identifier,
        password: hash,
      };
    };

    const result = await invokeLogin({
      username: identifier,
      password,
      role,
    });

    assert.equal(result.statusCode, 200);
    assert.equal(result.body.role, role);
    assert.equal(result.body.user.role, role);
    assert.equal(result.body.user.username, identifier);
    const decodedToken = jwt.verify(result.body.token, process.env.JWT_SECRET);
    assert.equal(decodedToken.userId, `user-${role}`);
    assert.equal(decodedToken.role, role);
    assert.equal(typeof decodedToken.exp, "number");
  }
});

test("login rejects bad passwords and accounts not found by the active-account query", async () => {
  process.env.JWT_SECRET = "test-secret-that-is-long-enough-for-auth-tests";
  const hash = await bcrypt.hash("CorrectPassword!2026", 4);
  models.student.findOne = async (query) => {
    assert.deepEqual(query, { rollNumber: "DEMO-STU-001", isActive: true });
    return { _id: "pending-student", password: hash };
  };

  const invalidPassword = await invokeLogin({
    username: "DEMO-STU-001",
    password: "incorrect",
    role: "student",
  });
  assert.equal(invalidPassword.statusCode, 401);
  assert.equal(invalidPassword.body.message, "Invalid credentials");

  models.student.findOne = async () => null;
  const pendingAccount = await invokeLogin({
    username: "DEMO-STU-001",
    password: "CorrectPassword!2026",
    role: "student",
  });
  assert.equal(pendingAccount.statusCode, 401);
  assert.equal(pendingAccount.body.message, "Account not found or not approved");
});

test("sample seed safety requires test mode, a dedicated _test database, and distinct passwords", () => {
  const { validateSeedEnvironment } = require("../scripts/seedSampleAccounts");
  const validEnvironment = {
    NODE_ENV: "test",
    EDULENTRA_ENABLE_SAMPLE_SEED: "true",
    MONGODB_URI: "mongodb://localhost:27017/edulentra_test",
    JWT_SECRET: "test-secret-that-is-long-enough-for-auth-tests",
    SAMPLE_STUDENT_PASSWORD: "StudentPassword!2026",
    SAMPLE_FACULTY_PASSWORD: "FacultyPassword!2026",
    SAMPLE_HOD_PASSWORD: "HodPassword!2026",
    SAMPLE_ADMIN_PASSWORD: "AdminPassword!2026",
  };

  assert.equal(validateSeedEnvironment(validEnvironment), "edulentra_test");
  assert.throws(
    () => validateSeedEnvironment({ ...validEnvironment, NODE_ENV: "production" }),
    /requires NODE_ENV=test/
  );
  assert.throws(
    () =>
      validateSeedEnvironment({
        ...validEnvironment,
        MONGODB_URI: "mongodb://localhost:27017/edulentra",
      }),
    /must end in _test/
  );
});
