const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/wallet", require("./routes/wallet.routes"));
app.use("/api/transactions", require("./routes/transaction.routes"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "SecureFinX API is running" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SecureFinX server running on port ${PORT}`);
  console.log(`   ENV: ${process.env.NODE_ENV || "development"}`);
});
