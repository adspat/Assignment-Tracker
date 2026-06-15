import {Router} from 'express'
import * as authController from '../controllers/auth.controller.js'
import userAuth from '../middlewares/userAuth.js';
const authRouter = Router();

// authRouter.post('/register',authController.register);
authRouter.post('/login',authController.login);
authRouter.post('/logout',authController.logout);
// authRouter.post('/send-verify-otp',userAuth,authController.sendVerifyOtp);
// authRouter.post('/verify-account',userAuth,authController.verifyEmail);
authRouter.post('/send-reset-otp',authController.sendResetPassOtp);
authRouter.post('/reset-password',authController.resetPassword);
export default authRouter ;
