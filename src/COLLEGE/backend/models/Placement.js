const mongoose = require("mongoose");

const placementSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    jobRole: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    eligibility: {
      type: String,
      default: "",
      trim: true,
    },

    package: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
      maxlength: 160,
    },

    applyLink: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2048,
    },

    branch: {
      type: String,
      required: true,
      trim: true,
      default: "All",
      index: true,
    },

    applicationDeadline: {
      type: Date,
      required: true,
    },

    applyLink: {
      type: String,
      default: "",
      trim: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
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

module.exports = mongoose.model("Placement", placementSchema);