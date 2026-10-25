const express = require("express");

const {
  signupFaculty,
} = require("../controllers/facultyController");
const { getFacultyDirectory } = require("../controllers/accountDirectoryController");
const {
  getFacultyOutpassRequests,
  updateOutpassRequest,
} = require("../controllers/outpassController");
const {
  getFacultyAttendance,
  saveFacultyAttendance,
} = require("../controllers/attendanceController");
const {
  getFacultyAssignments,
  createAssignment,
  gradeAssignmentSubmission,
} = require("../controllers/assignmentController");
const {
  getFacultyMaterials,
  createStudyMaterial,
  deleteStudyMaterial,
} = require("../controllers/studyMaterialController");
const { getFacultyDashboard } = require("../controllers/facultyDashboardController");
const {
  changeFacultyPassword,
  getFacultyProfile,
  updateFacultyProfile,
} = require("../controllers/facultyAccountController");
const {
  getFacultyTimetable,
  createFacultyTimetableEntry,
  updateFacultyTimetableEntry,
  deleteFacultyTimetableEntry,
} = require("../controllers/facultyTimetableController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const requireActiveReviewer = require("../middleware/requireActiveReviewer");

const router = express.Router();

// Faculty signup
router.post("/signup", signupFaculty);

router.get(
  "/",
  protect,
  authorizeRoles("hod", "admin"),
  (req, res, next) => {
    requireActiveReviewer(req.user.role)(req, res, next);
  },
  getFacultyDirectory
);

router.get(
  "/dashboard",
  protect,
  authorizeRoles("faculty"),
  requireActiveReviewer("faculty"),
  getFacultyDashboard
);

router.get(
  "/profile",
  protect,
  authorizeRoles("faculty"),
  requireActiveReviewer("faculty"),
  getFacultyProfile
);
router.patch(
  "/profile",
  protect,
  authorizeRoles("faculty"),
  requireActiveReviewer("faculty"),
  updateFacultyProfile
);
router.put(
  "/password",
  protect,
  authorizeRoles("faculty"),
  requireActiveReviewer("faculty"),
  changeFacultyPassword
);

router.get(
  "/timetable",
  protect,
  authorizeRoles("faculty"),
  requireActiveReviewer("faculty"),
  getFacultyTimetable
);
router.post(
  "/timetable",
  protect,
  authorizeRoles("faculty"),
  requireActiveReviewer("faculty"),
  createFacultyTimetableEntry
);
router.patch(
  "/timetable/:entryId",
  protect,
  authorizeRoles("faculty"),
  requireActiveReviewer("faculty"),
  updateFacultyTimetableEntry
);
router.delete(
  "/timetable/:entryId",
  protect,
  authorizeRoles("faculty"),
  requireActiveReviewer("faculty"),
  deleteFacultyTimetableEntry
);

router.get("/outpasses", protect, authorizeRoles("faculty"), getFacultyOutpassRequests);
router.patch("/outpasses/:id", protect, authorizeRoles("faculty"), updateOutpassRequest);
router.get("/attendance", protect, authorizeRoles("faculty"), getFacultyAttendance);
router.put("/attendance", protect, authorizeRoles("faculty"), saveFacultyAttendance);
router.get(
  "/assignments",
  protect,
  authorizeRoles("faculty"),
  requireActiveReviewer("faculty"),
  getFacultyAssignments
);
router.post(
  "/assignments",
  protect,
  authorizeRoles("faculty"),
  requireActiveReviewer("faculty"),
  createAssignment
);
router.patch(
  "/assignments/:assignmentId/submissions/:submissionId",
  protect,
  authorizeRoles("faculty"),
  requireActiveReviewer("faculty"),
  gradeAssignmentSubmission
);
router.get(
  "/materials",
  protect,
  authorizeRoles("faculty"),
  requireActiveReviewer("faculty"),
  getFacultyMaterials
);
router.post(
  "/materials",
  protect,
  authorizeRoles("faculty"),
  requireActiveReviewer("faculty"),
  createStudyMaterial
);
router.delete(
  "/materials/:materialId",
  protect,
  authorizeRoles("faculty"),
  requireActiveReviewer("faculty"),
  deleteStudyMaterial
);

module.exports = router;