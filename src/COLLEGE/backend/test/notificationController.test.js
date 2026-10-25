const { test } = require("node:test");
const assert = require("node:assert/strict");

const Admin = require("../models/Admin");
const HODRequest = require("../models/HODRequest");
const Notification = require("../models/Notification");
const {
  getAdminNotifications,
  markAdminNotificationsRead,
} = require("../controllers/notificationController");

const methods = [
  [Admin, "findOne"],
  [HODRequest, "find"],
  [Notification, "findOneAndUpdate"],
  [Notification, "updateMany"],
];

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

const adminId = "65f0c0a12345678901234567";
const requestId = "65f0c0a12345678901234568";
const notificationId = "65f0c0a12345678901234569";

const adminQuery = () => ({ select: async () => ({ _id: adminId }) });
const pendingRequest = {
  _id: requestId,
  name: "Alex HOD",
  hodId: "HOD-101",
  department: "CSE-AI",
  createdAt: new Date("2026-10-25T10:00:00.000Z"),
};

test("Admin notification feed is generated from actual pending HOD requests", async () => {
  await withStubs([
    [Admin, "findOne", (filter) => {
      assert.deepEqual(filter, { _id: adminId, isActive: true });
      return adminQuery();
    }],
    [HODRequest, "find", (filter) => {
      assert.deepEqual(filter, { status: "PENDING" });
      return {
        select() { return this; },
        sort() { return this; },
        lean: async () => [pendingRequest],
      };
    }],
    [Notification, "findOneAndUpdate", (filter, update, options) => {
      assert.deepEqual(filter, {
        recipient: adminId,
        recipientModel: "Admin",
        sourceRequest: requestId,
      });
      assert.equal(update.$setOnInsert.isRead, false);
      assert.equal(options.upsert, true);
      return {
        lean: async () => ({
          _id: notificationId,
          sourceRequest: requestId,
          title: "HOD approval request",
          message: "Alex HOD (HOD-101) requested approval for CSE-AI.",
          isRead: false,
          createdAt: pendingRequest.createdAt,
        }),
      };
    }],
  ], async () => {
    const result = await invoke(getAdminNotifications, {
      user: { userId: adminId },
    });
    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.body.notifications[0], {
      id: notificationId,
      requestId,
      title: "HOD approval request",
      text: "Alex HOD (HOD-101) requested approval for CSE-AI.",
      read: false,
      createdAt: pendingRequest.createdAt,
    });
  });
});

test("Admin can persist read state for pending HOD notifications", async () => {
  await withStubs([
    [Admin, "findOne", () => adminQuery()],
    [HODRequest, "find", (filter) => {
      assert.deepEqual(filter, { status: "PENDING" });
      return {
        select() { return this; },
        lean: async () => [{ _id: requestId }],
      };
    }],
    [Notification, "updateMany", async (filter, update) => {
      assert.deepEqual(filter, {
        recipient: adminId,
        recipientModel: "Admin",
        sourceRequest: { $in: [requestId] },
        isRead: false,
      });
      assert.deepEqual(update, { $set: { isRead: true } });
      return { modifiedCount: 1 };
    }],
  ], async () => {
    const result = await invoke(markAdminNotificationsRead, {
      user: { userId: adminId },
    });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.modifiedCount, 1);
  });
});

test("marking notifications read does not issue an empty bulk update", async () => {
  await withStubs([
    [Admin, "findOne", () => adminQuery()],
    [HODRequest, "find", () => ({
      select() { return this; },
      lean: async () => [],
    })],
    [Notification, "updateMany", async () => {
      assert.fail("No notification records should be updated.");
    }],
  ], async () => {
    const result = await invoke(markAdminNotificationsRead, {
      user: { userId: adminId },
    });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.modifiedCount, 0);
  });
});
