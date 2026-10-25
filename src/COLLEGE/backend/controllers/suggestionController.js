const mongoose = require("mongoose");
const Suggestion = require("../models/Suggestion");
const Student = require("../models/Student");

const createSuggestion = async (req, res) => {
  const { message } = req.body || {};
  const cleanedMessage = typeof message === "string" ? message.trim() : "";

  if (cleanedMessage.length < 5 || cleanedMessage.length > 3000) {
    return res.status(400).json({
      message: "Enter a suggestion between 5 and 3,000 characters.",
    });
  }

  try {
    const student = await Student.findOne({
      _id: req.user.userId,
      isActive: true,
    }).select("_id branch");

    if (!student) {
      return res.status(403).json({
        message: "An active student account is required.",
      });
    }

    const suggestion = await Suggestion.create({
      student: student._id,
      department: student.branch,
      message: cleanedMessage,
    });

    return res.status(201).json({
      message: "Your suggestion has been submitted.",
      suggestion,
    });
  } catch (error) {
    console.error("Suggestion submission failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to submit your suggestion.",
    });
  }
};

const getStudentSuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestion.find({ student: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error("Student suggestion lookup failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to load your suggestions.",
    });
  }
};

const getDepartmentSuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestion.find({
      department: req.reviewer.department,
    })
      .populate("student", "name rollNumber")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error("Department suggestion lookup failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to load department suggestions.",
    });
  }
};

const updateSuggestion = async (req, res) => {
  const { status, response = "" } = req.body || {};
  const validStatuses = ["UNDER_REVIEW", "ACCEPTED", "DECLINED"];

  if (
    !mongoose.isValidObjectId(req.params.id) ||
    !validStatuses.includes(status) ||
    typeof response !== "string" ||
    response.trim().length > 3000
  ) {
    return res.status(400).json({ message: "Enter a valid suggestion review." });
  }

  try {
    const suggestion = await Suggestion.findOne({
      _id: req.params.id,
      department: req.reviewer.department,
    });

    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found." });
    }

    suggestion.status = status;
    suggestion.response = response.trim();
    suggestion.reviewedBy = req.reviewer._id;
    suggestion.reviewedAt = new Date();
    await suggestion.save();

    return res.status(200).json({
      message: "Suggestion review saved.",
      suggestion,
    });
  } catch (error) {
    console.error("Suggestion update failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to update this suggestion.",
    });
  }
};

module.exports = {
  createSuggestion,
  getStudentSuggestions,
  getDepartmentSuggestions,
  updateSuggestion,
};
