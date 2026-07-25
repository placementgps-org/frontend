# PlacementGPS Environment Variables & Setup Guide

This guide describes all supported environment configurations and deployment instructions.

## 1. Environment Reference Table

The backend server reads configurations from `server/.env`. Below is a comprehensive list of variables:

| Variable Name | Environment | Purpose / Description | Example Value |
|---|---|---|---|
| `PORT` | Local / Prod | The network port the Express server listens on. | `5000` |
| `NODE_ENV` | Local / Prod | Running environment mode (`development` or `production`). | `development` |
| `CLIENT_URL` | Prod | The frontend client's root URL (used for CORS routing). | `https://placementgps.ai` |
| `MONGO_URI` | Local / Prod | The connection URL for the MongoDB Atlas database. | `mongodb+srv://...` |
| `JWT_SECRET` | Local / Prod | Security key used for signing session authorization tokens. | `some_secret_key` |
| `SMTP_HOST` | Local / Prod | The host URL for the Nodemailer mail transport. | `smtp.gmail.com` |
| `SMTP_PORT` | Local / Prod | SMTP network port (`587` for TLS, `465` for secure SSL). | `587` |
| `SMTP_USER` | Local / Prod | Username for authenticating with the SMTP server. | `user@gmail.com` |
| `SMTP_PASS` | Local / Prod | App password for SMTP authentication (e.g. Google App Password). | `abcd efgh ijkl mnop` |
| `EMAIL_FROM` | Local / Prod | Sender email address displayed in verification headers. | `noreply@placementgps.ai` |
| `SMS_PROVIDER_API_KEY` | Local / Prod | Twilio Account SID (or alternative SMS provider Auth Key). | `ACxxxxxxxxxxxxxxxx` |
| `SMS_PROVIDER_SECRET` | Local / Prod | Twilio Auth Token (or alternative SMS provider Secret). | `xxxxxxxxxxxxxxxxxx` |
| `SMS_SENDER_ID` | Local / Prod | Twilio Sender Phone Number (or alternative SMS Sender ID). | `+1234567890` |
| `DEBUG_OTP` | Local (Dev Only)| Toggles print of plaintext OTPs to the terminal. | `true` |

---

## 2. Local Setup Steps

1. Create a `server/.env` file. Copy variables from `server/.env.example`.
2. Populate the database URI (`MONGO_URI`).
3. Define server configurations (`PORT` and `NODE_ENV=development`).
4. To test SMTP verification, configure your Google App credentials.
5. Set `DEBUG_OTP=true` if you want to inspect generated OTP codes in the server console.

---

## 3. Production Deployment Notes

1. In production, ensure `NODE_ENV` is set to `production`.
2. Define a secure, randomly generated string for `JWT_SECRET`.
3. Define the real domain in `CLIENT_URL` to restrict CORS requests.
4. Ensure `DEBUG_OTP` is unset or set to `false` in production to prevent leakage of security OTP codes in log archives.
