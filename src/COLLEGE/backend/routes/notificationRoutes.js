const express = require("express");
const { authorizeRoles, protect } = require("../middleware/authMiddleware");
const {
  getAdminNotifications,
  markAdminNotificationsRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.use(protect, authorizeRoles("admin"));
router.get("/", getAdminNotifications);
router.patch("/read", markAdminNotificationsRead);

module.exports = router;
