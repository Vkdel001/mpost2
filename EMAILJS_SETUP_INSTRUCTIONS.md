# 📧 EmailJS Setup Instructions

## Quick Setup Guide

### Step 1: Get Your EmailJS Credentials

1. **Go to EmailJS Dashboard**: [https://dashboard.emailjs.com/](https://dashboard.emailjs.com/)
2. **Login** with your account

### Step 2: Get Service ID
1. Click **"Email Services"** in the left sidebar
2. Find your email service (Gmail, Outlook, etc.)
3. Copy the **Service ID** (looks like: `service_xxxxxxx`)

### Step 3: Get Template ID
1. Click **"Email Templates"** in the left sidebar
2. Click **"Create New Template"** if you don't have one
3. Use this template content:

```
Subject: Your OTP Code - AI Invoice Processor

Hello {{to_name}},

Your verification code is: {{otp_code}}

This code will expire in {{expires_in}}.

Please enter this code to access the AI Invoice Processor.

If you didn't request this code, please ignore this email.

Best regards,
{{app_name}} Team
```

4. Save the template and copy the **Template ID** (looks like: `template_xxxxxxx`)

### Step 4: Get User ID (Public Key)
1. Click **"Account"** in the left sidebar
2. Go to **"General"** tab
3. Copy your **Public Key** (looks like: `user_xxxxxxxxxxxxxxxxx`)

### Step 5: Update Your Code
Replace the placeholders in `src/services/authService.ts`:

```javascript
private readonly EMAILJS_CONFIG = {
  serviceId: 'service_your_service_id_here',    // Replace with your Service ID
  templateId: 'template_your_template_id_here', // Replace with your Template ID  
  userId: 'user_your_public_key_here'          // Replace with your Public Key
};
```

## Example Configuration

```javascript
private readonly EMAILJS_CONFIG = {
  serviceId: 'service_abc123def',
  templateId: 'template_xyz789ghi', 
  userId: 'user_abcdefghijklmnopqr'
};
```

## Testing Your Setup

1. **Update the credentials** in the code
2. **Save the file**
3. **Test with your email** address
4. **Check your inbox** (and spam folder)
5. **Verify the OTP** works

## Troubleshooting

### Common Issues:

1. **"Invalid service ID"** → Double-check your Service ID
2. **"Invalid template ID"** → Make sure template exists and ID is correct
3. **"Invalid user ID"** → Use the Public Key, not Private Key
4. **Emails not received** → Check spam folder, verify email service setup

### Debug Steps:

1. Open browser **Developer Tools** (F12)
2. Go to **Console** tab
3. Look for EmailJS success/error messages
4. Check network tab for API calls

## Free Tier Limits

- **200 emails per month**
- **No credit card required**
- **Perfect for testing and small apps**

## Need Help?

- Check the console for error messages
- Verify all three credentials are correct
- Make sure your email service is properly configured in EmailJS
- Test with a simple template first

---

**Current Status**: ✅ EmailJS is integrated, just needs your credentials!