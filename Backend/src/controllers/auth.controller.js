import userModel from "../model/user.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import transporter from "../config/nodemailer.js";
import bcrypt from 'bcrypt'

// export async function register(req, res) {
//   const { username, email, password } = req.body;
//   if (!username || !email || !password) {
//     return res.status(400).json({
//       success: false,
//       message: "missing details",
//     });
//   }
//   try {
//     const isAlreadyRegister = await userModel.findOne({
//       $or: [{ username }, { email }],
//     });
//     if (isAlreadyRegister) {
//       return res.status(409).json({
//         message: "username or email already exists",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await userModel.create({
//       username,
//       email,
//       password: hashedPassword,
//       role: 'faculty',
//     });

//     const token = jwt.sign(
//       {
//         id: user._id,
//       },
//       config.JWT_SECRET,
//       {
//         expiresIn: "7d",
//       },
//     );

//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     });

//     // Mail Options
//     const otp = String(Math.floor(100000 + Math.random() * 900000));
//     user.verifyOtp = otp;
//     user.verifyOtpExpireAt = Date.now() + 15 * 60 * 1000;

//     await user.save();

//     const mailOptions = {
//       from: config.SENDER_EMAIL,
//       to: email,
//       subject: "WELCOME",
//       html: `<h1>Hi ${user.username}, Thank you for registering</h1>
//             <h2>Your Verification OTP is ${otp}</h2>`,
//     };
//     try {
//       await transporter.sendMail(mailOptions);
//     } catch (error) {
//       console.log("Email error",error);
//     }
    

//     res.status(201).json({
//       message: "User registered successfully",
//       success: true,
//       user: {
//         username: user.username,
//         email: user.email,
//       }
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       message: "there is an error in register",
//     });
//   }
// }

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success : false ,
        message: "Invalid email or password",
      });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success : false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      config.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    user.isLoggedIn = true;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      role: user.role || 'faculty',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "there is an error in login",
    });
  }
}

export async function logout(req, res) {
  try {
    const { token } = req.cookies;
    if (token) {
      try {
        const decodedToken = jwt.verify(token, config.JWT_SECRET);
        if (decodedToken && decodedToken.id) {
          await userModel.findByIdAndUpdate(decodedToken.id, { isLoggedIn: false });
        }
      } catch (err) {
        // Ignore token verification errors (e.g., expired token) during logout
        console.log("Token verification failed during logout:", err.message);
      }
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.status(200).json({
      success : true,
      message: "Logout Successfull",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success : false ,
      message: "there is an error in logout",
    });
  }
}

// export async function sendVerifyOtp(req, res) {
//   try {
//     const userId = req.userId;
//     // console.log(userId);
//     const user = await userModel.findById(userId);
//     // console.log(user);
//     if (!user) {
//       return res.status(400).json({
//         success: false,
//       });
//     }
//     if (user.isAccountVerified) {
//       return res.status(200).json({
//         success: false,
//         message: "account is already verified",
//       });
//     }

//     const otp = String(Math.floor(100000 + Math.random() * 900000));

//     user.verifyOtp = otp;
//     user.verifyOtpExpireAt = Date.now() + 15 * 60 * 1000;

//     await user.save();
//     const mailOptions = {
//       from: "pateladarsh200600@gmail.com",
//       to: user.email,
//       subject: "Account verification OTP",
//       html: `<h1>Your verification OTP is ${otp} </h1>`,
//     };
//     await transporter.sendMail(mailOptions);

//     return res.status(200).json({
//       success: true,
//       message: "Otp send Successfully",
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//     });
//   }
// }

// export async function verifyEmail(req, res) {
//   const { otp } = req.body;
//   const userId = req.userId;
//   if (!userId || !otp) {
//     return res.status(400).json({
//       success: false,
//       message: "details missing",
//     });
//   }
//   try {
//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "user not found",
//       });
//     }
//     if (user.verifyOtp === "" || user.verifyOtp !== otp) {
//       return res.status(400).json({
//         success: false,
//         message: "invalid Otp",
//       });
//     }
//     if (user.verifyOtpExpireAt < Date.now()) {
//       return res.status(400).json({
//         success: false,
//         message: "Otp is expired",
//       });
//     }
//     user.isAccountVerified = true;
//     user.verifyOtp = "";
//     user.verifyOtpExpireAt = 0;

//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: "Email verified successfully",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: "there is an error in verifying the otp",
//     });
//   }
// }


export async function sendResetPassOtp(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "email is not provided",
    });
  }
  try {
    const user = await userModel.findOne({email});
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user with this email is not found",
      });
    }
      const passResetOtp = String(Math.floor(100000 + Math.random() * 900000));

      user.resetOtp = passResetOtp;
      user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

      await user.save();
      const mailOptions = {
        from: `${config.SENDER_EMAIL}`,
        to: user.email,
        subject: "Password Reset OTP",
        html: `<h1>Your Password Reset OTP is ${passResetOtp} </h1>`,
      };
      await transporter.sendMail(mailOptions);

      res.status(200).json({
        success : true ,
        message : "PassWord reset opt is sent successfully"
      })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success : false ,
      message : "there is an error in sending password reset otp"
    })
  }
}

export async function resetPassword(req,res){
  const{email,resetOtp,newPassword} = req.body ;
  if(!email || !resetOtp || !newPassword){
    return res.status(400).json({
      success : false ,
      message : "details is missing"
    })
  }
  try {
    const user = await userModel.findOne({email});
    if(!user){
      return res.status(400).json({
        success : false ,
        message : "user is not found"
      })
    }
    if(resetOtp === '' || resetOtp !== user.resetOtp ){
      return res.status(400).json({
        success : false ,
        message : "invalid Otp"
      })
    }
    if(user.resetOtpExpireAt < Date.now()){
      return res.status(400).json({
        success : false ,
        message : "Otp is expired"
      })
    }
    const hashedResetPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedResetPassword ;
    user.resetOtp = ''
    user.resetOtpExpireAt = 0
    await user.save()
    res.status(200).json({
      success : true,
      message : "password reset successfull"
    })
  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "there is an error while reset the password"
    })
  }
}
