const mongoose = require("mongoose");
const Admin = require("../models/Admin");
const Placement = require("../models/Placement");
const Student = require("../models/Student");

const validDate = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)) &&
  new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;

const normalizeApplyLink = (value) => {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
};

const getPlacements = async (req, res) => {
  try {
    let filter = { isActive: true };
    if (req.user.role === "student") {
      const student = await Student.findOne({
        _id: req.user.userId,
        isActive: true,
      }).select("_id branch");
      if (!student) {
        return res.status(403).json({ message: "An active student account is required." });
      }
      filter.branch = { $in: ["All", student.branch] };
      filter.applicationDeadline = { $gte: new Date() };
    } else if (req.user.role === "admin") {
      const admin = await Admin.findOne({
        _id: req.user.userId,
        isActive: true,
      }).select("_id");
      if (!admin) {
        return res.status(403).json({ message: "An active Admin account is required." });
      }
    } else {
      return res.status(403).json({ message: "Access denied." });
    }

    const placements = await Placement.find(filter)
      .sort({ applicationDeadline: 1, createdAt: -1 })
      .lean();
    return res.status(200).json({ placements });
  } catch (error) {
    console.error("Placement lookup failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to load placement opportunities." });
  }
};

const createPlacement = async (req, res) => {
  const {
    company,
    role,
    branch,
    location,
    package: salaryPackage,
    deadline,
    description,
    eligibility,
    applyLink: rawApplyLink,
  } = req.body || {};
  const companyName = typeof company === "string" ? company.trim() : "";
  const jobRole = typeof role === "string" ? role.trim() : "";
  const targetBranch = typeof branch === "string" ? branch.trim() : "";
  const jobLocation = typeof location === "string" ? location.trim() : "";
  const packageValue = typeof salaryPackage === "string" ? salaryPackage.trim() : "";
  const details = typeof description === "string" ? description.trim() : "";
  const eligibilityValue = typeof eligibility === "string" ? eligibility.trim() : "";
  const applyLink = normalizeApplyLink(rawApplyLink);

  if (
    !companyName ||
    companyName.length > 160 ||
    !jobRole ||
    jobRole.length > 160 ||
    !targetBranch ||
    targetBranch.length > 100 ||
    !jobLocation ||
    jobLocation.length > 160 ||
    packageValue.length > 100 ||
    !validDate(deadline) ||
    !details ||
    details.length > 5000 ||
    eligibilityValue.length > 1000 ||
    applyLink === null
  ) {
    return res.status(400).json({
      message: "Enter valid placement details and an HTTP/HTTPS application link.",
    });
  }

  try {
    const admin = await Admin.findOne({
      _id: req.user.userId,
      isActive: true,
    }).select("_id");
    if (!admin) {
      return res.status(403).json({ message: "An active Admin account is required." });
    }

    const placement = await Placement.create({
      companyName,
      jobRole,
      branch: targetBranch,
      description: details,
      eligibility: eligibilityValue,
      package: packageValue,
      location: jobLocation,
      applicationDeadline: new Date(`${deadline}T23:59:59.999Z`),
      applyLink,
      createdBy: admin._id,
    });
    return res.status(201).json({
      message: "Placement published successfully.",
      placement,
    });
  } catch (error) {
    console.error("Placement creation failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to publish this placement." });
  }
};

const deletePlacement = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid placement." });
  }

  try {
    const admin = await Admin.findOne({
      _id: req.user.userId,
      isActive: true,
    }).select("_id");
    if (!admin) {
      return res.status(403).json({ message: "An active Admin account is required." });
    }
    const placement = await Placement.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );
    if (!placement) {
      return res.status(404).json({ message: "Placement not found." });
    }
    return res.status(200).json({ message: "Placement removed." });
  } catch (error) {
    console.error("Placement deletion failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to remove this placement." });
  }
};

module.exports = {
  getPlacements,
  createPlacement,
  deletePlacement,
  validDate,
};
