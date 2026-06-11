// const shortid = require("shortid");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { setUser, getUser } = require("../services/auth");
const nodemailer = require("nodemailer");

// USER SIGNUP
async function handleUserSignUp(req, res) {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists! Please Login.",
      });
    }

    const securePassword = await bcrypt.hash(password, 10);

    user = await User.create({
      name,
      email,
      password: securePassword,
    });
    return res
      .status(201)
      .json({ success: true, message: "Signup Successful" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  //   return res.redirect("/");
}
// USER LOGIN
async function handleUserLogin(req, res) {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Please SignUp!" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Wrong Password!" });
    }

    const token = setUser(user);
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      })
      .status(200)
      .json({
        success: true,
        message: "Login Successful!",
      });
    // return res.redirect("/");
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
// USER LOGOUT
async function handleUserLogOut(req, res) {
  try {
    res.clearCookie("token").json({
      success: true,
      message: "Logged Out!",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
// GET USER
async function handleGetUser(req, res) {
  const reqId = req.id;

  try {
    let user = await User.findById(reqId).select("-password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
      message: "User found",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
// RESET PASSWORD ROUTE
async function handleResetPassword(req, res) {
  const { email } = req.body;

  try {
    const generateOtp = Math.floor(1000 + Math.random() * 9000); // Generate a 4 digit OTP

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Please Signup",
      });
    }

    var transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: "i.am.safaltripathi@gmail.com",
      to: email,
      subject: "OTP for Password Reset!",
      html: `<h3>Your Generated Otp is : <i>${generateOtp}</i></h3>`,
    });
    if (info.messageId) {
      await User.findOneAndUpdate(
        { email },
        {
          $set: {
            otp: generateOtp,
          },
        }
      );

      return res.status(200).json({
        success: true,
        message: `OTP sent on mail ${email}`,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
// VERIFY OTP ROUTE
async function handleVerifyOtp(req, res) {
  const { otp, newPassword } = req.body;

  try {
    const securePassword = await bcrypt.hash(newPassword, 10);

    let user = await User.findOneAndUpdate(
      { otp },
      {
        $set: {
          password: securePassword,
          otp: 0,
        },
      }
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Otp",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password Updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  handleUserSignUp,
  handleUserLogin,
  handleUserLogOut,
  handleGetUser,
  handleResetPassword,
  handleVerifyOtp,
};
