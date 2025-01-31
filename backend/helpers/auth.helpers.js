import jwt from 'jsonwebtoken';
import nodeMailer from 'nodemailer';
import { pgquery } from '../utils/pgquery.js';
import { authenticator, totp, hotp } from 'otplib';

const step = 5 * 60; //300 sec means 5 min
const window = 1;
export const generateSecret = (method = 'authenticator') => {
  let secret = null;

  if (method === 'totp') {
    secret = totp.generateSecret();
  } else if (method === 'hotp') {
    secret = hotp.generateSecret();
  } else {
    secret = authenticator.generateSecret();
  }

  return secret
};

// Function to generate a TOTP with 5-minute validity
export const generateOtp = (secret, method = 'authenticator') => {
  let token = null;
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] Generating OTP with method: ${method}, secret: ${secret}`);

  if (method === 'totp') {
    token = totp.generate(secret, { step });
  } else if (method === 'hotp') {
    console.log('generating hotp')
    token = hotp.generate(secret, 0);
  } else {
    token = authenticator.generate(secret);
  }

  console.log(`[${new Date().toISOString()}] Generated OTP: ${token}`);
  return token;
};

// Function to verify a TOTP or HOTP with configured parameters
export const verifyOtp = (secret, token, method = 'authenticator') => {
  const verifyStartTime = new Date();
  console.log(`[${verifyStartTime.toISOString()}] Verifying OTP: ${token}, secret: ${secret}, method: ${method}`);

  let valid = false;
  if (method === 'totp') {
      console.log(`verifying totp with step ${step}, window ${window}`)
    valid = totp.verify({ token, secret, step, window });
  } else if (method === 'hotp') {
      console.log(`verifying hotp`)
    // Use the verify method not check method (verify method also checks the counter automatically and handles out of sync counter issues)
    valid = hotp.verify({ token, secret, counter: 0 });
  } else {
    valid = authenticator.verify({ token, secret });
  }
    console.log(`[${new Date().toISOString()}] Verification result: ${valid}`);
  return valid;
};
// Helper function to handle errors
export const handleError = (fnName, res, error, message = "Internal server error") => {
  console.error(`Error in chats.controller.js | function name : ${fnName}: `, error);
  return res.status(500).json({ success: false, message, error: error.message });
};

export const generateRefreshToken = async (user, expiresIn = 1000) => {
  const refreshToken = jwt.sign({ user }, process.env.JWT_REFRESH_SECRET, {
    expiresIn
  });
  return refreshToken;
};

export const generateEmailVerificationLink = async (req, payload) => {
  try {
    // generate email verification token and send it  in response
    const emailVerificationToken = jwt.sign(payload, process.env.JWT_EMAIL_SECRET, {
      expiresIn: 60 * 5
    });
    const [result] = await pgquery('UPDATE auth_users SET email_verification_token = $1 WHERE user_id = $2 returning *', [emailVerificationToken, payload.user_id]);
    if (!result) {
      throw new Error("Failed to update email verification token in database");
    }
    const emailVerificationLink = `${req.protocol}://${req.get('host')}/api/auth/email/verify?token=${emailVerificationToken}`;
    return emailVerificationLink;
  } catch (error) {
    console.error("Error in generateEmailVerificationLink: ", error);
    return null;
  }
};

export const generateAccessTokenFromRefreshToken = async (refreshToken) => {
  try {
    if (!refreshToken) {
      return null;
    }
    let accessToken;
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      try {
        if (err) {
          if (err.message === 'jwt expired') {
            const [result] = await pgquery('SELECT * FROM refresh_tokens WHERE token = $1', [refreshToken]);
            if (!result) {
              throw new Error("Refresh token not found for specified token");
            }
            if (result.revoked) {
              throw new Error("Refresh token has been revoked");
            }
            // refresh token is expired, so revoke it
            const revokeResult = await pgquery('UPDATE refresh_tokens SET revoked = $1 WHERE token = $2 returning *', [true, refreshToken]);
            if (!revokeResult) {
              throw new Error("Failed to revoke refresh token");
            }
          }
          throw new Error("Invalid refresh token");
        }
        if (!decoded) {
          throw new Error("Invalid refresh token");
        }
        accessToken = jwt.sign({ user: decoded.user }, process.env.JWT_SECRET, {
          expiresIn: 60 * 5
        });
      } catch (error) {
        console.error("Error in generateAccessTokenFromRefreshToken 1: ", error);
        return null;
      }
    });
    return accessToken;
  } catch (error) {
    console.log("Error in generateAccessTokenFromRefreshToken 2: ", error);
    return null;
  }
};

export function sanitizeEmail(email) {
  // Split the email into the local part and domain
  const [local, domain] = email.split('@');

  // Sanitize the local part
  let sanitizedLocal;
  if (local.length > 4) {
    sanitizedLocal = local.slice(0, 2) + '*'.repeat(local.length - 4) + local.slice(-2);
  } else {
    sanitizedLocal = local.slice(0, 2) + '*'.repeat(local.length - 2);
  }

  // Combine the sanitized local part and the domain
  return `${sanitizedLocal}@${domain}`;
}

