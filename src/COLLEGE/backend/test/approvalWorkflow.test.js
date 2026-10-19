const { afterEach, test } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const { approveRequest } = require("../utils/approvalWorkflow");

const originalStartSession = mongoose.startSession;

afterEach(() => {
  mongoose.startSession = originalStartSession;
});

const installSessionStub = () => {
  let ended = false;
  const session = {
    async withTransaction(callback) {
      return callback();
    },
    async endSession() {
      ended = true;
    },
  };
  mongoose.startSession = async () => session;
  return { session, wasEnded: () => ended };
};

const createQuery = (value, session) => ({
  select(selection) {
    assert.equal(selection, "+password");
    return this;
  },
  async session(receivedSession) {
    assert.equal(receivedSession, session);
    return value;
  },
});

test("approval transfers the submitted bcrypt hash into the active account", async () => {
  const { session, wasEnded } = installSessionStub();
  const passwordHash = "$2b$10$already.hashed.password.value";
  const request = {
    _id: "request-1",
    status: "PENDING",
    password: passwordHash,
    async save(options) {
      assert.equal(options.session, session);
    },
  };
  let createdAccount;
  const Request = {
    findOne(filter) {
      assert.deepEqual(filter, { _id: "request-1", status: "PENDING" });
      return createQuery(request, session);
    },
  };
  const Account = {
    findOne() {
      return createQuery(null, session);
    },
    async create([accountData], options) {
      assert.equal(options.session, session);
      createdAccount = { _id: "account-1", ...accountData };
      return [createdAccount];
    },
  };

  const result = await approveRequest({
    Request,
    Account,
    requestId: "request-1",
    reviewerId: "reviewer-1",
    accountIdentifier: () => ({ rollNumber: "TEST-1" }),
    getAccountData: async (signupRequest) => ({
      rollNumber: "TEST-1",
      password: signupRequest.password,
      isActive: true,
    }),
  });

  assert.equal(createdAccount.password, passwordHash);
  assert.equal(createdAccount.isActive, true);
  assert.equal(result.request.status, "APPROVED");
  assert.equal(result.request.reviewedBy, "reviewer-1");
  assert.ok(result.request.reviewedAt instanceof Date);
  assert.equal(wasEnded(), true);
});

test("approval refuses legacy pending requests without a captured password", async () => {
  const { session, wasEnded } = installSessionStub();
  const Request = {
    findOne() {
      return createQuery(
        {
          _id: "legacy-request",
          status: "PENDING",
          password: undefined,
        },
        session
      );
    },
  };
  const Account = {
    async findOne() {
      assert.fail("Legacy requests must be rejected before account lookup.");
    },
    async create() {
      assert.fail("Legacy requests must not create accounts.");
    },
  };

  await assert.rejects(
    () =>
      approveRequest({
        Request,
        Account,
        requestId: "legacy-request",
        reviewerId: "reviewer-1",
        accountIdentifier: () => ({}),
        getAccountData: async () => ({}),
      }),
    (error) =>
      error.statusCode === 409 &&
      /predates password capture/.test(error.message)
  );
  assert.equal(wasEnded(), true);
});
