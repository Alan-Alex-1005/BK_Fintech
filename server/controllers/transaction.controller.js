const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const User = require("../models/User.model");
const Wallet = require("../models/Wallet.model");
const Transaction = require("../models/Transaction.model");

// @desc    Send money from logged-in user to another user
// @route   POST /api/transactions/send
// @access  Protected
const sendMoney = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { receiverEmail, amount, note } = req.body;
  const senderId = req.user._id;

  // Prevent sending to yourself
  if (receiverEmail.toLowerCase() === req.user.email.toLowerCase()) {
    return res.status(400).json({
      success: false,
      message: "You cannot send money to yourself.",
    });
  }

  // Use a session for atomic transaction (both wallet updates succeed or both fail)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Find receiver
    const receiver = await User.findOne({
      email: receiverEmail.toLowerCase(),
    }).session(session);

    if (!receiver) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Receiver not found. Check the email address.",
      });
    }

    // 2. Load both wallets
    const senderWallet = await Wallet.findOne({ user: senderId }).session(session);
    const receiverWallet = await Wallet.findOne({ user: receiver._id }).session(session);

    if (!senderWallet || !receiverWallet) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Wallet not found for one of the parties.",
      });
    }

    // 3. Balance check — prevent negative balance
    if (senderWallet.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Your balance is $${senderWallet.balance.toFixed(2)}.`,
      });
    }

    // 4. Snapshot balances before the transfer
    const senderBefore = senderWallet.balance;
    const receiverBefore = receiverWallet.balance;

    // 5. Apply the transfer
    senderWallet.balance = parseFloat((senderBefore - amount).toFixed(2));
    receiverWallet.balance = parseFloat((receiverBefore + amount).toFixed(2));

    await senderWallet.save({ session });
    await receiverWallet.save({ session });

    // 6. Create ONE transaction record (source of truth)
    const transaction = await Transaction.create(
      [
        {
          sender: senderId,
          receiver: receiver._id,
          amount,
          type: "debit", // from sender's perspective (receiver side derived in history)
          note: note || "",
          status: "success",
          senderBalanceBefore: senderBefore,
          senderBalanceAfter: senderWallet.balance,
          receiverBalanceBefore: receiverBefore,
          receiverBalanceAfter: receiverWallet.balance,
        },
      ],
      { session }
    );

    // 7. Commit everything atomically
    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `$${amount.toFixed(2)} sent to ${receiver.name} successfully.`,
      transaction: {
        id: transaction[0]._id,
        amount: transaction[0].amount,
        receiver: { name: receiver.name, email: receiver.email },
        note: transaction[0].note,
        status: transaction[0].status,
        timestamp: transaction[0].createdAt,
      },
      newBalance: senderWallet.balance,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("SendMoney error:", error);
    res.status(500).json({ success: false, message: "Transfer failed. Please try again." });
  } finally {
    session.endSession();
  }
};

// @desc    Get transaction history for logged-in user (sent + received)
// @route   GET /api/transactions
// @access  Protected
const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;

    // Pagination support
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Fetch all transactions where user is sender OR receiver
    const [transactions, total] = await Promise.all([
      Transaction.find({
        $or: [{ sender: userId }, { receiver: userId }],
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "name email")
        .populate("receiver", "name email")
        .lean(),

      Transaction.countDocuments({
        $or: [{ sender: userId }, { receiver: userId }],
      }),
    ]);

    // Shape each transaction from the user's perspective
    const formatted = transactions.map((tx) => {
      const isSender = tx.sender._id.toString() === userId.toString();
      return {
        id: tx._id,
        type: isSender ? "debit" : "credit",
        amount: tx.amount,
        counterparty: isSender
          ? { name: tx.receiver.name, email: tx.receiver.email }
          : { name: tx.sender.name, email: tx.sender.email },
        note: tx.note,
        status: tx.status,
        balanceBefore: isSender ? tx.senderBalanceBefore : tx.receiverBalanceBefore,
        balanceAfter: isSender ? tx.senderBalanceAfter : tx.receiverBalanceAfter,
        timestamp: tx.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      transactions: formatted,
    });
  } catch (error) {
    console.error("GetTransactions error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transactions." });
  }
};

// @desc    Get a single transaction by ID
// @route   GET /api/transactions/:id
// @access  Protected
const getTransactionById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid transaction ID." });
    }

    const tx = await Transaction.findById(id)
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .lean();

    if (!tx) {
      return res.status(404).json({ success: false, message: "Transaction not found." });
    }

    // Only sender or receiver may view this transaction
    const isSender = tx.sender._id.toString() === userId.toString();
    const isReceiver = tx.receiver._id.toString() === userId.toString();

    if (!isSender && !isReceiver) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    res.status(200).json({
      success: true,
      transaction: {
        id: tx._id,
        type: isSender ? "debit" : "credit",
        amount: tx.amount,
        sender: { name: tx.sender.name, email: tx.sender.email },
        receiver: { name: tx.receiver.name, email: tx.receiver.email },
        note: tx.note,
        status: tx.status,
        balanceBefore: isSender ? tx.senderBalanceBefore : tx.receiverBalanceBefore,
        balanceAfter: isSender ? tx.senderBalanceAfter : tx.receiverBalanceAfter,
        timestamp: tx.createdAt,
      },
    });
  } catch (error) {
    console.error("GetTransactionById error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transaction." });
  }
};

module.exports = { sendMoney, getTransactions, getTransactionById };
