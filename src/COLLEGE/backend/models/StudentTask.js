const mongoose = require("mongoose");

const studentTaskSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    category: {
      type: String,
      required: true,
      enum: ["Assignment", "Exam", "Study", "Personal", "Other"],
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    time: {
      type: String,
      default: "",
      match: /^(?:[01]\d|2[0-3]):[0-5]\d$/,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

studentTaskSchema.index({ student: 1, date: 1, time: 1 });

module.exports = mongoose.model("StudentTask", studentTaskSchema);
