# SecureFinX — MERN Fintech MVP

SecureFinX is a full-stack fintech web application built using the MERN stack.

The application allows users to:

* Create secure accounts
* Login using JWT authentication
* Manage a digital wallet
* View transaction history
* Send money
* Reset forgotten passwords using email verification

---

# Tech Stack

## Frontend

* React.js
* Vite
* Axios
* React Router
* Context API

---

## Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Authentication
* Nodemailer
* bcryptjs

---

# Project Structure

```text
BK_Fintech/
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env
│   ├── package.json
│   └── index.js
│
├── .gitignore
└── README.md
```

---

# Features

## Authentication

* User Registration
* User Login
* JWT Authentication
* Protected Routes
* Password Hashing

---

## Wallet System

* Wallet Creation
* Balance Tracking
* Currency Support
* Wallet Dashboard

---

## Transactions

* Send Money
* Transaction History
* Transaction Records

---

## Password Recovery

* Forgot Password
* Reset Password
* Secure Reset Tokens
* Email Verification Flow

---

# How To Run The Project

# 1. Clone Repository

```bash
git clone https://github.com/Alan-Alex-1005/BK_Fintech.git
```

---

# 2. Open Project

```bash
cd BK_Fintech
```

---

# Backend Setup

# 3. Go To Server Folder

```bash
cd server
```

---

# 4. Install Backend Dependencies

```bash
npm install
```

---

# 5. Create `.env` File

Inside:

```text
server/
```

Create:

```text
.env
```

Paste:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=7d

NODE_ENV=development

CLIENT_URL=http://localhost:5173

EMAIL_SERVICE=gmail
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_google_app_password
```

---

# 6. Run Backend

```bash
npm run dev
```

OR

```bash
node index.js
```

Expected:

```text
✅ MongoDB connected
🚀 SecureFinX server running on port 5000
```

---

# Frontend Setup

# 7. Open New Terminal

Go to client folder:

```bash
cd BK_Fintech/client
```

---

# 8. Install Frontend Dependencies

```bash
npm install
```

---

# 9. Run Frontend

```bash
npm run dev
```

Expected:

```text
Local: http://localhost:5173
```

---

# 10. Open Application

Open browser:

```text
http://localhost:5173
```

---

# Authentication Flow

## Register

1. User enters details
2. Backend validates data
3. Password gets hashed
4. User stored in MongoDB
5. Wallet auto-created
6. JWT generated
7. User logged in

---

## Login

1. User enters credentials
2. Password verified
3. JWT token generated
4. Token stored in localStorage
5. Protected routes unlocked

---

# Password Reset Flow

## Forgot Password

1. User enters email
2. Backend generates secure reset token
3. Token stored securely
4. Email sent to user

---

## Reset Password

1. User opens reset link
2. Token validated
3. User enters new password
4. Password updated securely

---

# Database Collections

MongoDB Atlas collections:

* users
* wallets
* transactions
* resettokens

---

# Security Features

Implemented:

* JWT Authentication
* Password Hashing
* Protected Routes
* Token Validation
* Secure Reset Tokens

---

# Future Improvements

* Refresh Tokens
* Multi-Currency Wallets
* Fraud Detection
* KYC Verification
* Real Payment Gateway Integration
* AI Analytics
* Blockchain Integration

---

# Important Notes

## Never Upload

* `.env`
* `node_modules`
* `.git`

---

# Add To `.gitignore`

```gitignore
node_modules/
.env
.dist/
```

---

# Author

Alan Alex

---

# Project Status

✅ Authentication Complete
✅ Wallet System Complete
✅ Transactions Complete
✅ Password Reset Complete
✅ MongoDB Integration Complete
✅ Frontend Integration Complete
✅ MERN Architecture Complete
