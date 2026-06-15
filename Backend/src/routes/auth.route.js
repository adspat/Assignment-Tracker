import {Router} from 'express';
import * as authController from '../controllers/auth.controller.js';
import userAuth from '../middlewares/userAuth.js';
import rateLimit from 'express-rate-limit';

const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, 
  message: { success: false, message: 'Too many request, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { success: false, message: 'Too many OTP request, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// authRouter.post('/register', authLimiter, authController.register);
authRouter.post('/login', authLimiter, authController.login);
authRouter.post('/logout', authController.logout);
// authRouter.post('/send-verify-otp', userAuth, otpLimiter, authController.sendVerifyOtp);
// authRouter.post('/verify-account', userAuth, authController.verifyEmail);
authRouter.post('/send-reset-otp', otpLimiter, authController.sendResetPassOtp);
authRouter.post('/reset-password', authController.resetPassword);

export default authRouter;
