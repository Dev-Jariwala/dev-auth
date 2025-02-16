import { pgquery } from "../utils/pgquery.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { consumeToken, deleteOTP, generateAccessTokenFromRefreshToken, generateEmailVerificationLink, generateOtp, generateRefreshToken, generateSecret, checkOtp, handleError, sanitizeEmail, sanitizePhone, sendEmailVerificationLinkHelper, sendMagicLink, sendOtp, sendResetPasswordLink, storeOTP, verifyOtp } from "../helpers/auth.helpers.js";
import { authenticator } from "otplib";

/* 
-- Table for users
CREATE TABLE auth_users(
    sr_no SERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password TEXT,
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 
*/
/* 
-- Table for refresh tokens
CREATE TABLE refresh_tokens(
    sr_no SERIAL PRIMARY KEY,
    refresh_token_id uuid not null unique default gen_random_uuid(),
    user_id UUID REFERENCES auth_users(user_id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    access_token TEXT UNIQUE NOT NULL,
    user_agent TEXT NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at timestamp,
    session_id uuid
);
 */
/* 
-- Table for MFA methods
CREATE TABLE auth_user_mfa (
    sr_no SERIAL PRIMARY KEY,
    mfa_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth_users(user_id) ON DELETE CASCADE,
    mfa_type VARCHAR(50) NOT NULL, -- email_otp, phone_otp, totp
    mfa_secret VARCHAR(255), 
    is_enabled BOOLEAN DEFAULT TRUE, 
    UNIQUE (user_id, mfa_type) -- Ensures a user can't have duplicate MFA types
); 
*/
/* 
CREATE TABLE auth_tokens (
    sr_no SERIAL PRIMARY KEY,
    token_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth_users(user_id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    token_type VARCHAR(50) NOT NULL, -- e.g., 'email_verification', 'phone_verification', 'password_reset', 'magic_link'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_consumed BOOLEAN DEFAULT FALSE,
    additional_data JSONB, -- Store extra data like phone number, or other data
);
 */
export const registerUser = async (req, res) => {
    const { email, username, phone, password } = req.body;
    if (!email || !username || !phone || !password) {
        return res.status(400).json({ message: "Please provide all the required fields" });
    }
    const [existingUser] = await pgquery('SELECT * FROM auth_users WHERE email = $1 OR username = $2 OR phone = $3', [email, username, phone]);
    if (existingUser) {
        if (existingUser.email === email) {
            return res.status(400).json({ message: "Email already exists" });
        }
        if (existingUser.username === username) {
            return res.status(400).json({ message: "Username already exists" });
        }
        if (existingUser.phone === phone) {
            return res.status(400).json({ message: "Phone number already exists" });
        }
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const [user] = await pgquery('INSERT INTO auth_users (email, username, phone, password) VALUES ($1, $2, $3, $4) RETURNING *', [email, username, phone, hashedPassword]);
        delete user.password;
        // generate email verification token and send it  in response
        const emailVerificationLink = await generateEmailVerificationLink(req, { user_id: user.user_id });
        sendEmailVerificationLinkHelper(user.email, emailVerificationLink);
        res.status(200).json({ message: "User registered successfully", user });
    } catch (error) {
        handleError("registerUser", res, error);
    }
};

