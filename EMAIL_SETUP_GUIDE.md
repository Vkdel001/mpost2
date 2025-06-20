# Email Setup Guide for AI Invoice Processor

## Option 1: EmailJS (Recommended - Already Configured)

### Step 1: Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### Step 2: Create Email Service
1. Go to "Email Services" in your dashboard
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. Copy your **Service ID**

### Step 3: Create Email Template
1. Go to "Email Templates"
2. Click "Create New Template"
3. Use this template:

```html
Subject: Your OTP Code for AI Invoice Processor

Hello {{to_name}},

Your OTP code is: **{{otp_code}}**

This code will expire in {{expires_in}}.

If you didn't request this code, please ignore this email.

Best regards,
{{app_name}} Team
```

4. Copy your **Template ID**

### Step 4: Get User ID
1. Go to "Account" → "General"
2. Copy your **User ID**

### Step 5: Update Configuration
Replace the placeholders in `src/services/authService.ts`:

```javascript
private readonly EMAILJS_CONFIG = {
  serviceId: 'service_xxxxxxx', // Your Service ID
  templateId: 'template_xxxxxxx', // Your Template ID
  userId: 'user_xxxxxxxxxxxxxxxxx' // Your User ID
};
```

---

## Option 2: Resend (Higher Volume)

### Setup Steps:
1. Sign up at [Resend.com](https://resend.com/)
2. Get your API key
3. Add to your backend:

```javascript
import { Resend } from 'resend';

const resend = new Resend('re_xxxxxxxxxx');

await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: email,
  subject: 'Your OTP Code',
  html: `Your OTP is: <strong>${otp}</strong>`
});
```

---

## Option 3: Brevo (Reliable)

### Setup Steps:
1. Sign up at [Brevo.com](https://www.brevo.com/)
2. Get your API key
3. Use their API:

```javascript
const response = await fetch('https://api.brevo.com/v3/smtp/email', {
  method: 'POST',
  headers: {
    'api-key': 'your-api-key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sender: { email: 'noreply@yourdomain.com' },
    to: [{ email: email }],
    subject: 'Your OTP Code',
    htmlContent: `Your OTP is: <strong>${otp}</strong>`
  })
});
```

---

## Current Status

✅ **EmailJS is already configured** in your project
🔧 **Just need to add your credentials** to make it work
📧 **OTP currently shows in console** for demo purposes
🚀 **Ready to send real emails** once configured

## Testing

1. Configure EmailJS with your credentials
2. Test with your own email address
3. Check both inbox and spam folders
4. Verify OTP functionality works end-to-end

## Free Tier Limits Comparison

| Service | Free Emails/Month | Setup Difficulty | Deliverability |
|---------|-------------------|------------------|----------------|
| EmailJS | 200 | Easy ⭐⭐⭐ | Good |
| Resend | 3,000 | Medium ⭐⭐ | Excellent |
| Brevo | 9,000 | Medium ⭐⭐ | Good |
| Mailgun | 5,000* | Hard ⭐ | Excellent |

*First 3 months only