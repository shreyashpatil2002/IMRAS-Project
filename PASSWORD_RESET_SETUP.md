# Password Reset Email Setup Guide

This guide explains how to configure email functionality for the forgot password feature in IMRAS.

## Overview

The password reset functionality allows users to:
1. Request a password reset by entering their email
2. Receive a secure reset link via email (valid for 10 minutes)
3. Set a new password using the link
4. Automatically log in after successful password reset

## Backend Setup

### 1. Install Dependencies

Nodemailer is already installed. If needed:
```bash
cd backend
npm install nodemailer
```

### 2. Configure Environment Variables

Add the following to your `backend/.env` file:

```env
# Frontend URL (for reset link)
FRONTEND_URL=http://localhost:3000

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

### 3. Gmail Setup (Recommended)

For Gmail, you need to use an App Password:

1. **Enable 2-Factor Authentication**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "IMRAS" as the name
   - Click "Generate"
   - Copy the 16-character password

3. **Update .env file**
   ```env
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop  # (remove spaces)
   ```

### 4. Alternative Email Services

#### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

#### Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-smtp-username
EMAIL_PASSWORD=your-mailgun-smtp-password
```

#### Outlook/Office 365
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-outlook-password
```

## API Endpoints

### 1. Forgot Password
**POST** `/api/auth/forgot-password`

Request:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "status": "success",
  "message": "Password reset email sent successfully"
}
```

### 2. Reset Password
**POST** `/api/auth/reset-password/:token`

Request:
```json
{
  "password": "newpassword123"
}
```

Response:
```json
{
  "status": "success",
  "message": "Password reset successful",
  "data": {
    "user": { ... },
    "token": "jwt-token"
  }
}
```

## Frontend Setup

### Routes Added
- `/forgot-password` - Request password reset
- `/reset-password/:token` - Reset password with token

### Components
- `ForgotPassword.jsx` - Email submission form
- `ResetPassword.jsx` - New password form

## User Flow

1. **Forgot Password**
   - User clicks "Forgot Password?" on login page
   - User enters email address
   - User receives confirmation message
   - Email with reset link is sent (link valid for 10 minutes)

2. **Reset Password**
   - User clicks link in email
   - User is redirected to `/reset-password/:token`
   - User enters new password (minimum 6 characters)
   - User confirms password
   - Password is reset and user is logged in

3. **Token Expiry**
   - Reset tokens expire after 10 minutes
   - Expired tokens show error message
   - User must request new reset link

## Security Features

1. **Token Hashing**: Reset tokens are hashed using SHA-256 before storage
2. **Time-Limited**: Tokens expire after 10 minutes
3. **Single-Use**: Tokens are deleted after successful password reset
4. **Secure Password**: Passwords are hashed using bcrypt before storage
5. **No User Enumeration**: Same success message whether email exists or not (consider implementing)

## Troubleshooting

### Email Not Sending

1. **Check credentials**
   ```bash
   # Verify .env file has correct values
   cat backend/.env | grep EMAIL
   ```

2. **Check console for errors**
   - Look for authentication errors in terminal
   - Common error: "Invalid login: 535-5.7.8 Username and Password not accepted"

3. **Gmail specific**
   - Ensure 2FA is enabled
   - Use App Password, not regular password
   - Check "Less secure app access" is NOT enabled (use App Password instead)

4. **Firewall/Port blocking**
   - Ensure port 587 (SMTP) is not blocked
   - Try port 465 with `secure: true` option

### Reset Link Not Working

1. **Check token expiry**
   - Tokens expire after 10 minutes
   - Request new reset email

2. **Check frontend URL**
   - Ensure FRONTEND_URL in .env matches your app URL
   - For production, update to your domain

3. **Check token in URL**
   - Token should be 64 characters (hex)
   - URL format: `http://localhost:3000/reset-password/[64-char-token]`

## Testing

### Test Email Locally

You can use Ethereal Email for testing without real email:

```javascript
// In authController.js, replace nodemailer.createTransport with:
const transporter = nodemailer.createTransporter({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'ethereal-username',
    pass: 'ethereal-password'
  }
});
```

Get free credentials at: https://ethereal.email/

### Test Flow

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm start`
3. Go to http://localhost:3000/forgot-password
4. Enter a valid user email
5. Check email inbox for reset link
6. Click link and set new password
7. Verify auto-login to dashboard

## Production Deployment

1. **Update environment variables**
   ```env
   FRONTEND_URL=https://your-domain.com
   EMAIL_HOST=smtp.your-provider.com
   ```

2. **Use professional email service**
   - SendGrid (99% deliverability)
   - Mailgun (Great developer experience)
   - Amazon SES (Cost-effective)

3. **Add rate limiting**
   - Limit reset requests per IP
   - Prevent abuse of email sending

4. **Monitor email delivery**
   - Track bounces and failures
   - Log email sending attempts

## Database Schema

Reset tokens are stored in User model:

```javascript
{
  resetPasswordToken: String,      // Hashed token
  resetPasswordExpire: Date,        // Expiry timestamp
}
```

Both fields are cleared after successful password reset or expiry.