export const loginUser = async (req, res) => {
    const { loginId, password, otp, mfa_type } = req.body; // Added mfa_type to request body
    const sessionId = req.session.sessionId;

    if (!loginId || !password) {
        return res.status(400).json({ message: "Please provide all the required fields" });
    }

    try {
        const [user] = await pgquery(`SELECT * FROM auth_users WHERE email = $1 OR username = $1 OR phone = $1`, [loginId]);
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // check if user email is verified
        if (!user.is_email_verified) {
            const emailVerificationLink = await generateEmailVerificationLink(req, { user_id: user.user_id });
            console.log('Email Verification Link: ', emailVerificationLink);
            sendEmailVerificationLinkHelper(user.email, emailVerificationLink);
            return res.status(400).json({ message: "Email not verified", error: "Email not verified" });
        }
        if (!sessionId) {
            return res.status(500).json({ message: "Session ID not found" });
        }

        // Fetch enabled MFA methods for the user
        const mfaMethods = await pgquery('SELECT mfa_type, mfa_secret FROM auth_user_mfa WHERE user_id = $1 AND is_enabled = $2', [user.user_id, true]);
        if (mfaMethods?.length === 0) {
            // If no MFA enabled, skip MFA verification
        } else if (!mfa_type) {
            const senitizedMfaMethods = mfaMethods.map(m => {
                if (m.mfa_type === 'email_otp') {
                    return { mfa_type: m.mfa_type, email: sanitizeEmail(user.email) };
                } else if (m.mfa_type === 'phone_otp') {
                    return { mfa_type: m.mfa_type, phone: sanitizePhone(user.phone) };
                } else if (m.mfa_type === 'totp') {
                    return { mfa_type: m.mfa_type };
                }
            });
            // If MFA is enabled but no mfa_type is provided by user, tell frontend that mfa required
            return res.status(400).json({
                message: "MFA required",
                error: "MFA required",
                mfaMethods: senitizedMfaMethods
            });
        } else if (!mfaMethods.find((mfa) => mfa.mfa_type === mfa_type)) {
            // if user has provided mfa_type that does not exists in db
            return res.status(400).json({ message: "Invalid MFA type" });
        }
        else if (mfa_type === 'phone_otp') {
            return res.status(400).json({ message: "Feature not implemented yet" }); // return error for phone_otp

        }
        else if (mfa_type === 'totp' && !otp) {
            return res.status(400).json({ message: "OTP required", error: "OTP required" });
        }
        else if (mfa_type === 'totp' && otp) {
            const selectedMfa = mfaMethods.find(m => m.mfa_type === 'totp');
            console.log('Selected MFA: ', selectedMfa);
            const isValid = verifyOtp(selectedMfa.mfa_secret, otp); // Verify totp
            if (!isValid) {
                return res.status(400).json({ message: "Invalid OTP", error: "Invalid OTP" });
            }
        }
        else if (mfa_type === 'email_otp' && !otp) {
            // Generate OTP using otplib
            const otp = generateOtp(sessionId);

            // Save the new OTP in the database
            const result = await storeOTP(sessionId, otp, 'login');
            if (!result) {
                return res.status(500).json({ message: "Internal server error while generating OTP" });
            }
            sendOtp(user.email, otp);
            return res.status(400).json({
                message: "OTP sent",
                error: "OTP sent",
                step: 'otp'
            });
        }
        else if (mfa_type === 'email_otp' && otp) {

            const otpResult = await checkOtp(sessionId, otp, 'login');
            console.log('OTP Result: ', otpResult);
            if (!otpResult) {
                return res.status(400).json({ message: "Invalid OTP", error: "Invalid OTP" });
            }
            // Delete the OTP from the database
            const deleteResult = await deleteOTP(otpResult.sessionId, 'login');
            if (!deleteResult) {
                return res.status(500).json({ message: "Internal server error while deleting OTP" });
            }
        }
        delete user.password;
        const refreshTokenExpiresIn = 60 * 15;
        const refreshToken = await generateRefreshToken(user, refreshTokenExpiresIn);
        const accessToken = await generateAccessTokenFromRefreshToken(refreshToken);
        if (!accessToken) {
            return res.status(400).json({ message: "Internal server error while creating access token" });
        }
        const [result] = await pgquery('INSERT INTO refresh_tokens (user_id, user_agent, token, access_token, session_id) VALUES ($1, $2, $3, $4, $5) returning *', [user.user_id, req.headers['user-agent'], refreshToken, accessToken, sessionId]);
        if (result.refresh_token_id) {
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            });
            return res.status(200).json({ user, result });
        } else {
            return res.status(500).json({ message: "Internal server error while creating refresh token" });
        }
    } catch (error) {
        handleError("loginUser", res, error);
    }
};

export const logoutUser = async (req, res) => {
    try {
        const refreshToken = req.refreshToken;
        console.log('Refresh Token: ', refreshToken);
        const [result] = await pgquery('UPDATE refresh_tokens SET revoked = $1, revoked_at = NOW() WHERE token = $2 returning *', [true, refreshToken]);
        if (!result) {
            return res.status(500).json({ message: "Internal server error while revoking refresh token" });
        }
        res.clearCookie('accessToken');
        res.status(200).json({ result });
    } catch (error) {
        handleError("logoutUser", res, error);
    }
};

