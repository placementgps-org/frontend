import https from 'https';

/**
 * Send an OTP via SMS using Twilio REST API.
 * Uses native Node.js 'https' module to make HTTP requests without external dependencies.
 * Throws an error if required environment variables are missing.
 */
const sendSMS = async ({ phone, otp }) => {
  const accountSid = process.env.SMS_PROVIDER_API_KEY || process.env.TWILIO_SID;
  const authToken = process.env.SMS_PROVIDER_SECRET || process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.SMS_SENDER_ID || process.env.TWILIO_PHONE;

  if (!accountSid || !authToken || !fromPhone) {
    console.error('[sendSMS] Twilio credentials are not configured. Cannot send SMS.');
    throw new Error('SMS OTP service is not configured. Missing SMS credentials.');
  }

  // Format phone number to E.164 if not already (e.g. +91...)
  let formattedPhone = phone;
  if (!phone.startsWith('+')) {
    if (phone.length === 10) {
      formattedPhone = `+91${phone}`; // Assume India default country code
    } else {
      formattedPhone = `+${phone}`;
    }
  }

  // Conditional debug logging of OTP for developers
  if (process.env.NODE_ENV === 'development' && process.env.DEBUG_OTP === 'true') {
    console.log(`[sendSMS] [DEBUG OTP] To: ${formattedPhone} | OTP Code: ${otp}`);
  }

  const postData = new URLSearchParams({
    To: formattedPhone,
    From: fromPhone,
    Body: `Your Placement GPS verification code is ${otp}. It is valid for 10 minutes.`,
  }).toString();

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const options = {
    hostname: 'api.twilio.com',
    port: 443,
    path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  return new Promise((resolve, reject) => {
    console.log(`[sendSMS] Making request to Twilio API for phone: ${formattedPhone}`);
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        let parsed = {};
        try {
          parsed = JSON.parse(body);
        } catch (e) {
          parsed = { message: body };
        }
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[sendSMS] Twilio response success. SID: ${parsed.sid}`);
          resolve({ success: true, sid: parsed.sid });
        } else {
          console.error(`[sendSMS] Twilio API error (Status ${res.statusCode}):`, parsed.message || body);
          reject(new Error(parsed.message || 'Failed to send SMS OTP via Twilio.'));
        }
      });
    });

    req.on('error', (err) => {
      console.error('[sendSMS] HTTPS connection error:', err.message);
      reject(new Error('Failed to send SMS due to network connection error.'));
    });

    req.write(postData);
    req.end();
  });
};

export default sendSMS;
