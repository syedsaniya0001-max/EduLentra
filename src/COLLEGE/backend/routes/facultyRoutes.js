const express = require("express");

const {
  signupFaculty,
} = require("../controllers/facultyController");
const { getFacultyDirectory } = require("../controllers/accountDirectoryController");
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

module.exports = router;