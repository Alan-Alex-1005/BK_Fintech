# SecureFinX — Full Code Explanation (Simple English)

# Introduction

This document explains the ENTIRE SecureFinX project in very simple English.

The goal is that even a beginner or a 10-year-old can understand:

* What every important file does
* Why we created it
* How frontend and backend communicate
* How login works
* How wallet works
* How password reset works
* How MongoDB stores data
* How React and Express work together

---

# BIG PICTURE OF THE PROJECT

Imagine SecureFinX like a digital bank.

The project has 2 major parts:

```text
client/  → What users SEE
server/  → What users DON'T SEE
```

---

# CLIENT SIDE (FRONTEND)

Frontend is the website the user interacts with.

Example:

* Login page
* Register page
* Dashboard
* Wallet balance
* Buttons
* Forms
* Transaction history

Frontend is built using:

```text
React + Vite
```

---

# SERVER SIDE (BACKEND)

Backend is the brain.

It handles:

* login checking
* database communication
* password hashing
* token creation
* wallet balance
* sending emails
* transactions

Backend is built using:

```text
Node.js + Express + MongoDB
```

---

# COMPLETE PROJECT FLOW

```text
User opens React frontend
        ↓
Frontend sends API request
        ↓
Express backend receives request
        ↓
Backend talks to MongoDB
        ↓
Database returns data
        ↓
Backend sends response
        ↓
Frontend updates screen
```

---

# FRONTEND EXPLANATION

# 1. main.jsx

## Purpose

This is the FIRST frontend file React runs.

Think of it like:

```text
"Start the website now"
```

---

## Important Code

```jsx
ReactDOM.createRoot()
```

This tells React:

```text
"Render the whole app inside the browser"
```

---

## Simple Example

Without main.jsx:

```text
Website never starts.
```

---

# 2. App.jsx

## Purpose

This is the MAIN frontend controller.

It controls:

* routes
* pages
* navigation
* protected pages

---

## What is Routing?

Routing means:

```text
Which page should open?
```

Example:

```text
/login
/register
/dashboard
/wallet
```

---

## ProtectedRoute

This is VERY IMPORTANT.

```jsx
<ProtectedRoute>
```

This checks:

```text
Is the user logged in?
```

If YES:

```text
Allow access.
```

If NO:

```text
Send back to login page.
```

---

## Real Life Example

Like security checking ID card before entering a building.

---

# 3. api/axios.js

## Purpose

This file helps frontend talk to backend.

Instead of writing:

```js
fetch()
```

again and again,
we use Axios.

---

## Important Job

This file automatically adds JWT token.

Example:

```js
Authorization: Bearer token
```

This proves:

```text
"User is logged in"
```

---

## Why Important?

Without token:

backend says:

```text
Unauthorized
```

---

# 4. context/AuthContext.jsx

## Purpose

Stores user information globally.

---

## What Does It Store?

* current user
* wallet
* token
* login function
* logout function

---

## Why Use Context API?

Without Context:

We would need to manually send data between components.

That becomes messy.

Context is like:

```text
A shared memory box for the whole app.
```

---

## Important Functions

### login()

Sends login request.

Stores token.

Stores user info.

---

### register()

Creates new account.

---

### logout()

Deletes token.

Removes user session.

---

# 5. pages/Login.jsx

## Purpose

Shows login form.

---

## Flow

User types:

* email
* password

Then:

```text
Frontend → Backend
```

Backend checks password.

If correct:

```text
JWT token returned.
```

Frontend stores token in:

```text
localStorage
```

---

## Why localStorage?

So user stays logged in even after refreshing browser.

---

# 6. pages/Register.jsx

## Purpose

Creates new account.

---

## What Happens?

1. User enters details
2. Backend validates input
3. Password gets hashed
4. User stored in MongoDB
5. Wallet auto-created
6. JWT generated

---

# 7. pages/Dashboard.jsx

## Purpose

Main home page after login.

Shows:

* wallet balance
* recent transactions
* account overview

---

# 8. pages/Wallet.jsx

## Purpose

Displays:

* wallet balance
* currency
* wallet info

---

## Real Life Meaning

Like checking your bank account balance.

---

# 9. pages/Transactions.jsx

## Purpose

Shows transaction history.

Example:

```text
You sent $20
You received $50
```

---

# 10. pages/Send.jsx

## Purpose

Allows user to transfer money.

---

## Flow

1. User enters receiver
2. User enters amount
3. Backend updates balances
4. Transaction saved

---

# 11. pages/ForgotPassword.jsx

## Purpose

Starts password recovery process.

---

## Flow

1. User enters email
2. Backend creates reset token
3. Email sent

---

# 12. pages/ResetPassword.jsx

## Purpose

Allows user to create new password.

---

## Flow

1. User clicks reset link
2. Token checked
3. User enters new password
4. Password updated

---

# BACKEND EXPLANATION

# 13. index.js

