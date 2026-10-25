const mongoose = require("mongoose");

const facultyRequestSchema = new mongoose.Schema(
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

    image: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      select: false,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    decision: {
      type: String,
      enum: ["APPROVED", "REJECTED"],
      default: null,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HOD",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },

    decisionHistory: [
      {
        _id: false,
        decision: {
          type: String,
          enum: ["APPROVED", "REJECTED"],
          required: true,
        },
        reviewedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "HOD",
          default: null,
        },
        reviewedAt: {
          type: Date,
          default: null,
        },
        rejectionReason: {
          type: String,
          default: "",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FacultyRequest", facultyRequestSchema);