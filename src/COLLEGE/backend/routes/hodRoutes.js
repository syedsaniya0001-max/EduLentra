const express = require("express");

const {
  signupHOD,
} = require("../controllers/hodController");
const {
  getDepartmentComplaints,
  updateComplaint,
} = require("../controllers/complaintController");
const {
  getDepartmentSuggestions,
  updateSuggestion,
} = require("../controllers/suggestionController");
const {
  getHODOutpassRequests,
  updateOutpassRequest,
} = require("../controllers/outpassController");
const { getHODDashboard } = require("../controllers/hodDashboardController");
const { getHODDirectory } = require("../controllers/accountDirectoryController");
const { getHODAttendance } = require("../controllers/attendanceController");
const { getHODReportData } = require("../controllers/hodReportController");
const { updateHODProfile } = require("../controllers/hodAccountController");
const {
  getHODNotifications,
  markHODNotificationRead,
  markAllHODNotificationsRead,
} = require("../controllers/hodNotificationController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const requireActiveReviewer = require("../middleware/requireActiveReviewer");

const router = express.Router();

router.post("/signup", signupHOD);

router.patch(
  "/profile",
  protect,
  authorizeRoles("hod"),
  requireActiveReviewer("hod"),
  updateHODProfile
);

router.get(
  "/notifications",
  protect,
  authorizeRoles("hod"),
  requireActiveReviewer("hod"),
  getHODNotifications
);

router.patch(
  "/notifications/read",
  protect,
  authorizeRoles("hod"),
  requireActiveReviewer("hod"),
  markAllHODNotificationsRead
);

router.patch(
  "/notifications/:id/read",
  protect,
  authorizeRoles("hod"),
  requireActiveReviewer("hod"),
  markHODNotificationRead
);

router.get(
  "/outpasses",
  protect,
  authorizeRoles("hod"),
  requireActiveReviewer("hod"),
  getHODOutpassRequests
);

router.patch(
  "/outpasses/:id",
  protect,
  authorizeRoles("hod"),
  requireActiveReviewer("hod"),
  updateOutpassRequest
);

router.get(
  "/dashboard",
  protect,
  authorizeRoles("hod"),
  requireActiveReviewer("hod"),
  getHODDashboard
);

router.get(
  "/attendance",
  protect,
  authorizeRoles("hod"),
  requireActiveReviewer("hod"),
  getHODAttendance
);

router.get(
  "/reports",
  protect,
  authorizeRoles("hod"),
  requireActiveReviewer("hod"),
  getHODReportData
);

router.get(
  "/complaints",
  protect,
  authorizeRoles("hod"),
  requireActiveReviewer("hod"),
  getDepartmentComplaints
);

router.patch(
  "/complaints/:id",
  protect,
  authorizeRoles("hod"),
  requireActiveReviewer("hod"),
  updateComplaint
);

router.get(
  "/suggestions",
  protect,
  authorizeRoles("hod"),
  requireActiveReviewer("hod"),
  getDepartmentSuggestions
);

router.patch(
  "/suggestions/:id",
  protect,
  authorizeRoles("hod"),
  requireActiveReviewer("hod"),
  updateSuggestion
);

router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  requireActiveReviewer("admin"),
  getHODDirectory
);

module.exports = router;