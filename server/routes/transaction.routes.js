const express = require("express");
const { body } = require("express-validator");
const {
  sendMoney,
  getTransactions,
  getTransactionById,
} = require("../controllers/transaction.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// All transaction routes are protected
router.use(protect);

const sendMoneyValidation = [
  body("receiverEmail")
    .trim()
    .notEmpty().withMessage("Receiver email is required")
    .isEmail().withMessage("Please enter a valid receiver email")
    .normalizeEmail(),

  body("amount")
    .notEmpty().withMessage("Amount is required")
    .isFloat({ gt: 0 }).withMessage("Amount must be a positive number")
    .custom((val) => {
      // Max 2 decimal places
      if (!/^\d+(\.\d{1,2})?$/.test(String(val))) {
        throw new Error("Amount can have at most 2 decimal places");
      }
      return true;
    })
    .toFloat(),

  body("note")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Note cannot exceed 100 characters"),
];

// Routes
router.post("/send", sendMoneyValidation, sendMoney);
router.get("/", getTransactions);
router.get("/:id", getTransactionById);

module.exports = router;
