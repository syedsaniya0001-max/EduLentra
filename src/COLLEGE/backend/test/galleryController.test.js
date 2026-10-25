const { test } = require("node:test");
const assert = require("node:assert/strict");

const Admin = require("../models/Admin");
const Gallery = require("../models/Gallery");
const Student = require("../models/Student");
const {
  getGalleryPosts,
  createGalleryPost,
  deleteGalleryPost,
} = require("../controllers/galleryController");

const methods = [
  [Admin, "findOne"],
  [Gallery, "find"],
  [Gallery, "create"],
  [Gallery, "findByIdAndUpdate"],
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
const postId = "65f0c0a12345678901234569";

test("active students see active gallery posts with normalized display fields", async () => {
  await withStubs([
    [Student, "findOne", (filter) => {
      assert.deepEqual(filter, { _id: studentId, isActive: true });
      return { select: async () => ({ _id: studentId }) };
    }],
    [Gallery, "find", (filter) => {
      assert.deepEqual(filter, { isActive: true });
      return {
        sort() { return this; },
        lean: async () => [{
          _id: postId,
          title: "Robotics team wins",
          category: "Achievement",
          date: new Date("2026-10-20T00:00:00.000Z"),
          description: "First place",
          image: "https://example.edu/win.jpg",
        }],
      };
    }],
  ], async () => {
    const result = await invoke(getGalleryPosts, {
      user: { role: "student", userId: studentId },
    });
    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.body.posts[0], {
      id: postId,
      title: "Robotics team wins",
      category: "Achievement",
      date: "2026-10-20",
      description: "First place",
      imageUrl: "https://example.edu/win.jpg",
    });
  });
});

test("Admin publishes a validated achievement and optional HTTP image URL", async () => {
  let created;
  await withStubs([
    [Admin, "findOne", (filter) => {
      assert.deepEqual(filter, { _id: adminId, isActive: true });
      return { select: async () => ({ _id: adminId }) };
    }],
    [Gallery, "create", async (values) => {
      created = values;
      return { ...values, _id: postId };
    }],
  ], async () => {
    const result = await invoke(createGalleryPost, {
      user: { userId: adminId },
      body: {
        title: "Robotics team wins",
        category: "Achievement",
        date: "2026-10-20",
        description: "First place",
        imageUrl: "https://example.edu/win.jpg",
      },
    });
    assert.equal(result.statusCode, 201);
    assert.equal(created.uploadedBy, adminId);
    assert.equal(created.uploadedByModel, "Admin");
    assert.equal(created.image, "https://example.edu/win.jpg");
    assert.equal(created.date.toISOString(), "2026-10-20T00:00:00.000Z");
    assert.equal(result.body.post.id, postId);
  });
});

test("gallery creation rejects invalid fields and non-web image URLs", async () => {
  const result = await invoke(createGalleryPost, {
    user: { userId: adminId },
    body: {
      title: "Invalid post",
      category: "Achievement",
      date: "2026-02-30",
      description: "Details",
      imageUrl: "javascript:alert(1)",
    },
  });
  assert.equal(result.statusCode, 400);
});

test("Admin removes a gallery post by marking it inactive", async () => {
  await withStubs([
    [Admin, "findOne", () => ({ select: async () => ({ _id: adminId }) })],
    [Gallery, "findByIdAndUpdate", async (id, update) => {
      assert.equal(id, postId);
      assert.deepEqual(update, { $set: { isActive: false } });
      return { _id: id, isActive: false };
    }],
  ], async () => {
    const result = await invoke(deleteGalleryPost, {
      user: { userId: adminId },
      params: { id: postId },
    });
    assert.equal(result.statusCode, 200);
  });
});
