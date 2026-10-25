const mongoose = require("mongoose");

const suggestionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Student",
      index: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    status: {
      type: String,
      enum: ["SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "DECLINED"],
      default: "SUBMITTED",
      index: true,
    },
    response: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Suggestion", suggestionSchema);
