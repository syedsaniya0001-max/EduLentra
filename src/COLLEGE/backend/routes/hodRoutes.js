const express = require("express");

const {
  signupHOD,
} = require("../controllers/hodController");
const { getHODDirectory } = require("../controllers/accountDirectoryController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const requireActiveReviewer = require("../middleware/requireActiveReviewer");

const router = express.Router();

router.post("/signup", signupHOD);

router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  requireActiveReviewer("admin"),
  getHODDirectory
);

module.exports = router;