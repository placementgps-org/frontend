# PlacementGPS Email Setup Guide (Gmail & Custom SMTP)

This guide documents how to configure Nodemailer and Gmail SMTP app passwords for real Email OTP transmission.

## 1. Creating a Gmail App Password

If you are using a standard Gmail account for local testing, Google will block connections using your default password. You must generate a secure **App Password**:

1. Open your **Google Account** settings (https://myaccount.google.com).
2. Go to **Security** on the left menu.
3. Make sure **2-Step Verification** is turned **ON** (required for app passwords).
4. Under "How you sign in to Google", select **2-Step Verification**.
5. Scroll down to the bottom and click on **App passwords**.
6. Enter a name for the application (e.g. `PlacementGPS Development`).
7. Click **Create**.
8. Copy the **16-digit password** shown in the yellow banner. This password has no spaces.

---

## 2. Server Configuration

Add the following lines to your `server/.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail_address@gmail.com
SMTP_PASS=your_16_digit_app_password
EMAIL_FROM=noreply@placementgps.ai
```

### Port Details:
- **Port 587 (Recommended)**: Runs with standard TLS upgrade. (Ensure `SMTP_PORT=587`).
- **Port 465**: Runs with secure SSL from start. (Set `SMTP_PORT=465` and code handles secure configuration automatically).

---

## 3. Server Startup Connection Test

Upon backend start, the Express application will run connection test scripts:
- If credentials are loaded, the server will call Nodemailer `transporter.verify()`.
- Check your console logs:
  - Success: `✅ SMTP Server Connection verified successfully`
  - Error: `❌ SMTP verification failed: [reason]`
