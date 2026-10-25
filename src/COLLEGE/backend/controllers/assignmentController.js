const mongoose = require("mongoose");
const Assignment = require("../models/Assignment");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");

const ALL_SECTIONS = "*";
const UNASSIGNED_SECTION = "__unassigned__";

const parseDueDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const date = new Date(`${value}T23:59:59.999Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return null;
  }
  return date;
};

const activeFaculty = async (userId) =>
  Faculty.findOne({ _id: userId, isActive: true }).select(
    "_id name department branch subject"
  );

const sectionMatches = (studentSection) => {
  const normalized = studentSection?.trim() || UNASSIGNED_SECTION;
  return { $in: [normalized, ALL_SECTIONS] };
};

const assignmentStatus = (dueDate) =>
  new Date(dueDate) < new Date() ? "Closed" : "Open";

const normalizeAttachmentUrl = (value) => {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value !== "string" || value.trim().length > 2048) return null;
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
};

const asFacultyAssignment = async (assignment, branchStudents) => {
  const doc = typeof assignment.toObject === "function"
    ? assignment.toObject()
    : assignment;
  const matchingStudents = branchStudents.filter((student) =>
    doc.section === ALL_SECTIONS
      ? true
      : (student.section?.trim() || UNASSIGNED_SECTION) === doc.section
  );
  const submissions = (doc.submissions || []).map((submission) => {
    const student =
      submission.student && typeof submission.student === "object"
        ? submission.student
        : branchStudents.find(
            (candidate) => String(candidate._id) === String(submission.student)
          );
    return {
      ...submission,
      fileUrl: submission.fileUrl || "",
      submissionId: String(submission._id),
      studentName: student?.name || "Student",
      rollNumber: student?.rollNumber || "",
      submittedAt: submission.submittedAt,
      status: submission.gradedAt ? "Graded" : "Submitted",
    };
  });
  return {
    ...doc,
    id: String(doc._id),
    class: `${doc.branch} (${doc.section === ALL_SECTIONS ? "All sections" : doc.section === UNASSIGNED_SECTION ? "Unassigned section" : `Section ${doc.section}`})`,
    dueDate: new Date(doc.dueDate).toISOString().slice(0, 10),
    status: assignmentStatus(doc.dueDate),
    submissions,
    submittedCount: submissions.length,
    totalCount: matchingStudents.length,
  };
};

const getFacultyAssignments = async (req, res) => {
  try {
    const faculty = await activeFaculty(req.user.userId);
    if (!faculty) {
      return res.status(403).json({ message: "An active faculty account is required." });
    }
    const branch = faculty.branch || faculty.department;
    if (!branch?.trim() || !faculty.subject?.trim()) {
      return res.status(409).json({
        message: "Your faculty account needs a branch and subject before assignments can be managed.",
      });
    }

    const [assignments, students] = await Promise.all([
      Assignment.find({ faculty: faculty._id }).sort({ createdAt: -1 }).lean(),
      Student.find({ branch, isActive: true })
        .select("_id name rollNumber section")
        .lean(),
    ]);
    const sections = [...new Set(
      students.map((student) =>
        student.section?.trim() || UNASSIGNED_SECTION
      )
    )].sort();

    return res.status(200).json({
      branch,
      subject: faculty.subject,
      sections,
      assignments: await Promise.all(
        assignments.map((assignment) => asFacultyAssignment(assignment, students))
      ),
    });
  } catch (error) {
    console.error("Faculty assignment lookup failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to load assignments." });
  }
};

const createAssignment = async (req, res) => {
  const { title, description, dueDate: rawDueDate, maxMarks, section } =
    req.body || {};
  const cleanedTitle = typeof title === "string" ? title.trim() : "";
  const cleanedDescription =
    typeof description === "string" ? description.trim() : "";
  const cleanedSection = typeof section === "string" ? section.trim() : "";
  const dueDate = parseDueDate(rawDueDate);
  const marks = Number(maxMarks);

  if (
    !cleanedTitle ||
    cleanedTitle.length > 160 ||
    cleanedDescription.length > 5000 ||
    !cleanedSection ||
    cleanedSection.length > 100 ||
    !dueDate ||
    !Number.isInteger(marks) ||
    marks < 1 ||
    marks > 1000
  ) {
    return res.status(400).json({
      message: "Enter a valid title, section, due date, and maximum marks.",
    });
  }

  try {
    const faculty = await activeFaculty(req.user.userId);
    if (!faculty) {
      return res.status(403).json({ message: "An active faculty account is required." });
    }
    const branch = faculty.branch || faculty.department;
    if (!branch?.trim() || !faculty.subject?.trim()) {
      return res.status(409).json({
        message: "Your faculty account needs a branch and subject before assignments can be managed.",
      });
    }

    const sectionFilter =
      cleanedSection === UNASSIGNED_SECTION
        ? { $or: [{ section: "" }, { section: { $exists: false } }] }
        : cleanedSection === ALL_SECTIONS
          ? {}
          : { section: cleanedSection };
    const studentCount = await Student.countDocuments({
      branch,
      isActive: true,
      ...sectionFilter,
    });
    if (!studentCount) {
      return res.status(400).json({
        message: "There are no active students in the selected section.",
      });
    }

    const assignment = await Assignment.create({
      faculty: faculty._id,
      branch,
      subject: faculty.subject,
      section: cleanedSection,
      title: cleanedTitle,
      description: cleanedDescription,
      dueDate,
      maxMarks: marks,
    });
    return res.status(201).json({
      message: "Assignment published successfully.",
      assignment: await asFacultyAssignment(
        assignment,
        await Student.find({ branch, isActive: true })
          .select("_id name rollNumber section")
          .lean()
      ),
    });
  } catch (error) {
    console.error("Assignment creation failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to publish assignment." });
  }
};

const gradeAssignmentSubmission = async (req, res) => {
  const { marks: rawMarks, feedback } = req.body || {};
  const marks = Number(rawMarks);
  const cleanedFeedback = typeof feedback === "string" ? feedback.trim() : "";

  if (
    !mongoose.isValidObjectId(req.params.assignmentId) ||
    !mongoose.isValidObjectId(req.params.submissionId) ||
    !Number.isFinite(marks) ||
    marks < 0 ||
    cleanedFeedback.length > 2000
  ) {
    return res.status(400).json({ message: "Enter a valid grade and feedback." });
  }

  try {
    const faculty = await activeFaculty(req.user.userId);
    if (!faculty) {
      return res.status(403).json({ message: "An active faculty account is required." });
    }
    const assignment = await Assignment.findOne({
      _id: req.params.assignmentId,
      faculty: faculty._id,
    });
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }
    if (marks > assignment.maxMarks) {
      return res.status(400).json({
        message: `Marks cannot exceed ${assignment.maxMarks}.`,
      });
    }
    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found." });
    }

    submission.marks = marks;
    submission.feedback = cleanedFeedback;
    submission.gradedAt = new Date();
    await assignment.save();
    return res.status(200).json({
      message: "Submission graded successfully.",
      submission,
    });
  } catch (error) {
    console.error("Assignment grading failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to grade this submission." });
  }
};

const getStudentAssignments = async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.user.userId,
      isActive: true,
    }).select("_id name rollNumber branch section");
    if (!student) {
      return res.status(403).json({ message: "An active student account is required." });
    }

    const section = student.section?.trim() || UNASSIGNED_SECTION;
    const assignments = await Assignment.find({
      branch: student.branch,
      section: sectionMatches(section),
    })
      .sort({ dueDate: -1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      assignments: assignments.map((assignment) => {
        const submission = assignment.submissions.find(
          (item) => String(item.student) === String(student._id)
        );
        return {
          id: String(assignment._id),
          title: assignment.title,
          description: assignment.description,
          subject: assignment.subject,
          branch: assignment.branch,
          section: assignment.section,
          dueDate: assignment.dueDate,
          maxMarks: assignment.maxMarks,
          status: assignmentStatus(assignment.dueDate),
          submission: submission
            ? {
                answer: submission.answer,
                fileUrl: submission.fileUrl || "",
                submittedAt: submission.submittedAt,
                isLate: submission.isLate,
                marks: submission.marks,
                feedback: submission.feedback,
                gradedAt: submission.gradedAt,
              }
            : null,
        };
      }),
    });
  } catch (error) {
    console.error("Student assignment lookup failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to load your assignments." });
  }
};

const submitAssignment = async (req, res) => {
  const answer = typeof req.body?.answer === "string" ? req.body.answer.trim() : "";
  const fileUrl = normalizeAttachmentUrl(req.body?.fileUrl);
  if (
    !mongoose.isValidObjectId(req.params.assignmentId) ||
    answer.length < 1 ||
    answer.length > 10000 ||
    fileUrl === null
  ) {
    return res.status(400).json({
      message: "Enter a valid assignment response and an HTTP/HTTPS attachment link.",
    });
  }

  try {
    const student = await Student.findOne({
      _id: req.user.userId,
      isActive: true,
    }).select("_id branch section");
    if (!student) {
      return res.status(403).json({ message: "An active student account is required." });
    }
    const section = student.section?.trim() || UNASSIGNED_SECTION;
    const assignment = await Assignment.findOne({
      _id: req.params.assignmentId,
      branch: student.branch,
      section: sectionMatches(section),
    });
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found for your section." });
    }
    const existing = assignment.submissions.find(
      (item) => String(item.student) === String(student._id)
    );
    if (existing?.gradedAt) {
      return res.status(409).json({
        message: "This submission has already been graded and can no longer be changed.",
      });
    }

    const submittedAt = new Date();
    if (existing) {
      existing.answer = answer;
      existing.fileUrl = fileUrl;
      existing.submittedAt = submittedAt;
      existing.isLate = submittedAt > assignment.dueDate;
    } else {
      assignment.submissions.push({
        student: student._id,
        answer,
        fileUrl,
        submittedAt,
        isLate: submittedAt > assignment.dueDate,
      });
    }
    await assignment.save();

    return res.status(200).json({
      message: "Assignment submitted successfully.",
      submission: {
        answer,
        fileUrl,
        submittedAt,
        isLate: submittedAt > assignment.dueDate,
      },
    });
  } catch (error) {
    console.error("Assignment submission failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to submit this assignment." });
  }
};

module.exports = {
  getFacultyAssignments,
  createAssignment,
  gradeAssignmentSubmission,
  getStudentAssignments,
  submitAssignment,
};
