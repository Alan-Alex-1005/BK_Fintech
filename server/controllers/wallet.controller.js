const { validationResult } = require("express-validator");
const Wallet = require("../models/Wallet.model");
const Transaction = require("../models/Transaction.model");

// @desc    Get wallet balance for logged-in user
// @route   GET /api/wallet
// @access  Protected
const getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found. Please contact support.",
      });
    }

    res.status(200).json({
      success: true,
      wallet: {
        id: wallet._id,
        balance: wallet.balance,
        currency: wallet.currency,
        lastUpdated: wallet.updatedAt,
      },
    });
  } catch (error) {
    console.error("GetWallet error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch wallet." });
  }
};

// @desc    Add money to wallet (simulated top-up)
// @route   POST /api/wallet/add
// @access  Protected
const addMoney = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { amount } = req.body;

  // Extra safety: reject non-positive amounts
  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Amount must be greater than zero.",
    });
  }

  try {
    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found.",
      });
    }

    const balanceBefore = wallet.balance;
    wallet.balance = parseFloat((balanceBefore + amount).toFixed(2));
    await wallet.save();

    // Record top-up as a self-credit transaction for audit trail
    await Transaction.create({
      sender: req.user._id,
      receiver: req.user._id,
      amount,
      type: "credit",
      note: "Wallet top-up",
      status: "success",
      senderBalanceBefore: balanceBefore,
      senderBalanceAfter: wallet.balance,
      receiverBalanceBefore: balanceBefore,
      receiverBalanceAfter: wallet.balance,
    });

    res.status(200).json({
      success: true,
      message: `$${amount.toFixed(2)} added to your wallet successfully.`,
      wallet: {
        id: wallet._id,
        balance: wallet.balance,
        currency: wallet.currency,
      },
    });
  } catch (error) {
    console.error("AddMoney error:", error);
    res.status(500).json({ success: false, message: "Failed to add funds." });
  }
};

module.exports = { getWallet, addMoney };
