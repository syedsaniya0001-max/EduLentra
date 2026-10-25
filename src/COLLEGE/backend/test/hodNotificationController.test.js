const { test } = require("node:test");
const assert = require("node:assert/strict");

const Complaint = require("../models/Complaint");
const FacultyRequest = require("../models/FacultyRequest");
const Notification = require("../models/Notification");
const OutpassRequest = require("../models/OutpassRequest");
const Student = require("../models/Student");
const Suggestion = require("../models/Suggestion");
const {
  getHODNotifications,
  markAllHODNotificationsRead,
  markHODNotificationRead,
} = require("../controllers/hodNotificationController");

const sources = [
  [Complaint, "find"],
  [FacultyRequest, "find"],
  [Notification, "findOneAndUpdate"],
  [Notification, "findOne"],
  [Notification, "updateOne"],
  [Notification, "updateMany"],
  [OutpassRequest, "find"],
  [Student, "find"],
  [Suggestion, "find"],
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
  const saved = sources.map(([model, method]) => [model, method, model[method]]);
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

const hodId = "65f0c0a12345678901234567";
const sourceDate = new Date("2026-10-25T10:00:00.000Z");
const makeQuery = (value) => ({
  select() { return this; },
  populate() { return this; },
  sort() { return this; },
  limit() { return this; },
  lean: async () => value,
});

test("HOD notifications are built from pending items in the active department", async () => {
  const records = [
    {
      sourceModel: "FacultyRequest",
      sourceId: "65f0c0a12345678901234568",
      title: "Faculty approval request",
      message: "Taylor Faculty (FAC-1) is awaiting approval.",
    },
    {
      sourceModel: "Complaint",
      sourceId: "65f0c0a12345678901234569",
      title: "Student complaint",
      message: "Maya Student submitted: Lab access.",
    },
    {
      sourceModel: "Suggestion",
      sourceId: "65f0c0a12345678901234570",
      title: "Student suggestion",
      message: "Noah Student submitted a suggestion: Extend lab hours.",
    },
    {
      sourceModel: "OutpassRequest",
      sourceId: "65f0c0a12345678901234571",
      title: "Outpass approval request",
      message: "Maya Student requested an outpass: Medical appointment.",
    },
  ];

  await withStubs([
    [Student, "find", (filter) => {
      assert.deepEqual(filter, { branch: "CSE-AI", isActive: true });
      return makeQuery([{ _id: "student-1" }]);
    }],
    [FacultyRequest, "find", (filter) => {
      assert.deepEqual(filter, { department: "CSE-AI", status: "PENDING" });
      return makeQuery([{
        _id: records[0].sourceId,
        name: "Taylor Faculty",
        facultyId: "FAC-1",
        createdAt: sourceDate,
      }]);
    }],
    [Complaint, "find", (filter) => {
      assert.deepEqual(filter, {
        department: "CSE-AI",
        status: { $in: ["PENDING", "UNDER_REVIEW"] },
      });
      return makeQuery([{
        _id: records[1].sourceId,
        subject: "Lab access",
        student: { name: "Maya Student" },
        createdAt: sourceDate,
      }]);
    }],
    [Suggestion, "find", (filter) => {
      assert.deepEqual(filter, {
        department: "CSE-AI",
        status: { $in: ["SUBMITTED", "UNDER_REVIEW"] },
      });
      return makeQuery([{
        _id: records[2].sourceId,
        message: "Extend lab hours",
        student: { name: "Noah Student" },
        createdAt: sourceDate,
      }]);
    }],
    [OutpassRequest, "find", (filter) => {
      assert.deepEqual(filter, {
        student: { $in: ["student-1"] },
        status: "PENDING",
      });
      return makeQuery([{
        _id: records[3].sourceId,
        reason: "Medical appointment",
        student: { name: "Maya Student" },
        createdAt: sourceDate,
      }]);
    }],
    [Notification, "findOneAndUpdate", (filter, update, options) => {
      assert.equal(filter.recipient, hodId);
      assert.equal(filter.recipientModel, "HOD");
      assert.equal(update.$setOnInsert.isRead, false);
      assert.equal(options.upsert, true);
      const record = records.find(
        (item) =>
          item.sourceModel === filter.sourceModel &&
          item.sourceId === filter.sourceId
      );
      assert.ok(record);
      return makeQuery({
        _id: `notification-${record.sourceModel}`,
        sourceId: record.sourceId,
        title: record.title,
        message: record.message,
        isRead: false,
        createdAt: sourceDate,
      });
    }],
  ], async () => {
    const result = await invoke(getHODNotifications, {
      reviewer: { _id: hodId, department: "CSE-AI" },
    });

    assert.equal(result.statusCode, 200);
    assert.equal(result.body.notifications.length, 4);
    assert.deepEqual(
      result.body.notifications.map((notification) => notification.target).sort(),
      [
        "/hod/complaints",
        "/hod/faculty-approval",
        "/hod/outpass",
        "/hod/suggestions",
      ]
    );
    assert.ok(result.body.notifications.every((notification) => !notification.read));
  });
});

test("HOD can only mark a notification addressed to their account as read", async () => {
  await withStubs([
    [Notification, "updateOne", async (filter, update) => {
      assert.deepEqual(filter, {
        _id: "65f0c0a12345678901234568",
        recipient: hodId,
        recipientModel: "HOD",
        sourceModel: {
          $in: ["FacultyRequest", "Complaint", "Suggestion", "OutpassRequest"],
        },
      });
      assert.deepEqual(update, { $set: { isRead: true } });
      return { matchedCount: 1 };
    }],
  ], async () => {
    const result = await invoke(markHODNotificationRead, {
      params: { id: "65f0c0a12345678901234568" },
      reviewer: { _id: hodId },
    });
    assert.equal(result.statusCode, 200);
  });
});

test("HOD can mark all of their notifications read without updating other roles", async () => {
  await withStubs([
    [Notification, "updateMany", async (filter, update) => {
      assert.deepEqual(filter, {
        recipient: hodId,
        recipientModel: "HOD",
        sourceModel: {
          $in: ["FacultyRequest", "Complaint", "Suggestion", "OutpassRequest"],
        },
        isRead: false,
      });
      assert.deepEqual(update, { $set: { isRead: true } });
      return { modifiedCount: 3 };
    }],
  ], async () => {
    const result = await invoke(markAllHODNotificationsRead, {
      reviewer: { _id: hodId },
    });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.modifiedCount, 3);
  });
});

test("HOD rejects malformed notification IDs", async () => {
  const result = await invoke(markHODNotificationRead, {
    params: { id: "bad-id" },
    reviewer: { _id: hodId },
  });
  assert.equal(result.statusCode, 400);
});
