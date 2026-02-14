# WhatsApp OTP Integration Guide

## Current Status
- OTP codes are generated successfully
- Codes are logged to browser console
- **NOT sent via WhatsApp yet**

## How to See OTP Code Now (Development)
1. Open browser (Chrome/Edge)
2. Press **F12** to open Developer Tools
3. Click **Console** tab
4. Complete signup form
5. Look for message: `WhatsApp OTP for 03XXXXXXXXX: 123456`
6. Copy the 6-digit code
7. Enter it in the verification page

---

## Production Solution: Integrate WhatsApp API

### Option 1: Twilio (Recommended - Easiest)

**Step 1: Setup Twilio Account**
1. Go to https://www.twilio.com/try-twilio
2. Sign up for free account
3. Get $15 free credit (enough for testing)
4. Verify your phone number

**Step 2: Get WhatsApp Sandbox**
1. In Twilio Console → Messaging → Try it out → WhatsApp
2. Join sandbox by sending message to Twilio WhatsApp number
3. Get your Account SID and Auth Token

**Step 3: Install Twilio (Backend Required)**

Since this is a Next.js frontend app, you'll need to create an API route:

Create: `frontend/pages/api/send-otp.js`

```javascript
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, otpCode } = req.body;

  try {
    const message = await client.messages.create({
      body: `Your AUF Karachi Sofas verification code is: ${otpCode}. Valid for 60 seconds.`,
      from: 'whatsapp:+14155238886', // Twilio Sandbox number
      to: `whatsapp:+92${phone.replace(/^0/, '')}` // Convert to international format
    });

    res.status(200).json({ success: true, messageSid: message.sid });
  } catch (error) {
    console.error('Twilio error:', error);
    res.status(500).json({ error: error.message });
  }
}
```

**Step 4: Update Environment Variables**

Create `.env.local` in frontend folder:
```
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
```

**Step 5: Install Twilio Package**
```bash
cd frontend
npm install twilio
```

**Step 6: Update Signup to Call API**

In `frontend/pages/signup.js`, replace the console.log line with:

```javascript
// Instead of: console.log(`WhatsApp OTP for ${phone}: ${otpCode}`);

// Use this:
try {
  const response = await fetch('/api/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otpCode })
  });
  
  if (!response.ok) {
    throw new Error('Failed to send OTP');
  }
} catch (err) {
  console.error('Failed to send WhatsApp OTP:', err);
  // Still redirect to verification page
}
```

---

### Option 2: WhatsApp Business Cloud API (Free but Complex)

**Pros:** Completely free
**Cons:** Requires Facebook Business account and app verification

1. Create Facebook Business Account
2. Set up WhatsApp Business Platform
3. Get permanent access token
4. Create message template
5. Integrate with API

**Not recommended for beginners**

---

### Option 3: Other Providers

1. **MessageBird** - https://messagebird.com
2. **Infobip** - https://www.infobip.com
3. **360dialog** - https://www.360dialog.com

All require payment or complex setup.

---

## Quick Test Without WhatsApp (Recommended for Now)

**For testing, you can:**
1. Keep using browser console to see OTP
2. Tell users to check console (F12)
3. OR temporarily display OTP on screen (development only!)

**To show OTP on screen (DEVELOPMENT ONLY):**

In `frontend/pages/signup.js`, after creating OTP:

```javascript
// Show OTP alert for development
if (process.env.NODE_ENV === 'development') {
  alert(`Development Mode: Your OTP is ${otpCode}`);
}
```

---

## Cost Estimate

**Twilio Pricing:**
- WhatsApp messages: $0.005 per message
- 100 OTPs = $0.50
- 1000 OTPs = $5.00
- Free $15 credit = ~3000 messages

**Very affordable for a sofa business!**

---

## Recommendation

For now:
1. ✅ Use browser console method (free, works)
2. Test with real customers manually
3. When ready, add Twilio integration (takes 30 mins)
4. Cost is minimal for a furniture business

The OTP system is fully functional - just needs WhatsApp delivery!
