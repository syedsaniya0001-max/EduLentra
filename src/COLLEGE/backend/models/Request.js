const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "requestedByModel",
    },

    requestedByModel: {
      type: String,
      required: true,
      enum: ["Student", "Faculty", "HOD"],
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "reviewedByModel",
      default: null,
    },

    reviewedByModel: {
      type: String,
      enum: ["Admin", "HOD", "Faculty"],
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    response: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Request", requestSchema);