const mongoose = require("mongoose");
const Complaint = require("../models/Complaint");
const Student = require("../models/Student");

const createComplaint = async (req, res) => {
  const { subject, description } = req.body || {};

  if (
    typeof subject !== "string" ||
    !subject.trim() ||
    subject.trim().length > 120 ||
    typeof description !== "string" ||
    !description.trim() ||
    description.trim().length > 3000
  ) {
    return res.status(400).json({
      message: "Enter a subject and complaint details (up to 3,000 characters).",
    });
  }

  try {
    const student = await Student.findOne({
      _id: req.user.userId,
      isActive: true,
    }).select("_id branch");
    if (!student) {
      return res.status(403).json({ message: "An active student account is required." });
    }

    const complaint = await Complaint.create({
      student: student._id,
      department: student.branch,
      subject: subject.trim(),
      description: description.trim(),
    });

    return res.status(201).json({
      message: "Your complaint has been submitted.",
      complaint,
    });
  } catch (error) {
    console.error("Complaint submission failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to submit your complaint." });
  }
};

const getStudentComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ student: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ complaints });
  } catch (error) {
    console.error("Student complaint lookup failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to load your complaints." });
  }
};

const getDepartmentComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      department: req.reviewer.department,
    })
      .populate("student", "name rollNumber")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ complaints });
  } catch (error) {
    console.error("Department complaint lookup failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to load department complaints." });
  }
};

const updateComplaint = async (req, res) => {
  const { status, response = "" } = req.body || {};
  if (
    !mongoose.isValidObjectId(req.params.id) ||
    !["UNDER_REVIEW", "RESOLVED"].includes(status) ||
    typeof response !== "string" ||
    response.trim().length > 3000
  ) {
    return res.status(400).json({ message: "Enter a valid complaint update." });
  }

  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      department: req.reviewer.department,
    });
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    complaint.status = status;
    complaint.response = response.trim();
    complaint.reviewedBy = req.reviewer._id;
    complaint.reviewedAt = new Date();
    await complaint.save();

    return res.status(200).json({
      message: "Complaint updated.",
      complaint,
    });
  } catch (error) {
    console.error("Complaint update failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to update this complaint." });
  }
};

module.exports = {
  createComplaint,
  getDepartmentComplaints,
  getStudentComplaints,
  updateComplaint,
};
