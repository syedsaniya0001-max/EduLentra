const mongoose = require("mongoose");

const facultyTimetableSchema = new mongoose.Schema(
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
    day: {
      type: String,
      required: true,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },
    room: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
  },
  { timestamps: true }
);

facultyTimetableSchema.index({ faculty: 1, day: 1, startTime: 1 });
facultyTimetableSchema.index({ branch: 1, section: 1, day: 1, startTime: 1 });

module.exports = mongoose.model("FacultyTimetable", facultyTimetableSchema);
