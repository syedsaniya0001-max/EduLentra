const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    image: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2048,
    },

    category: {
      type: String,
      required: true,
      enum: ["Academic", "Achievement", "Cultural", "Sports", "Other"],
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "uploadedByModel",
    },

    uploadedByModel: {
      type: String,
      required: true,
      enum: ["Admin", "HOD", "Faculty"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

gallerySchema.index({ isActive: 1, date: -1 });

module.exports = mongoose.model("Gallery", gallerySchema);