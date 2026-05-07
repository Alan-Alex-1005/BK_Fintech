const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const User = require("../models/User.model");
const Wallet = require("../models/Wallet.model");

/* ======================================================
   GENERATE JWT TOKEN
====================================================== */

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

/* ======================================================
   REGISTER USER
   POST /api/auth/register
====================================================== */

const register = async (req, res) => {
  // Validation check
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { name, email, password } = req.body;

  try {
    // Check if user exists
    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Auto create wallet
    const wallet = await Wallet.create({
      user: user._id,
      balance: 0,
      currency: "USD",
    });

    // Generate token
    const token = generateToken(user._id);

    // Response
    res.status(201).json({
      success: true,
      message:
        "Account created successfully.",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },

      wallet: {
        id: wallet._id,
        balance: wallet.balance,
        currency: wallet.currency,
      },
    });

  } catch (error) {
    console.error(
      "Register error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Registration failed. Please try again.",
    });
  }
};

/* ======================================================
   LOGIN USER
   POST /api/auth/login
====================================================== */

const login = async (req, res) => {
  // Validation check
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({
      email,
    }).select("+password");

    // Invalid email
    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    // Compare password
    const isMatch =
      await user.comparePassword(password);

    // Invalid password
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    // Find wallet
    const wallet =
      await Wallet.findOne({
        user: user._id,
      });

    // Generate token
    const token = generateToken(user._id);

    // Response
    res.status(200).json({
      success: true,
      message: "Login successful.",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },

      wallet: wallet
        ? {
            id: wallet._id,
            balance: wallet.balance,
            currency: wallet.currency,
          }
        : null,
    });

  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Login failed. Please try again.",
    });
  }
};

/* ======================================================
   GET CURRENT USER
   GET /api/auth/me
====================================================== */

const getMe = async (req, res) => {
  try {
    // Find wallet
    const wallet =
      await Wallet.findOne({
        user: req.user._id,
      });

    res.status(200).json({
      success: true,

      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },

      wallet: wallet
        ? {
            id: wallet._id,
            balance: wallet.balance,
            currency: wallet.currency,
          }
        : null,
    });

  } catch (error) {
    console.error(
      "GetMe error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch user data.",
    });
  }
};

/* ======================================================
   EXPORTS
====================================================== */

module.exports = {
  register,
  login,
  getMe,
};