export const getData = async (req, res) => {
    try {
        const [data] = await pgquery('SELECT * FROM auth_users');
        res.status(200).json({ data });
    } catch (error) {
        handleError("getData", res, error);
    }
};

export const authenticateUser = async (req, res) => {
    let token = req.cookies?.accessToken;
    const verifykey = process.env.JWT_SECRET;

    if (!token) {
        return res.status(401).send({ message: "Login required" });
    }
    const [result] = await pgquery('SELECT * FROM refresh_tokens WHERE access_token = $1', [token]);
    if (!result) {
        return res.status(401).send({ message: "Refresh token not found for specified access_token" });
    }
    if (result.revoked) {
        return res.status(401).send({ message: "Refresh token has been revoked" });
    }
    jwt.verify(token, verifykey, async (err, decoded) => {
        if (err) {
            if (err.message === 'jwt expired') {
                const accessToken = await generateAccessTokenFromRefreshToken(result.token);
                if (!accessToken) {
                    return res.status(500).send({ message: "Failed to generate access token" });
                }
                const updateResult = await pgquery('UPDATE refresh_tokens SET access_token = $1 WHERE token = $2 returning *', [accessToken, result.token]);
                if (!updateResult) {
                    return res.status(500).send({ message: "Failed to update access token" });
                }

                res.cookie('accessToken', accessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none'
                });
                req.cookies.accessToken = accessToken;
                return res.status(200).json({ decoded, authenticated: true });
            }
            return res.status(401).send({ message: "Unauthorized", err });
        }

        res.status(200).json({ decoded, authenticated: true });
    });
};

export const verifyEmail = async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.send("Invalid link");
    }
    try {
        jwt.verify(token, process.env.JWT_EMAIL_SECRET, async (err, decoded) => {
            if (err) {
                if (err.message === 'jwt expired') {
                    return res.send("Link expired");
                }
                return res.send("Invalid link");
            }
            // Check if the token is already consumed or expired
            const [authTokenResult] = await pgquery('SELECT * FROM auth_tokens WHERE token = $1 AND token_type = $2 AND is_consumed = $3 AND expires_at > NOW()', [token, 'email_verification', false]);
            if (!authTokenResult) {
                return res.send("Invalid link");
            }
            // Update the user email verification status
            const [result] = await pgquery('UPDATE auth_users SET is_email_verified = $1 WHERE user_id = $2 returning *', [true, decoded.user_id]);
            if (!result) {
                return res.send("Failed to verify email. Please try again later.");
            }
            // Mark the token as consumed
            const [updateTokenResult] = await pgquery('UPDATE auth_tokens SET is_consumed = $1 WHERE token = $2 returning *', [true, token]);
            if (!updateTokenResult) {
                return res.send("Failed to mark token consumed.");
            }
            return res.send("Email verified successfully. You can close the tab.");
        });
    } catch (error) {
        handleError("verifyEmail", res, error);
    }
};

