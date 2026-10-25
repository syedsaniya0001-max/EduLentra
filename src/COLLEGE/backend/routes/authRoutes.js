const express = require("express");
const { rateLimit } = require("express-rate-limit");

const { login } = require("../controllers/authController");
const {
  requestPasswordReset,
  resetPassword,
} = require("../controllers/passwordResetController");
const {
  updateAdminName,
  updateAdminEmail,
} = require("../controllers/adminAccountController");
const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

const passwordResetRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many reset requests. Please try again in 15 minutes.",
  },
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many reset attempts. Please try again in 15 minutes.",
  },
});

router.post("/login", login);
router.post("/forgot-password", passwordResetRequestLimiter, requestPasswordReset);
router.post("/reset-password", passwordResetLimiter, resetPassword);
router.put("/admin/email", protect, authorizeRoles("admin"), updateAdminEmail);
router.put("/admin/name", protect, authorizeRoles("admin"), updateAdminName);

module.exports = router;