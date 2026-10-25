const express = require("express");
const {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  updateAnnouncement,
} = require("../controllers/announcementController");
const { authorizeRoles, protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", authorizeRoles("admin", "hod", "faculty", "student"), getAnnouncements);
router.post("/", authorizeRoles("admin", "hod", "faculty"), createAnnouncement);
router.patch("/:id", authorizeRoles("admin", "hod", "faculty"), updateAnnouncement);
router.delete("/:id", authorizeRoles("admin", "hod", "faculty"), deleteAnnouncement);

module.exports = router;
