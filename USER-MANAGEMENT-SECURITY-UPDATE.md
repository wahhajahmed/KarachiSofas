# User Management & Security Update

## Important: Run This SQL Migration First!

Before using the new features, you **MUST** run the following SQL migration in your Supabase SQL Editor:

### Steps to Run Migration:
1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the contents of `db/migration_user_cleanup_and_admins.sql`
5. Paste into the SQL Editor
6. Click "RUN" button

## What's New

### 1. User Cleanup ✅
- **Deletes all users except wahaj@gmail.com**
- Keeps only the main admin account

### 2. Two New Admin Accounts ✅
The migration creates 2 admin accounts with full access:

**Admin 1:**
- Name: Ahsan Rauf
- Email: ahsanrauf2@gmail.com
- Password: @AhsanRauf2026

**Admin 2:**
- Name: Faiza Ahsan
- Email: faizaahsan2@gmail.com
- Password: @FaizaAhsan2026

### 3. Admin Approval System ✅
- **New admins must be approved** by Ahsan or Faiza
- When someone signs up for admin account:
  1. They fill out signup form (name, email, phone, password)
  2. Request goes to "Pending Admins" page
  3. Ahsan or Faiza can **Approve** or **Reject**
  4. If approved → account is created and they can login
  5. If rejected → no account is created

**To review pending admins:**
- Login as admin (Ahsan or Faiza)
- Click "Pending Admins" in sidebar
- See all pending requests
- Click "Approve" or "Reject" button

### 4. WhatsApp OTP Verification for User Signup ✅
- **Users must verify phone number** before account is created
- Signup flow:
  1. User enters name, email, phone (WhatsApp), password
  2. System generates 6-digit OTP code
  3. User is redirected to verification page
  4. User enters the 6-digit code
  5. Code expires after **60 seconds**
  6. Timer shows countdown
  7. After expiry, user can click "Resend Code"
  8. Only after correct code → account is created
  9. Auto-redirects to login page

**Important Note for Production:**
- Currently, the OTP code is logged to browser console
- You need to integrate with WhatsApp Business API to actually send OTPs
- Popular services: Twilio, MessageBird, WhatsApp Cloud API

**To integrate WhatsApp API:**
1. Sign up for WhatsApp Business API service
2. Get API credentials
3. In `frontend/pages/signup.js` line ~95, replace console.log with API call
4. In `frontend/pages/verify-otp.js` line ~175, replace console.log with API call

### 5. UI/UX Improvements ✅
**Fixed Issues:**
- ✅ "Proceed to Checkout" button text now visible (removed dark color)
- ✅ Button stays visible on click
- ✅ Checkout page is fully responsive (mobile, tablet, desktop)
- ✅ Form on mobile shows first for better UX
- ✅ Better spacing and padding on all screen sizes

## Database Schema Changes

### New Tables:
1. **`otp_verifications`** - Stores OTP codes for phone verification
   - phone, otp_code, expires_at, verified
   - Stores pending user data (name, email, password)

2. **`pending_admins`** - Stores admin signup requests
   - name, email, password, phone, status (pending/approved/rejected)
   - reviewed_by, reviewed_at

### Modified Tables:
1. **`users`** - Added approval tracking
   - `approved` (boolean) - whether admin is approved
   - `approved_by` (uuid) - which admin approved them

## Security Features

✅ **Row Level Security (RLS)** policies added:
- Anyone can insert OTP verifications (for signup)
- Anyone can read/update OTP (for verification)
- Only approved admins can see pending admin requests
- Only approved admins can approve/reject new admins

## Testing Checklist

### Test Admin Approval System:
1. ✅ Go to admin signup page
2. ✅ Fill out form with new details
3. ✅ See success message about pending approval
4. ✅ Login as Ahsan or Faiza
5. ✅ Go to "Pending Admins" page
6. ✅ See the new request
7. ✅ Click "Approve"
8. ✅ Try logging in with new admin account → should work
9. ✅ Try again with another request, click "Reject"
10. ✅ Try logging in with rejected account → should fail

### Test WhatsApp OTP Verification:
1. ✅ Go to user signup page
2. ✅ Fill out form (especially phone number)
3. ✅ Submit form
4. ✅ Should redirect to OTP verification page
5. ✅ Open browser console (F12)
6. ✅ See the 6-digit OTP code logged
7. ✅ Enter the code in the form
8. ✅ See timer counting down from 60 seconds
9. ✅ Wait for timer to expire
10. ✅ See "Resend Code" button appear
11. ✅ Click resend, get new code
12. ✅ Enter wrong code → see error message
13. ✅ Enter correct code → account created, redirected to login

### Test UI Improvements:
1. ✅ Add items to cart
2. ✅ Go to cart page
3. ✅ Click "Proceed to Checkout" button
4. ✅ Button text should be visible (not dark/invisible)
5. ✅ Test on mobile (resize browser to small size)
6. ✅ Test on tablet (medium size)
7. ✅ Test on desktop (large size)
8. ✅ All elements should be readable and properly spaced

## Files Modified/Created

### Database Migrations:
- ✅ `db/migration_user_cleanup_and_admins.sql` (NEW)

### Admin Dashboard:
- ✅ `admin/pages/signup.js` (MODIFIED) - Now creates pending requests
- ✅ `admin/pages/pending-admins.js` (NEW) - Review pending admin signups
- ✅ `admin/components/Sidebar.js` (MODIFIED) - Added "Pending Admins" link

### User Dashboard:
- ✅ `frontend/pages/signup.js` (MODIFIED) - Generates OTP, redirects to verification
- ✅ `frontend/pages/verify-otp.js` (NEW) - OTP verification with timer
- ✅ `frontend/pages/cart.js` (MODIFIED) - Fixed button visibility
- ✅ `frontend/pages/checkout.js` (MODIFIED) - Enhanced responsiveness

## WhatsApp Integration Guide

To actually send OTPs via WhatsApp, you need to:

### Option 1: Twilio (Recommended)
```javascript
// In signup.js after generating OTP
const accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
const client = require('twilio')(accountSid, authToken);

await client.messages.create({
  from: 'whatsapp:+14155238886',  // Twilio WhatsApp number
  to: `whatsapp:+92${phone}`,     // User's WhatsApp number
  body: `Your AUF verification code is: ${otpCode}. Valid for 60 seconds.`
});
```

### Option 2: Meta WhatsApp Cloud API (Free but complex)
1. Create Facebook Business account
2. Set up WhatsApp Business Platform
3. Get WhatsApp Business API access
4. Use their API to send messages

### Option 3: Third-party Services
- MessageBird
- Vonage
- Infobip

## Support

If you encounter any issues:
1. Check Supabase SQL Editor for migration errors
2. Check browser console (F12) for JavaScript errors
3. Check Supabase Dashboard → Authentication → Policies for RLS issues
4. Make sure all migrations are run in order
