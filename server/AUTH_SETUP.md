# PlacementGPS Authentication Infrastructure Documentation

This document explains the security architecture and validation logic of the PlacementGPS authentication system.

## 1. Core Architecture

The authentication infrastructure supports two completely decoupled user flows:
1. **Email Registration & Sign-In**: Requires Name, Email, and Password. No phone details are captured or checked.
2. **Phone Registration & Sign-In**: Requires Name, Phone Number, and Password. No email details are captured or checked.

The system is built on **Node.js, Express, MongoDB, and Mongoose**.

---

## 2. Key Security Mechanisms

### A. Password Hashing (Bcryptjs)
- Passwords are encrypted before saving to the database using `bcryptjs` pre-save hooks with **12 salt rounds**.
- Plaintext passwords are never stored or logged in database fields.

### B. Session Authorization (JWT)
- Authenticated sessions are established via signed JSON Web Tokens (`jsonwebtoken`).
- Tokens carry the User ID and are signed with the `JWT_SECRET` key.
- Default expiration is set to **30 days** to support seamless "Remember Me" options on the client.

### C. IP-Based Rate Limiting
- Sensitive API routes are protected by a memory-based IP rate limiter middleware (`rateLimitMiddleware.js`).
- **Registration**: 5 requests per minute per IP.
- **Login**: 5 requests per minute per IP.
- **OTP Requests**: 3 requests per minute per IP.
- **OTP Verification**: 10 requests per minute per IP.

### D. Brute-Force OTP Lockout
- Each OTP verification session tracks failed verification attempts.
- If a user enters an incorrect OTP code **more than 3 times**, the verification session is locked: the database wipes the OTP code, expiration, and purpose fields, and requires the user to request a new OTP.
- OTPs automatically expire after **10 minutes**.

---

## 3. Route Index
- `POST /api/auth/register` - Create unverified user and send OTP.
- `POST /api/auth/verify-otp` - Verify OTP and activate account.
- `POST /api/auth/login` - Authenticate verified users and return JWT.
- `POST /api/auth/send-email-otp` - Trigger a new email verification code.
- `POST /api/auth/send-phone-otp` - Trigger a new SMS verification code.
- `POST /api/auth/forgot-password` - Trigger forgot-password flow.
- `POST /api/auth/reset-password` - Complete password reset.
