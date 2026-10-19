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
    },

    image: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
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

module.exports = mongoose.model("Gallery", gallerySchema);