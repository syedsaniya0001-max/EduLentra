const { test } = require("node:test");
const assert = require("node:assert/strict");

const Admin = require("../models/Admin");
const Event = require("../models/Event");
const Student = require("../models/Student");
const { getEvents, createEvent, deleteEvent } = require("../controllers/eventController");

const methods = [
  [Admin, "findOne"],
  [Event, "find"],
  [Event, "create"],
  [Event, "findByIdAndUpdate"],
  [Student, "findOne"],
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
const studentId = "65f0c0a12345678901234568";
const eventId = "65f0c0a12345678901234569";

test("students see only upcoming active campus events", async () => {
  await withStubs([
    [Student, "findOne", (filter) => {
      assert.deepEqual(filter, { _id: studentId, isActive: true });
      return { select: async () => ({ _id: studentId }) };
    }],
    [Event, "find", (filter) => {
      assert.equal(filter.isActive, true);
      assert.ok(filter.date.$gte instanceof Date);
      return {
        sort() { return this; },
        lean: async () => [{
          _id: eventId,
          title: "Science Fair",
          category: "Academic",
          date: new Date("2026-11-15T00:00:00.000Z"),
          venue: "Main Hall",
          description: "Campus science fair",
        }],
      };
    }],
  ], async () => {
    const result = await invoke(getEvents, {
      user: { role: "student", userId: studentId },
    });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.events[0].id, eventId);
    assert.equal(result.body.events[0].location, "Main Hall");
    assert.equal(result.body.events[0].date, "2026-11-15");
  });
});

test("Admin publishes a validated event to MongoDB", async () => {
  let created;
  await withStubs([
    [Admin, "findOne", (filter) => {
      assert.deepEqual(filter, { _id: adminId, isActive: true });
      return { select: async () => ({ _id: adminId }) };
    }],
    [Event, "create", async (values) => {
      created = values;
      return { ...values, _id: eventId };
    }],
  ], async () => {
    const result = await invoke(createEvent, {
      user: { userId: adminId },
      body: {
        title: "Science Fair",
        category: "Academic",
        date: "2026-11-15",
        location: "Main Hall",
        description: "Campus science fair",
      },
    });
    assert.equal(result.statusCode, 201);
    assert.equal(created.createdBy, adminId);
    assert.equal(created.venue, "Main Hall");
    assert.equal(created.date.toISOString(), "2026-11-15T00:00:00.000Z");
    assert.equal(result.body.event.id, eventId);
  });
});

test("event creation rejects invalid dates and categories", async () => {
  const result = await invoke(createEvent, {
    user: { userId: adminId },
    body: {
      title: "Invalid event",
      category: "Unrecognized",
      date: "2026-02-30",
      location: "Main Hall",
      description: "Details",
    },
  });
  assert.equal(result.statusCode, 400);
});

test("Admin removes an event by marking it inactive", async () => {
  await withStubs([
    [Admin, "findOne", () => ({ select: async () => ({ _id: adminId }) })],
    [Event, "findByIdAndUpdate", async (id, update) => {
      assert.equal(id, eventId);
      assert.deepEqual(update, { $set: { isActive: false } });
      return { _id: id, isActive: false };
    }],
  ], async () => {
    const result = await invoke(deleteEvent, {
      user: { userId: adminId },
      params: { id: eventId },
    });
    assert.equal(result.statusCode, 200);
  });
});
