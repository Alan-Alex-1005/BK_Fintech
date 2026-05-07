const express = require("express");
const { body } = require("express-validator");
const { getWallet, addMoney } = require("../controllers/wallet.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// All wallet routes are protected
router.use(protect);

const addMoneyValidation = [
  body("amount")
    .notEmpty().withMessage("Amount is required")
    .isFloat({ gt: 0 }).withMessage("Amount must be a positive number")
    .toFloat(),
];

// Routes
router.get("/", getWallet);
router.post("/add", addMoneyValidation, addMoney);

module.exports = router;
