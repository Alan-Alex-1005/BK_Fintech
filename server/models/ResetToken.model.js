const mongoose = require("mongoose");

const resetTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // We store the SHA-256 hash of the token, never the raw token
  tokenHash: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    // MongoDB TTL index: automatically deletes expired documents
    index: { expires: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure only one active reset token per user at a time
resetTokenSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model("ResetToken", resetTokenSchema);
