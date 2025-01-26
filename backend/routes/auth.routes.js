import express from 'express';
import * as authControllers from '../controllers/auth.controllers.js';
import { basicAuth } from '../middleware/basicAuth.js';

const router = express.Router();

router.get('/authenticate', authControllers.authenticateUser);
router.get('/mfa', basicAuth, authControllers.getMFAData);
router.get('/data', basicAuth, authControllers.getData);

router.get('/email/verify', authControllers.verifyEmail);
router.get('/email/revoke', basicAuth, authControllers.revokeEmailVerificationToken);
router.get('/email/send', authControllers.sendEmailVerificationLink);

router.post('/register', authControllers.registerUser);
router.post('/login', authControllers.loginUser);
router.post('/logout', basicAuth, authControllers.logoutUser);

router.put('/mfa', basicAuth, authControllers.updateUserMFA);

// Magic link routes
router.post('/magic-link', authControllers.generateMagicLink);
router.get('/magic-login', authControllers.verifyMagicLink);

// Password Reset routes
router.post('/password/reset/link', authControllers.generatePasswordResetLink);
router.get('/password/reset/verify', authControllers.verifyPasswordResetLink);
router.post('/password/reset/update', authControllers.updatePassword);

export default router;