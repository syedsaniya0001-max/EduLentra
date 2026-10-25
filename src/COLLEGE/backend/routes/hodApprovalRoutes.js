const express = require("express");

const {
  getPendingHODRequests,
  approveHODRequest,
  rejectHODRequest,
} = require("../controllers/hodApprovalController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const requireActiveReviewer = require("../middleware/requireActiveReviewer");

const router = express.Router();

router.get(
  "/requests",
  protect,
  authorizeRoles("admin"),
  requireActiveReviewer("admin"),
  getPendingHODRequests
);

router.put(
  "/requests/:id/approve",
  protect,
  authorizeRoles("admin"),
  requireActiveReviewer("admin"),
  approveHODRequest
);

router.put(
  "/requests/:id/reject",
  protect,
  authorizeRoles("admin"),
  requireActiveReviewer("admin"),
  rejectHODRequest
);

module.exports = router;