## Purpose

Main backend entry point.

This file starts the entire backend.

---

## Important Jobs

### Connect MongoDB

```js
connectDB()
```

---

### Enable middleware

```js
app.use(express.json())
```

This lets backend read JSON data.

---

### Load routes

```js
app.use('/api/auth')
```

---

### Start server

```js
app.listen(PORT)
```

---

# 14. config/db.js

## Purpose

Connects backend to MongoDB Atlas.

---

## MongoDB Atlas

Cloud database.

Stores:

* users
* wallets
* transactions

---

## Important Code

```js
mongoose.connect()
```

---

# 15. config/email.js

## Purpose

Handles email sending.

Used for:

```text
Forgot Password emails
```

---

## Uses Nodemailer

Nodemailer connects backend to Gmail SMTP.

---

# 16. models/User.model.js

## Purpose

Defines user database structure.

---

## Stores

* name
* email
* password

---

## Very Important Security Feature

### Password Hashing

Passwords are NEVER stored directly.

Instead:

```text
password → encrypted hash
```

---

## Why?

If database leaks,
real passwords remain hidden.

---

## comparePassword()

Used during login.

Checks:

```text
Entered password == hashed password?
```

---

# 17. models/Wallet.model.js

## Purpose

Stores wallet data.

---

## Stores

* balance
* currency
* linked user

---

# 18. models/Transaction.model.js

## Purpose

Stores all money transfers.

---

## Stores

* sender
* receiver
* amount
* type
* timestamps

---

## Why Important?

Creates transaction history.

---

# 19. models/ResetToken.model.js

## Purpose

Stores password reset tokens.

---

## Security Feature

Real token is NOT stored.

Instead:

```text
Hashed token stored
```

---

## Also Stores

```text
Expiration time
```

After expiry:

```text
Token becomes invalid.
```

---

# 20. controllers/auth.controller.js

## Purpose

Contains authentication logic.

---

# register()

## What Happens?

1. Validate input
2. Check existing email
3. Create user
4. Hash password
5. Create wallet
6. Generate JWT
7. Send response

---

# login()

## What Happens?

1. Find user
2. Compare password
3. Generate JWT
4. Return token

---

# getMe()

Returns:

```text
Current logged-in user data
```

---

# JWT TOKEN

## What Is JWT?

JWT means:

```text
JSON Web Token
```

Think of it like:

```text
Digital ID card.
```

Frontend sends token with requests.

Backend verifies token.

---

# 21. controllers/wallet.controller.js

## Purpose

Handles wallet operations.

---

## Examples

* get balance
* transfer money
* add funds

---

# 22. controllers/transaction.controller.js

## Purpose

Handles transaction history.

---

## Example

Returns:

```text
All previous transactions
```

---

# 23. controllers/passwordReset.controller.js

## Purpose

Handles password recovery.

---

# forgotPassword()

## Steps

1. User enters email
2. Generate secure token
3. Store hashed token
4. Send email

---

# validateResetToken()

Checks:

* token exists
* token not expired

---

# resetPassword()

## Steps

1. Validate token
2. Find user
3. Update password
4. Delete token

---

# 24. middleware/auth.middleware.js

## Purpose

Protects private routes.

---

## Flow

1. Read JWT token
2. Verify token
3. Find user
4. Allow access

---

## Why Important?

Without middleware:

Anyone could access private APIs.

---

# 25. routes/auth.routes.js

## Purpose

Defines authentication API endpoints.

---

## Example

```text
POST /api/auth/login
```

connects frontend to backend logic.

---

# HOW MONGODB STORES DATA

MongoDB stores data as collections.

---

# Users Collection

```json
{
  "name": "Alan",
  "email": "alan@test.com",
  "password": "hashed_password"
}
```

---

# Wallet Collection

```json
{
  "user": "user_id",
  "balance": 100,
  "currency": "USD"
}
```

---

# Transaction Collection

```json
{
  "sender": "user1",
  "receiver": "user2",
  "amount": 50
}
```

---

# WHY THIS PROJECT IS IMPORTANT

This project teaches:

* frontend development
* backend development
* databases
* authentication
* security
* APIs
* React
* Express
* MongoDB
* real-world architecture

---

# SECURITY FEATURES

Implemented:

* Password hashing
* JWT authentication
* Protected routes
* Reset token validation
* Token expiration

---

# FUTURE IMPROVEMENTS

Possible upgrades:

* Refresh tokens
* AI fraud detection
* Real payment gateway
* Multi-currency support
* Blockchain integration
* KYC verification

---

# FINAL SUMMARY

SecureFinX is a MERN-stack fintech application.

Frontend handles:

* pages
* forms
* dashboard
* user interaction

Backend handles:

* authentication
* database
* wallets
* transactions
* security
* emails

MongoDB stores all data.

JWT keeps users logged in securely.

The project follows real-world full-stack architecture principles used in actual fintech systems.
