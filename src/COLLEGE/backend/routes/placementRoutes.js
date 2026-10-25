const express = require("express");
const { authorizeRoles, protect } = require("../middleware/authMiddleware");
const requireActiveReviewer = require("../middleware/requireActiveReviewer");
const {
  getPlacements,
  createPlacement,
  deletePlacement,
} = require("../controllers/placementController");

const router = express.Router();

router.use(protect);
router.get("/", authorizeRoles("admin", "student"), getPlacements);
router.post(
  "/",
  authorizeRoles("admin"),
  requireActiveReviewer("admin"),
  createPlacement
);
router.delete(
  "/:id",
  authorizeRoles("admin"),
  requireActiveReviewer("admin"),
  deletePlacement
);

module.exports = router;
