const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be at least 0.01"],
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [100, "Note cannot exceed 100 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    // Snapshot balances for audit trail
    senderBalanceBefore: { type: Number },
    senderBalanceAfter: { type: Number },
    receiverBalanceBefore: { type: Number },
    receiverBalanceAfter: { type: Number },
  },
  {
    timestamps: true, // createdAt = transaction timestamp
  }
);

// Index for fast user-based lookups
transactionSchema.index({ sender: 1, createdAt: -1 });
transactionSchema.index({ receiver: 1, createdAt: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
