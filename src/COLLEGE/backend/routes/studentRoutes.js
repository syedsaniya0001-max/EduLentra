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
  createComplaint,
  getStudentComplaints,
} = require("../controllers/complaintController");
const {
  createOutpassRequest,
  getStudentOutpassRequests,
} = require("../controllers/outpassController");
const {
  createSuggestion,
  getStudentSuggestions,
} = require("../controllers/suggestionController");
const { getStudentProfile } = require("../controllers/studentProfileController");
const { getStudentAttendance } = require("../controllers/attendanceController");
const {
  getStudentAssignments,
  submitAssignment,
} = require("../controllers/assignmentController");
const { getStudentMaterials } = require("../controllers/studyMaterialController");
const {
  getStudentTasks,
  createStudentTask,
  setStudentTaskCompletion,
  deleteStudentTask,
} = require("../controllers/studentTaskController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const requireActiveReviewer = require("../middleware/requireActiveReviewer");
const { requireActiveAccount } = require("../middleware/requireActiveReviewer");

const router = express.Router();

// Public student signup
router.post("/signup", signupStudent);

router.post("/complaints", protect, authorizeRoles("student"), createComplaint);
router.get("/complaints", protect, authorizeRoles("student"), getStudentComplaints);
router.post("/outpasses", protect, authorizeRoles("student"), createOutpassRequest);
router.get("/outpasses", protect, authorizeRoles("student"), getStudentOutpassRequests);
router.post("/suggestions", protect, authorizeRoles("student"), createSuggestion);
router.get("/suggestions", protect, authorizeRoles("student"), getStudentSuggestions);
router.get("/me", protect, authorizeRoles("student"), getStudentProfile);
router.get("/attendance", protect, authorizeRoles("student"), getStudentAttendance);
router.get("/assignments", protect, authorizeRoles("student"), getStudentAssignments);
router.post(
  "/assignments/:assignmentId/submissions",
  protect,
  authorizeRoles("student"),
  submitAssignment
);
router.get("/materials", protect, authorizeRoles("student"), getStudentMaterials);
router.get("/tasks", protect, authorizeRoles("student"), getStudentTasks);
router.post("/tasks", protect, authorizeRoles("student"), createStudentTask);
router.patch(
  "/tasks/:taskId/completion",
  protect,
  authorizeRoles("student"),
  setStudentTaskCompletion
);
router.delete("/tasks/:taskId", protect, authorizeRoles("student"), deleteStudentTask);

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