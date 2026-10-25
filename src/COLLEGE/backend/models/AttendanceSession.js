const mongoose = require("mongoose");

const attendanceSessionSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
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
    date: {
      type: Date,
      required: true,
    },
    period: {
      type: String,
      required: true,
      trim: true,
    },
    records: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        status: {
          type: String,
          enum: ["PRESENT", "ABSENT", "LATE"],
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

attendanceSessionSchema.index(
  { faculty: 1, date: 1, subject: 1, section: 1, period: 1 },
  { unique: true }
);

module.exports = mongoose.model("AttendanceSession", attendanceSessionSchema);
