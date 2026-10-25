const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "createdByModel",
    },

    createdByModel: {
      type: String,
      required: true,
      enum: ["Admin", "HOD", "Faculty"],
    },

    targetRole: {
      type: String,
      enum: ["ALL", "STUDENT", "FACULTY", "HOD", "ADMIN"],
      default: "ALL",
    },

    targetDepartment: {
      type: String,
      trim: true,
      default: null,
    },

    targetBranch: {
      type: String,
      trim: true,
      default: null,
    },

    targetSection: {
      type: String,
      trim: true,
      default: null,
    },

    category: {
      type: String,
      trim: true,
      default: "General",
    },

    priority: {
      type: String,
      enum: ["Normal", "High", "Urgent"],
      default: "Normal",
    },

    date: {
      type: String,
      default: "",
    },

    publishAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    createdByName: {
      type: String,
      trim: true,
      default: "",
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Announcement", announcementSchema);