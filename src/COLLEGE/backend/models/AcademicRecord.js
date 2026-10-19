const mongoose = require("mongoose");

const academicRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },

    internalMarks: {
      type: Number,
      min: 0,
      default: 0,
    },

    externalMarks: {
      type: Number,
      min: 0,
      default: 0,
    },

    totalMarks: {
      type: Number,
      min: 0,
      default: 0,
    },

    grade: {
      type: String,
      trim: true,
      default: "",
    },

    gradePoint: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

academicRecordSchema.index(
  {
    student: 1,
    course: 1,
    semester: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("AcademicRecord", academicRecordSchema);