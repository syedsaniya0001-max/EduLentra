const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
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

    category: {
      type: String,
      required: true,
      enum: ["Academic", "Achievement", "Cultural", "Sports", "Other"],
    },

    date: {
      type: Date,
      required: true,
    },

    venue: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },

    image: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "createdByModel",
    },

    createdByModel: {
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

eventSchema.index({ isActive: 1, date: 1 });

module.exports = mongoose.model("Event", eventSchema);