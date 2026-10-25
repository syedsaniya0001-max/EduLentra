const { afterEach, test } = require("node:test");
const assert = require("node:assert/strict");

const Complaint = require("../models/Complaint");
const Student = require("../models/Student");
const {
  createComplaint,
  getDepartmentComplaints,
  getStudentComplaints,
  updateComplaint,
} = require("../controllers/complaintController");

const originalComplaintMethods = {
  create: Complaint.create,
  find: Complaint.find,
  findOne: Complaint.findOne,
};
const originalStudentFindOne = Student.findOne;

const invoke = async (controller, { user, reviewer, body = {}, params = {} }) => {
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

  await controller({ user, reviewer, body, params }, response);
  return { statusCode, body: responseBody };
};

afterEach(() => {
  Complaint.create = originalComplaintMethods.create;
  Complaint.find = originalComplaintMethods.find;
  Complaint.findOne = originalComplaintMethods.findOne;
  Student.findOne = originalStudentFindOne;
});

test("students can submit a validated complaint saved with their account and department", async () => {
  let savedComplaint;
  Student.findOne = () => ({
    select: async () => ({ _id: "student-id", branch: "CSE-AI" }),
  });
  Complaint.create = async (values) => {
    savedComplaint = values;
    return { ...values, _id: "complaint-id", status: "PENDING" };
  };

  const result = await invoke(createComplaint, {
    user: { userId: "student-id", role: "student" },
    body: { subject: "  Lab equipment  ", description: "  Projector is not working.  " },
  });

  assert.equal(result.statusCode, 201);
  assert.equal(savedComplaint.student, "student-id");
  assert.equal(savedComplaint.department, "CSE-AI");
  assert.equal(savedComplaint.subject, "Lab equipment");
  assert.equal(savedComplaint.description, "Projector is not working.");
});

test("complaint submission validates fields and requires an active student", async () => {
  let createCalled = false;
  Complaint.create = async () => { createCalled = true; };

  const invalid = await invoke(createComplaint, {
    user: { userId: "student-id", role: "student" },
    body: { subject: " ", description: "Missing subject" },
  });
  assert.equal(invalid.statusCode, 400);

  Student.findOne = () => ({ select: async () => null });
  const inactive = await invoke(createComplaint, {
    user: { userId: "student-id", role: "student" },
    body: { subject: "Issue", description: "Details" },
  });
  assert.equal(inactive.statusCode, 403);
  assert.equal(createCalled, false);
});

test("students can only list complaints attached to their account", async () => {
  let filter;
  Complaint.find = (query) => {
    filter = query;
    return {
      sort() {
        return this;
      },
      lean: async () => [],
    };
  };

  const result = await invoke(getStudentComplaints, {
    user: { userId: "student-id", role: "student" },
  });
  assert.equal(result.statusCode, 200);
  assert.deepEqual(filter, { student: "student-id" });
  assert.deepEqual(result.body.complaints, []);
});

test("HOD complaint list is restricted to the reviewer's department", async () => {
  let filter;
  Complaint.find = (query) => {
    filter = query;
    return {
      populate() {
        return this;
      },
      sort() {
        return this;
      },
      lean: async () => [],
    };
  };

  const result = await invoke(getDepartmentComplaints, {
    reviewer: { _id: "hod-id", department: "CSE-AI" },
  });
  assert.equal(result.statusCode, 200);
  assert.deepEqual(filter, { department: "CSE-AI" });
});

test("HOD can update a department complaint and its student-visible response", async () => {
  const existingComplaint = {
    _id: "65f0c0a12345678901234567",
    department: "CSE-AI",
    save: async () => {},
  };
  let filter;
  Complaint.findOne = async (query) => {
    filter = query;
    return existingComplaint;
  };

  const result = await invoke(updateComplaint, {
    reviewer: { _id: "hod-id", department: "CSE-AI" },
    params: { id: existingComplaint._id },
    body: { status: "UNDER_REVIEW", response: "  We are investigating.  " },
  });

  assert.equal(result.statusCode, 200);
  assert.deepEqual(filter, {
    _id: existingComplaint._id,
    department: "CSE-AI",
  });
  assert.equal(existingComplaint.status, "UNDER_REVIEW");
  assert.equal(existingComplaint.response, "We are investigating.");
  assert.equal(existingComplaint.reviewedBy, "hod-id");
  assert.ok(existingComplaint.reviewedAt instanceof Date);
});

test("HOD cannot update a complaint outside the department or use an invalid status", async () => {
  let findCalled = false;
  Complaint.findOne = async () => {
    findCalled = true;
    return null;
  };
  const invalidStatus = await invoke(updateComplaint, {
    reviewer: { _id: "hod-id", department: "CSE-AI" },
    params: { id: "65f0c0a12345678901234567" },
    body: { status: "APPROVED", response: "" },
  });
  assert.equal(invalidStatus.statusCode, 400);
  assert.equal(findCalled, false);

  const outsideDepartment = await invoke(updateComplaint, {
    reviewer: { _id: "hod-id", department: "CSE-AI" },
    params: { id: "65f0c0a12345678901234567" },
    body: { status: "RESOLVED", response: "Done" },
  });
  assert.equal(outsideDepartment.statusCode, 404);
});
