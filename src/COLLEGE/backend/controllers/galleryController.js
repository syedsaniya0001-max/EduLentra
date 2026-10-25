const mongoose = require("mongoose");
const Admin = require("../models/Admin");
const Gallery = require("../models/Gallery");
const Student = require("../models/Student");

const galleryCategories = ["Academic", "Achievement", "Cultural", "Sports", "Other"];

const validDate = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)) &&
  new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;

const normalizeImageUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
};

const serializePost = (post) => ({
  id: String(post._id || post.id),
  title: post.title,
  category: post.category,
  date: post.date
    ? new Date(post.date).toISOString().slice(0, 10)
    : new Date(post.createdAt).toISOString().slice(0, 10),
  description: post.description || "",
  imageUrl: post.image || post.imageUrl || "",
});

const getGalleryPosts = async (req, res) => {
  try {
    if (req.user.role === "student") {
      const student = await Student.findOne({
        _id: req.user.userId,
        isActive: true,
      }).select("_id");
      if (!student) {
        return res.status(403).json({ message: "An active student account is required." });
      }
    } else if (req.user.role === "admin") {
      const admin = await Admin.findOne({
        _id: req.user.userId,
        isActive: true,
      }).select("_id");
      if (!admin) {
        return res.status(403).json({ message: "An active Admin account is required." });
      }
    } else {
      return res.status(403).json({ message: "Access denied." });
    }

    const posts = await Gallery.find({ isActive: true })
      .sort({ date: -1, createdAt: -1 })
      .lean();
    return res.status(200).json({ posts: posts.map(serializePost) });
  } catch (error) {
    console.error("Gallery lookup failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to load gallery posts." });
  }
};

const createGalleryPost = async (req, res) => {
  const { title, category, date, description, imageUrl: rawImageUrl } = req.body || {};
  const cleanedTitle = typeof title === "string" ? title.trim() : "";
  const cleanedDescription =
    typeof description === "string" ? description.trim() : "";
  const imageUrl = normalizeImageUrl(rawImageUrl);

  if (
    !cleanedTitle ||
    cleanedTitle.length > 160 ||
    !galleryCategories.includes(category) ||
    !validDate(date) ||
    !cleanedDescription ||
    cleanedDescription.length > 5000 ||
    imageUrl === null
  ) {
    return res.status(400).json({
      message: "Enter valid post details and an optional HTTP/HTTPS image URL.",
    });
  }

  try {
    const admin = await Admin.findOne({
      _id: req.user.userId,
      isActive: true,
    }).select("_id");
    if (!admin) {
      return res.status(403).json({ message: "An active Admin account is required." });
    }

    const post = await Gallery.create({
      title: cleanedTitle,
      category,
      date: new Date(`${date}T00:00:00.000Z`),
      description: cleanedDescription,
      image: imageUrl,
      uploadedBy: admin._id,
      uploadedByModel: "Admin",
    });
    return res.status(201).json({
      message: "Gallery post published successfully.",
      post: serializePost(post),
    });
  } catch (error) {
    console.error("Gallery post creation failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to publish this gallery post." });
  }
};

const deleteGalleryPost = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid gallery post." });
  }

  try {
    const admin = await Admin.findOne({
      _id: req.user.userId,
      isActive: true,
    }).select("_id");
    if (!admin) {
      return res.status(403).json({ message: "An active Admin account is required." });
    }

    const post = await Gallery.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ message: "Gallery post not found." });
    }
    return res.status(200).json({ message: "Gallery post removed." });
  } catch (error) {
    console.error("Gallery post deletion failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to remove this gallery post." });
  }
};

module.exports = { getGalleryPosts, createGalleryPost, deleteGalleryPost };