export const sendEmailVerificationLink = async (req, res) => {
    const { loginId } = req.query;
    try {
        const [user] = await pgquery(`SELECT * FROM auth_users WHERE email = $1 OR username = $1 OR phone = $1`, [loginId]);
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // check if user email is verified
        if (user.is_email_verified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        const emailVerificationLink = await generateEmailVerificationLink(req, { user_id: user.user_id });
        sendEmailVerificationLinkHelper(user.email, emailVerificationLink);
        return res.status(200).json({ message: "Email verification link sent successfully" });
    } catch (error) {
        handleError("sendEmailVerificationLink", res, error);
    }
}

// Controller to enable MFA for a user
export const updateUserMFA = async (req, res) => {
    const { is_enabled, mfa_type, otp, totp_secret } = req.body;
    const { user_id } = req.user;
    const sessionId = req.session.sessionId;
    if (!mfa_type || !['email_otp', 'phone_otp', 'totp', 'none'].includes(mfa_type)) {
        return res.status(400).json({ message: "Please provide valid MFA type" });
    }
    try {
        // Check if the user has already enabled MFA
        const [user] = await pgquery('SELECT * FROM auth_users WHERE user_id = $1', [user_id]);
        if (!user) {
            return res.status(500).json({ message: "Failed to fetch user data" });
        }
        // Check if the user has already enabled the MFA
        const [existingMFA] = await pgquery('SELECT * FROM auth_user_mfa WHERE user_id = $1 AND mfa_type = $2', [user_id, mfa_type]);
        if (existingMFA && existingMFA.is_enabled === is_enabled) {
            return res.status(400).json({ message: "MFA already enabled/disabled" });
        }

        if (mfa_type === 'email_otp' && !otp) {
            // Generate OTP using otplib
            const otp = generateOtp(sessionId, 'totp');

            // Save the new OTP
            const result = await storeOTP(sessionId, otp, 'mfa');
            if (!result) {
                return res.status(500).json({ message: "Internal server error while storing OTP" });
            }
            sendOtp(user.email, otp);

            // You may need to send this OTP to the user's email based on your MFA setup
            return res.status(200).json({
                step: 'otp',
                message: "MFA otp sent successfully",
                error: "MFA otp sent successfully"
            });
        }
        if (mfa_type === 'email_otp' && otp) {

            const otpResult = await checkOtp(sessionId, otp, 'mfa');
            if (!otpResult) {
                return res.status(400).json({ message: "Invalid OTP", error: "Invalid OTP" });
            }

            if (existingMFA) {
                const [updateResult] = await pgquery('UPDATE auth_user_mfa SET is_enabled = $1 WHERE user_id = $2 AND mfa_type = $3 returning *', [is_enabled, user_id, mfa_type]);
                if (!updateResult) {
                    return res.status(500).json({ message: "Internal server error while updating MFA" });
                }
            } else {
                // Create new mfa record
                const [insertResult] = await pgquery('INSERT INTO auth_user_mfa (user_id, mfa_type, is_enabled) VALUES ($1, $2, $3) returning *', [user_id, mfa_type, is_enabled]);
                if (!insertResult) {
                    return res.status(500).json({ message: "Internal server error while creating MFA" });
                }
            }

            const deleteResult = await deleteOTP(otpResult.sessionId, otpResult.type);
            if (!deleteResult) {
                return res.status(500).json({ message: "Internal server error while deleting OTP" });
            }
            return res.status(200).json({ message: "MFA enabled successfully" });
        }
        if (mfa_type === 'totp') {
            if (!otp && !totp_secret) {
                return res.status(400).json({ message: "Please provide the OTP and secret" });
            }
            const isValid = verifyOtp(totp_secret, otp);
            if (!isValid) {
                return res.status(400).json({ message: "Invalid OTP" });
            }
            if (existingMFA) {
                const [updateResult] = await pgquery('UPDATE auth_user_mfa SET is_enabled = $1, mfa_secret = $2 WHERE user_id = $3 AND mfa_type = $4 returning *', [is_enabled, mfa_type === 'none' ? null : totp_secret, user_id, mfa_type]);
                if (!updateResult) {
                    return res.status(500).json({ message: "Internal server error while updating MFA" });
                }
            } else {
                const [insertResult] = await pgquery('INSERT INTO auth_user_mfa (user_id, mfa_type, mfa_secret, is_enabled) VALUES ($1, $2, $3, $4) returning *', [user_id, mfa_type, mfa_type === 'none' ? null : totp_secret, is_enabled]);
                if (!insertResult) {
                    return res.status(500).json({ message: "Internal server error while creating MFA" });
                }
            }
            return res.status(200).json({ message: "MFA updated successfully" });
        }
        if (mfa_type === 'phone_otp') {
            res.status(400).json({ message: "Feature not implemented yet" });
        }
    } catch (error) {
        handleError("updateUserMFA", res, error);
    }
};

export const getMFAData = async (req, res) => {
    const { user_id } = req.user;
    try {
        // Fetch user info
        const [user] = await pgquery('SELECT user_id, username, email, phone FROM auth_users WHERE user_id = $1', [user_id]);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Fetch MFA data
        const mfaMethods = await pgquery('SELECT mfa_type, mfa_secret, is_enabled FROM auth_user_mfa WHERE user_id = $1', [user_id]);
        // Process the MFA data
        const enhancedMfaMethods = mfaMethods?.map(mfa => {
            let secretUrl = null;
            if (mfa.mfa_type === 'totp' && mfa.mfa_secret) {
                secretUrl = authenticator.keyuri(user.email, 'DevAuth', mfa.mfa_secret);
            }
            return { ...mfa, is_enabled: !!mfa.is_enabled, mfa_secret: mfa.mfa_secret || '', secretUrl };
        });

        // Check if any MFA method is enabled
        const isMfaEnabled = enhancedMfaMethods?.some(method => method.is_enabled) || false;

        // if totp is not found then generate secret for totp and url 
        if (!enhancedMfaMethods.find(m => m.mfa_type === 'totp')) {
            const totpSecret = generateSecret();
            const secretUrl = authenticator.keyuri(user.email, 'DevAuth', totpSecret);
            enhancedMfaMethods.push({ mfa_type: 'totp', is_enabled: false, mfa_secret: totpSecret, secretUrl });
        }

        return res.status(200).json({ ...user, is_mfa: isMfaEnabled, mfaMethods: enhancedMfaMethods });
    } catch (error) {
        handleError("getMFAData", res, error);
    }
};

// 1. Generate Magic Link
export const generateMagicLink = async (req, res) => {
    const { loginId } = req.body;
    const frontend_domain = process.env.FRONTEND_DOMAIN || 'http://localhost:5173'; // Use env
    if (!loginId) {
        return res.status(400).json({ message: "Please provide loginId" });
    }
    try {
        const [user] = await pgquery('SELECT * FROM auth_users WHERE email = $1 OR username = $1 OR phone = $1', [loginId]);
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = generateSecret();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

        // Insert a new token if no existing unconsumed token is found
        const [result] = await pgquery(
            'INSERT INTO auth_tokens (user_id, token, token_type, expires_at) VALUES ($1, $2, $3, $4) returning *',
            [user.user_id, token, 'magic_link', expiresAt]
        );
        if (!result) {
            return res.status(500).json({ message: "Internal server error while creating magic link" });
        }
        const magicLink = `${frontend_domain}/magic-link?token=${token}`;
        console.log('Magic Link: ', magicLink);
        sendMagicLink(user.email, magicLink);
        // Do not send magic link in response in production
        return res.status(200).json({ message: "Magic link sent successfully" });
    } catch (error) {
        handleError("generateMagicLink", res, error);
    }
};

// 2. Verify Magic Link
export const verifyMagicLink = async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).json({ message: "Please provide a token" });
    }
    try {
        const [result] = await pgquery('SELECT * FROM auth_tokens WHERE token = $1 AND token_type = $2 AND is_consumed = $3', [token, 'magic_link', false]);
        if (!result) {
            return res.status(400).json({ message: "Invalid magic link" });
        }
        if (new Date(result.expires_at) < new Date()) {
            return res.status(400).json({ message: "Magic link expired" });
        }
        const [user] = await pgquery('SELECT * FROM auth_users WHERE user_id = $1', [result.user_id]);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        // Update is_consumed to true using our helper function
        const updatedToken = await consumeToken(result.token_id);
        if (!updatedToken) {
            return res.status(500).json({ message: "Internal server error while consuming magic link" });
        }
        delete user.password;
        const refreshTokenExpiresIn = 60 * 15;
        const refreshToken = await generateRefreshToken(user, refreshTokenExpiresIn);
        const accessToken = await generateAccessTokenFromRefreshToken(refreshToken);
        if (!accessToken) {
            return res.status(400).json({ message: "Internal server error while creating access token" });
        }
        const [refreshTokenResult] = await pgquery('INSERT INTO refresh_tokens (user_id, user_agent, token, access_token, session_id) VALUES ($1, $2, $3, $4, $5) returning *', [user.user_id, req.headers['user-agent'], refreshToken, accessToken, req.session.sessionId]);
        if (refreshTokenResult.refresh_token_id) {
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            });
            return res.status(200).json({ message: "Magic link verified successfully", success: true });
        } else {
            return res.status(500).json({ message: "Internal server error while creating refresh token" });
        }
    } catch (error) {
        handleError("verifyMagicLink", res, error);
    }
};

