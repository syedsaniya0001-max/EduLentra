const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "recipientModel",
    },

    recipientModel: {
      type: String,
      required: true,
      enum: ["Student", "Faculty", "HOD", "Admin"],
    },

    sourceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HODRequest",
      default: null,
    },

    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    sourceModel: {
      type: String,
      enum: ["FacultyRequest", "Complaint", "Suggestion", "OutpassRequest"],
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "GENERAL",
        "APPROVAL",
        "REJECTION",
        "ANNOUNCEMENT",
        "EVENT",
        "REQUEST",
        "PLACEMENT",
      ],
      default: "GENERAL",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Makes unread/latest notifications faster to retrieve
notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});
notificationSchema.index(
  { recipient: 1, sourceRequest: 1 },
  {
    unique: true,
    partialFilterExpression: { sourceRequest: { $type: "objectId" } },
  }
);
notificationSchema.index(
  { recipient: 1, recipientModel: 1, sourceModel: 1, sourceId: 1 },
  {
    unique: true,
    partialFilterExpression: { sourceId: { $type: "objectId" } },
  }
);

module.exports = mongoose.model("Notification", notificationSchema);