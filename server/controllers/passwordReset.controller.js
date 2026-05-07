const crypto   = require("crypto");
const { validationResult } = require("express-validator");
const User       = require("../models/User.model");
const ResetToken = require("../models/ResetToken.model");
const { sendResetEmail } = require("../config/email");

// Helper: SHA-256 hash of a raw token string
const hashToken = (raw) =>
  crypto.createHash("sha256").update(raw).digest("hex");

// @desc    Request a password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return 200 — never reveal whether the email exists
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, a reset link has been sent.",
      });
    }

    // Delete any existing reset token for this user (one at a time)
    await ResetToken.deleteOne({ user: user._id });

    // Generate a cryptographically secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Store only the hash — raw token lives only in the email
    await ResetToken.create({
      user:      user._id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // Build reset URL pointing to the React frontend
    const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
    const resetURL  = `${clientURL}/reset-password/${rawToken}`;

    await sendResetEmail({
      toEmail:  user.email,
      toName:   user.name,
      resetURL,
    });

    console.log(`🔑 Password reset requested for: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("ForgotPassword error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not send reset email. Please try again.",
    });
  }
};

// @desc    Reset password using token from email link
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { token }    = req.params;
  const { password } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: "Reset token is missing." });
  }

  try {
    // Hash the incoming raw token to look it up
    const tokenHash = hashToken(token);

    // Find a matching, non-expired token
    const resetRecord = await ResetToken.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: "This reset link is invalid or has expired. Please request a new one.",
      });
    }

    // Load the user
    const user = await User.findById(resetRecord.user);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Update password — pre-save hook in User model handles hashing
    user.password = password;
    await user.save();

    // Invalidate the token immediately after use
    await ResetToken.deleteOne({ _id: resetRecord._id });

    console.log(`✅ Password reset successful for: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("ResetPassword error:", error);
    return res.status(500).json({
      success: false,
      message: "Password reset failed. Please try again.",
    });
  }
};

// @desc    Validate that a reset token is still valid (used by frontend before showing the form)
// @route   GET /api/auth/reset-password/:token/validate
// @access  Public
const validateResetToken = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ success: false, message: "Token missing." });
  }

  try {
    const tokenHash   = hashToken(token);
    const resetRecord = await ResetToken.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: "This reset link is invalid or has expired.",
      });
    }

    return res.status(200).json({ success: true, message: "Token is valid." });
  } catch (error) {
    console.error("ValidateResetToken error:", error);
    return res.status(500).json({ success: false, message: "Validation failed." });
  }
};

module.exports = { forgotPassword, resetPassword, validateResetToken };
