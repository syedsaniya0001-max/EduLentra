const mongoose = require("mongoose");
const OutpassRequest = require("../models/OutpassRequest");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");

const normalizeDate = (value) => {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const createOutpassRequest = async (req, res) => {
  const { reason, destination, fromDate, toDate } = req.body || {};
  const cleanedReason = typeof reason === "string" ? reason.trim() : "";
  const cleanedDestination = typeof destination === "string" ? destination.trim() : "";
  const startDate = normalizeDate(fromDate);
  const endDate = normalizeDate(toDate);

  if (
    cleanedReason.length < 5 ||
    cleanedReason.length > 500 ||
    cleanedDestination.length < 3 ||
    cleanedDestination.length > 200 ||
    !startDate ||
    !endDate ||
    startDate > endDate
  ) {
    return res.status(400).json({
      message: "Enter a valid reason, destination, and outpass date range.",
    });
  }

  try {
    const student = await Student.findOne({
      _id: req.user.userId,
      isActive: true,
    }).select("_id name rollNumber branch");

    if (!student) {
      return res.status(403).json({
        message: "An active student account is required.",
      });
    }

    const outpass = await OutpassRequest.create({
      student: student._id,
      reason: cleanedReason,
      destination: cleanedDestination,
      fromDate: startDate,
      toDate: endDate,
    });

    return res.status(201).json({
      message: "Your outpass request has been submitted.",
      outpass,
    });
  } catch (error) {
    console.error("Outpass submission failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to submit your outpass request.",
    });
  }
};

const getStudentOutpassRequests = async (req, res) => {
  try {
    const outpasses = await OutpassRequest.find({ student: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ outpasses });
  } catch (error) {
    console.error("Student outpass lookup failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to load your outpass requests.",
    });
  }
};

const getFacultyOutpassRequests = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({
      _id: req.user.userId,
      isActive: true,
    }).select("_id department branch");
    if (!faculty) {
      return res.status(403).json({
        message: "An active faculty account is required.",
      });
    }

    const branch = faculty.branch || faculty.department;
    const students = branch
      ? await Student.find({ branch, isActive: true }).select("_id")
      : [];
    const studentIds = students.map((student) => student._id);
    const outpasses = studentIds.length
      ? await OutpassRequest.find({ student: { $in: studentIds } })
          .populate("student", "name rollNumber branch section")
          .sort({ createdAt: -1 })
          .lean()
      : [];

    return res.status(200).json({ outpasses });
  } catch (error) {
    console.error("Faculty outpass lookup failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to load outpass requests.",
    });
  }
};

const getHODOutpassRequests = async (req, res) => {
  try {
    const students = await Student.find({
      branch: req.reviewer.department,
      isActive: true,
    }).select("_id");
    const studentIds = students.map((student) => student._id);
    const outpasses = studentIds.length
      ? await OutpassRequest.find({ student: { $in: studentIds } })
          .populate("student", "name rollNumber branch section")
          .sort({ createdAt: -1 })
          .lean()
      : [];

    return res.status(200).json({ outpasses });
  } catch (error) {
    console.error("HOD outpass lookup failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to load department outpass requests.",
    });
  }
};

const updateOutpassRequest = async (req, res) => {
  const { status, remarks } = req.body || {};
  const nextStatus = typeof status === "string" ? status.toUpperCase() : "";
  const comment = typeof remarks === "string" ? remarks.trim() : "";

  if (
    !mongoose.isValidObjectId(req.params.id) ||
    !["APPROVED", "REJECTED"].includes(nextStatus) ||
    comment.length > 1000 ||
    (nextStatus === "REJECTED" && !comment)
  ) {
    return res.status(400).json({
      message: "Enter a valid outpass status.",
    });
  }

  try {
    let reviewerModel;
    let reviewer;
    let outpassFilter = { _id: req.params.id };

    if (req.user.role === "faculty") {
      reviewerModel = "Faculty";
      reviewer = await Faculty.findOne({
        _id: req.user.userId,
        isActive: true,
      }).select("_id name department branch");

      if (!reviewer) {
        return res.status(403).json({
          message: "An active faculty account is required.",
        });
      }

      const branch = reviewer.branch || reviewer.department;
      const branchStudents = branch
        ? await Student.find({ branch, isActive: true }).select("_id")
        : [];
      outpassFilter.student = {
        $in: branchStudents.map((student) => student._id),
      };
    } else if (req.user.role === "hod" && req.reviewer?.department) {
      reviewerModel = "HOD";
      reviewer = req.reviewer;
      const departmentStudents = await Student.find({
        branch: reviewer.department,
        isActive: true,
      }).select("_id");
      outpassFilter.student = {
        $in: departmentStudents.map((student) => student._id),
      };
    } else {
      return res.status(403).json({
        message: "An active faculty or HOD account is required.",
      });
    }

    const outpass = await OutpassRequest.findOne(outpassFilter);

    if (!outpass) {
      return res.status(404).json({
        message: "Outpass request not found.",
      });
    }

    if (outpass.status !== "PENDING") {
      return res.status(409).json({
        message: "This outpass request has already been reviewed.",
      });
    }

    outpass.status = nextStatus;
    outpass.reviewedBy = reviewer._id;
    outpass.reviewedByModel = reviewerModel;
    outpass.reviewedAt = new Date();
    outpass.reviewRemarks = comment;
    outpass.rejectionReason = nextStatus === "REJECTED" ? comment || "Rejected by faculty." : "";
    await outpass.save();

    return res.status(200).json({
      message: nextStatus === "APPROVED" ? "Outpass approved." : "Outpass rejected.",
      outpass,
    });
  } catch (error) {
    console.error("Outpass update failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to update this outpass request.",
    });
  }
};

module.exports = {
  createOutpassRequest,
  getStudentOutpassRequests,
  getFacultyOutpassRequests,
  getHODOutpassRequests,
  updateOutpassRequest,
};
