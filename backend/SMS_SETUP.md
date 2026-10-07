# PlacementGPS SMS Provider Integration Guide

This guide documents how to configure Twilio, MSG91, or Fast2SMS as real SMS OTP dispatch engines.

## 1. Twilio Integration (Default)

The native SMS dispatcher uses the **Twilio REST API** over HTTPS to send text messages without external package dependencies.

### Setup Instructions:
1. Log in or sign up at **Twilio** (https://www.twilio.com).
2. Go to your **Console Dashboard**.
3. Locate your Account SID, Auth Token, and Twilio Purchased Phone Number.
4. Populate your `server/.env` file:
   ```env
   SMS_PROVIDER_API_KEY=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (Your Twilio Account SID)
   SMS_PROVIDER_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (Your Twilio Auth Token)
   SMS_SENDER_ID=+1XXXXXXXXXX (Your Twilio Phone Number in E.164 format)
   ```

---

## 2. Other SMS Providers (MSG91 & Fast2SMS)

For alternative providers, the webhook configurations can be updated inside `server/utils/sendSMS.js`.

### A. MSG91 Setup
To switch to MSG91, configure their API endpoint inside `sendSMS.js`:
- Endpoint: `https://control.msg91.com/api/v5/otp`
- Headers: `authkey: SMS_PROVIDER_API_KEY`
- Query Params/Body: `template_id`, `mobile`, `otp`.

### B. Fast2SMS Setup
To switch to Fast2SMS, configure their HTTP API inside `sendSMS.js`:
- Endpoint: `https://www.fast2sms.com/dev/bulkV2`
- Headers: `authorization: SMS_PROVIDER_API_KEY`
- Body: `variables_values: otp`, `route: otp`, `numbers: phone`.

---

## 3. Configuration Validation

At startup, the backend server automatically inspects these environment values. If missing, it prints a warning to the console:
`⚠️  SMS Configuration Warning (SMS OTP will fail): Missing variables...`
If values are present, it prints:
`✅ SMS Provider Configuration detected successfully`
If a phone registration is triggered with missing credentials, the server responds with a clear `HTTP 500` indicating the credentials configuration is missing.
