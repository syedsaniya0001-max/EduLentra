const express = require("express");
const { authorizeRoles, protect } = require("../middleware/authMiddleware");
const requireActiveReviewer = require("../middleware/requireActiveReviewer");
const {
  getEvents,
  createEvent,
  deleteEvent,
} = require("../controllers/eventController");

const router = express.Router();

router.use(protect);
router.get("/", authorizeRoles("admin", "student"), getEvents);
router.post(
  "/",
  authorizeRoles("admin"),
  requireActiveReviewer("admin"),
  createEvent
);
router.delete(
  "/:id",
  authorizeRoles("admin"),
  requireActiveReviewer("admin"),
  deleteEvent
);

module.exports = router;