// 1. Generate Password Reset Link
export const generatePasswordResetLink = async (req, res) => {
    const { loginId } = req.body;
    const frontend_domain = process.env.FRONTEND_DOMAIN || 'http://localhost:5173'; // Use env
    if (!loginId) {
        return res.status(400).json({ message: "Please provide loginId" });
    }
    try {
        const [user] = await pgquery('SELECT * FROM auth_users WHERE email = $1 OR username = $1 OR phone = $1', [loginId]);
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = generateSecret();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

        // Insert a new token
        const [result] = await pgquery(
            'INSERT INTO auth_tokens (user_id, token, token_type, expires_at) VALUES ($1, $2, $3, $4) returning *',
            [user.user_id, token, 'password_reset', expiresAt]
        );
        if (!result) {
            return res.status(500).json({ message: "Internal server error while creating password reset link" });
        }
        const passwordResetLink = `${frontend_domain}/reset-password?token=${token}`;
        console.log('Password Reset Link: ', passwordResetLink);
        sendResetPasswordLink(user.email, passwordResetLink)
        return res.status(200).json({ message: "Password reset link sent successfully" });
    } catch (error) {
        handleError("generatePasswordResetLink", res, error);
    }
};

// 2. Verify Password Reset Link
export const verifyPasswordResetLink = async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).json({ message: "Please provide a token" });
    }
    try {
        const [result] = await pgquery('SELECT * FROM auth_tokens WHERE token = $1 AND token_type = $2 AND is_consumed = $3', [token, 'password_reset', false]);
        if (!result) {
            return res.status(400).json({ message: "Invalid password reset link" });
        }
        if (new Date(result.expires_at) < new Date()) {
            return res.status(400).json({ message: "Password reset link expired" });
        }
        return res.status(200).json({ message: "Password reset link verified", success: true });
    } catch (error) {
        handleError("verifyPasswordResetLink", res, error);
    }
};


