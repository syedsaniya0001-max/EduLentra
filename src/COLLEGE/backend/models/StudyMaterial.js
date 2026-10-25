const mongoose = require("mongoose");

const studyMaterialSchema = new mongoose.Schema(
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
    unit: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
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
      maxlength: 3000,
      default: "",
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
  },
  { timestamps: true }
);

studyMaterialSchema.index({ branch: 1, section: 1, createdAt: -1 });

module.exports = mongoose.model("StudyMaterial", studyMaterialSchema);
