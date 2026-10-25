const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    facultyId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    branch: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },

    office: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    designation: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    qualification: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    experience: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "faculty",
      enum: ["faculty"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isSampleAccount: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Faculty", facultySchema);