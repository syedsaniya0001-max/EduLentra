const express = require("express");
const { authorizeRoles, protect } = require("../middleware/authMiddleware");
const requireActiveReviewer = require("../middleware/requireActiveReviewer");
const {
  getGalleryPosts,
  createGalleryPost,
  deleteGalleryPost,
} = require("../controllers/galleryController");

const router = express.Router();

router.use(protect);
router.get("/", authorizeRoles("admin", "student"), getGalleryPosts);
router.post(
  "/",
  authorizeRoles("admin"),
  requireActiveReviewer("admin"),
  createGalleryPost
);
router.delete(
  "/:id",
  authorizeRoles("admin"),
  requireActiveReviewer("admin"),
  deleteGalleryPost
);

module.exports = router;
