const express = require("express");

const {
  signupStudent,
} = require("../controllers/studentController");
const { getStudentDirectory } = require("../controllers/accountDirectoryController");

const {
  getPendingStudentRequests,
  approveStudentRequest,
  rejectStudentRequest,
} = require("../controllers/studentApprovalController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const requireActiveReviewer = require("../middleware/requireActiveReviewer");
const { requireActiveAccount } = require("../middleware/requireActiveReviewer");

const router = express.Router();

// Public student signup
router.post("/signup", signupStudent);

router.get(
  "/",
  protect,
  authorizeRoles("faculty", "hod", "admin"),
  requireActiveAccount,
  getStudentDirectory
);

// Faculty-only student approval
router.get(
  "/requests",
  protect,
  authorizeRoles("faculty"),
  requireActiveReviewer("faculty"),
  getPendingStudentRequests
);

router.put(
  "/requests/:id/approve",
  protect,
  authorizeRoles("faculty"),
  requireActiveReviewer("faculty"),
  approveStudentRequest
);

router.put(
  "/requests/:id/reject",
  protect,
  authorizeRoles("faculty"),
  requireActiveReviewer("faculty"),
  rejectStudentRequest
);

module.exports = router;