export const sanitizePhone = (phone) => {
  return phone.slice(0, 3) + '*****' + phone.slice(-3);
};
// Helper function to mark token as consumed
export const consumeToken = async (tokenId) => {
  const [updatedToken] = await pgquery(
    'UPDATE auth_tokens SET is_consumed = $1 WHERE token_id = $2 returning *',
    [true, tokenId]
  );
  return updatedToken;
};
export const sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html
    };
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Error in sendEmail: ", error);
    return null;
  }
};

export const sendOtp = async (to, otp) => {
  try {
    const subject = 'Your OTP for Verification on Dev Auth';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: sans-serif;
              background-color: #f0f0f0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #fff;
              border-radius: 5px;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header h1 {
              color: #333;
            }
            .otp-container {
              background-color: #f0f0f0;
              padding: 20px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .otp {
              font-size: 24px;
              font-weight: bold;
              color: #333;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Verification OTP</h1>
            </div>
            <div class="otp-container">
              <p class="otp">Your OTP is: ${otp}</p>
            </div>
            <p>Please enter this OTP to verify your account.</p>
            <p>This OTP is valid for 5 minutes.</p>
          </div>
        </body>
        </html>
      `;

    const info = await sendEmail(to, subject, null, html);
    return info;
  } catch (error) {
    console.error("Error in sendOtp: ", error);
    return null;
  }
};

export const sendEmailVerificationLinkHelper = async (to, emailVerificationLink) => {
  try {
    const subject = 'Action Required: Verify Your Email for Dev Auth';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f9f9f9;
              color: #333333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2c3e50;
              font-size: 24px;
              margin: 0;
            }
            .content {
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              padding: 12px 20px;
              font-size: 16px;
              color: white;
              background-color: #007bff;
              text-decoration: none;
              border-radius: 5px;
              text-align: center;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #7f8c8d;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Confirm Your Email Address</h1>
            </div>
            <div class="content">
              <p>Dear User,</p>
              <p>Thank you for signing up for Dev Auth. To complete your registration, we need to verify your email address.</p>
              <p>Please click the button below to confirm your email:</p>
              <p style="text-align: center;">
                <a href="${emailVerificationLink}" class="button">Verify Email Now</a>
              </p>
              <p>If you did not sign up for Dev Auth, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>If you have any questions, feel free to contact our support team.</p>
              <p>Thank you,<br>The Dev Auth Team</p>
            </div>
          </div>
        </body>
        </html>
      `;

    const info = await sendEmail(to, subject, null, html);
    return info;
  } catch (error) {
    console.error("Error in sendEmailVerificationLink: ", error);
    return null;
  }
};

export const sendMagicLink = async (to, magicLink) => {
  try {
    const subject = 'Your Magic Link for Dev Auth';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f9f9f9;
              color: #333333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2c3e50;
              font-size: 24px;
              margin: 0;
            }
            .content {
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              padding: 12px 20px;
              font-size: 16px;
              color: #fff;
              background-color: #007bff;
              text-decoration: none;
              border-radius: 5px;
              text-align: center;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #7f8c8d;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Magic Link</h1>
            </div>
            <div class="content">
              <p>Dear User,</p>
              <p>You have requested a magic link to sign in to your Dev Auth account.</p>
              <p>Please click the button below to sign in:</p>
              <p style="text-align: center;">
                <a href="${magicLink}" class="">Sign In with Magic Link</a>
              </p>
              <p>If you did not request this magic link, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>If you have any questions, feel free to contact our support team.</p>
              <p>Thank you,<br>The Dev Auth Team</p>
            </div>
          </div>
        </body>
        </html>
      `;
    const info = await sendEmail(to, subject, null, html);
    return info;
  }
  catch (error) {
    console.error("Error in sendMagicLink: ", error);
    return null;
  }
};

export const sendResetPasswordLink = async (to, resetPasswordLink) => {
  try {
    const subject = 'Your Password Reset Link for Dev Auth';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f9f9f9;
              color: #333333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2c3e50;
              font-size: 24px;
              margin: 0;
            }
            .content {
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              padding: 12px 20px;
              font-size: 16px;
              color: #fff;
              background-color: #007bff;
              text-decoration: none;
              border-radius: 5px;
              text-align: center;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #7f8c8d;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Password Reset Link</h1>
            </div>
            <div class="content">
              <p>Dear User,</p>
              <p>You have requested a password reset link for your Dev Auth account.</p>
              <p>Please click the button below to reset your password:</p>
              <p style="text-align: center;">
                <a href="${resetPasswordLink}" class="">Reset Password</a>
              </p>
              <p>If you did not request this password reset link, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>If you have any questions, feel free to contact our support team.</p>
              <p>Thank you,<br>The Dev Auth Team</p>
            </div>
          </div>
        </body>
        </html>
      `;
    const info = await sendEmail(to, subject, null, html);
    return info;
  }
  catch (error) {
    console.error("Error in sendResetPasswordLink: ", error);
    return null;
  }
};