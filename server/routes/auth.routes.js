const express = require("express");
const { body } = require("express-validator");
const { register, login, getMe } = require("../controllers/auth.controller");
const { forgotPassword, resetPassword, validateResetToken } = require("../controllers/passwordReset.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// ── Validation rules ─────────────────────────────────────

const registerValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters"),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email")
    .normalizeEmail(),
];

const resetPasswordValidation = [
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("confirmPassword")
    .notEmpty().withMessage("Please confirm your password")
    .custom((value, { req }) => {
      if (value !== req.body.password) throw new Error("Passwords do not match");
      return true;
    }),
];

// ── Routes ───────────────────────────────────────────────

// Auth
router.post("/register", registerValidation, register);
router.post("/login",    loginValidation,    login);
router.get("/me",        protect,            getMe);

// Password reset
router.post("/forgot-password",                   forgotPasswordValidation, forgotPassword);
router.get("/reset-password/:token/validate",     validateResetToken);
router.post("/reset-password/:token",             resetPasswordValidation,  resetPassword);

module.exports = router;
