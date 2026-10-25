const express = require("express");

const {
  getPendingFacultyRequests,
  approveFacultyRequest,
  rejectFacultyRequest,
} = require("../controllers/facultyApprovalController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const requireActiveReviewer = require("../middleware/requireActiveReviewer");

const router = express.Router();

router.get(
  "/requests",
  protect,
  authorizeRoles("hod"),
  requireActiveReviewer("hod"),
  getPendingFacultyRequests
);

router.put(
  "/requests/:id/approve",
  protect,
  authorizeRoles("hod"),
  requireActiveReviewer("hod"),
  approveFacultyRequest
);

router.put(
  "/requests/:id/reject",
  protect,
  authorizeRoles("hod"),
  requireActiveReviewer("hod"),
  rejectFacultyRequest
);

module.exports = router;