// 3. Update Password
export const updatePassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ message: "Please provide token and new password" });
    }
    try {
        const [result] = await pgquery('SELECT * FROM auth_tokens WHERE token = $1 AND token_type = $2 AND is_consumed = $3', [token, 'password_reset', false]);
        if (!result) {
            return res.status(400).json({ message: "Invalid password reset link" });
        }
        if (new Date(result.expires_at) < new Date()) {
            return res.status(400).json({ message: "Password reset link expired" });
        }
        const [user] = await pgquery('SELECT * FROM auth_users WHERE user_id = $1', [result.user_id]);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const [updatedUser] = await pgquery('UPDATE auth_users SET password = $1 WHERE user_id = $2 returning *', [hashedPassword, user.user_id]);
        if (!updatedUser) {
            return res.status(500).json({ message: "Internal server error while updating password" });
        }
        // consume token
        const updatedToken = await consumeToken(result.token_id);
        if (!updatedToken) {
            return res.status(500).json({ message: "Internal server error while consuming password reset link" });
        }
        delete updatedUser.password;
        const refreshTokenExpiresIn = 60 * 15;
        const refreshToken = await generateRefreshToken(updatedUser, refreshTokenExpiresIn);
        const accessToken = await generateAccessTokenFromRefreshToken(refreshToken);
        if (!accessToken) {
            return res.status(400).json({ message: "Internal server error while creating access token" });
        }
        const [refreshTokenResult] = await pgquery('INSERT INTO refresh_tokens (user_id, user_agent, token, access_token, session_id) VALUES ($1, $2, $3, $4, $5) returning *', [updatedUser.user_id, req.headers['user-agent'], refreshToken, accessToken, req.session.sessionId]);
        if (refreshTokenResult.refresh_token_id) {
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            });
            return res.status(200).json({ message: "Password updated successfully", success: true });
        } else {
            return res.status(500).json({ message: "Internal server error while creating refresh token" });
        }
    } catch (error) {
        handleError("updatePassword", res, error);
    }
};

/* 
-- Table for refresh tokens
CREATE TABLE refresh_tokens(
    sr_no SERIAL PRIMARY KEY,
    refresh_token_id uuid not null unique default gen_random_uuid(),
    user_id UUID REFERENCES auth_users(user_id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    access_token TEXT UNIQUE NOT NULL,
    user_agent TEXT NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at timestamp,
    session_id uuid
);
 */
// Assuming you are still using the same pgquery
export const getUserSessions = async (req, res) => {
    try {
        const { user_id } = req.user;
        const result = await pgquery('SELECT * FROM refresh_tokens WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
        if (!result) {
            return res.status(404).json({ message: "No sessions found" });
        }
        return res.status(200).json({ result });
    } catch (error) {
        handleError("getUserSessions", res, error);
    }
};