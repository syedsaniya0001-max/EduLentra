const Admin = require("../models/Admin");
const Faculty = require("../models/Faculty");
const HOD = require("../models/HOD");

const reviewerModels = {
  admin: Admin,
  faculty: Faculty,
  hod: HOD,
};

const requireActiveAccount = async (req, res, next) => {
  const role = req.user?.role;
  const Reviewer = reviewerModels[role];
  if (!Reviewer) {
    return res.status(403).json({ message: "Access denied." });
  }

  try {
    const reviewer = await Reviewer.findOne({
      _id: req.user.userId,
      isActive: true,
    }).select(
      role === "faculty"
        ? "_id department branch"
        : role === "hod"
          ? "_id department"
          : "_id"
    );

    if (!reviewer) {
      return res.status(403).json({
        message: "An active account is required to access this resource.",
      });
    }

    if (
      role === "admin" &&
      (await Admin.countDocuments({ isActive: true })) !== 1
    ) {
      return res.status(503).json({
        message: "Admin approval is unavailable until exactly one active Admin account is configured.",
      });
    }

    req.reviewer = reviewer;
    return next();
  } catch (error) {
    console.error("Approval reviewer verification failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to verify reviewer permissions. Please try again later.",
    });
  }
};

const requireActiveReviewer = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json({ message: "Access denied." });
  }
  return requireActiveAccount(req, res, next);
};

module.exports = requireActiveReviewer;
module.exports.requireActiveAccount = requireActiveAccount;
