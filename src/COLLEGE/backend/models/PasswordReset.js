const mongoose = require("mongoose");

const passwordResetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userModel",
    },

    userModel: {
      type: String,
      required: true,
      enum: ["Admin", "Student", "Faculty", "HOD"],
    },

    token: {
      type: String,
      required: true,
      unique: true,
      // The value stored here is the SHA-256 digest, never the raw reset token.
    },

    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PasswordReset", passwordResetSchema);