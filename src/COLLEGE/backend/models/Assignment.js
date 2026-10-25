const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    fileUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: "",
    },
    submittedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    marks: {
      type: Number,
      min: 0,
      default: null,
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    gradedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const assignmentSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
      index: true,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    maxMarks: {
      type: Number,
      required: true,
      min: 1,
      max: 1000,
    },
    submissions: {
      type: [submissionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

assignmentSchema.index({ branch: 1, section: 1, dueDate: 1 });

module.exports = mongoose.model("Assignment", assignmentSchema);
