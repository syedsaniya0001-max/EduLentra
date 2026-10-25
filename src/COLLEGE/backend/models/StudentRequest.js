const mongoose = require("mongoose");

const studentRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    rollNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    branch: {
      type: String,
      required: true,
      trim: true,
    },

    section: {
      type: String,
      trim: true,
      default: "",
    },

    entryType: {
      type: String,
      required: true,
      trim: true,
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
      ref: "Faculty",
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
          ref: "Faculty",
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

module.exports = mongoose.model("StudentRequest", studentRequestSchema);