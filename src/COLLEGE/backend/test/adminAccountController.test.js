const { afterEach, test } = require("node:test");
const assert = require("node:assert/strict");

const Admin = require("../models/Admin");
const { updateAdminName } = require("../controllers/adminAccountController");

const originalFindOne = Admin.findOne;

const invoke = async ({ userId = "admin-id", body = {} }) => {
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
  await updateAdminName({ user: { userId }, body }, response);
  return { statusCode, body: responseBody };
};

afterEach(() => {
  Admin.findOne = originalFindOne;
});

test("active Admin can save a validated display name", async () => {
  const admin = {
    _id: "admin-id",
    isActive: true,
    save: async () => {},
  };
  let filter;
  Admin.findOne = async (query) => {
    filter = query;
    return admin;
  };

  const result = await invoke({ body: { name: "  Taylor Admin  " } });
  assert.equal(result.statusCode, 200);
  assert.deepEqual(filter, { _id: "admin-id", isActive: true });
  assert.equal(admin.name, "Taylor Admin");
  assert.equal(result.body.name, "Taylor Admin");
});

test("Admin display name validation and active account checks are enforced", async () => {
  let lookupCount = 0;
  Admin.findOne = async () => {
    lookupCount += 1;
    return null;
  };

  const invalid = await invoke({ body: { name: " " } });
  assert.equal(invalid.statusCode, 400);
  assert.equal(lookupCount, 0);

  const missing = await invoke({ body: { name: "Taylor Admin" } });
  assert.equal(missing.statusCode, 404);
  assert.equal(lookupCount, 1);
});
