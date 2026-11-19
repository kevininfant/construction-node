const { Op } = require('sequelize');
const { User } = require("../models/index");
const sequelize = require('../config/sequelize');
const httpstatus = require("../utils/httpstatus");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;
const refreshSecret = process.env.REFRESH_SECRET || 'refresh_secret_construction_2024';
// create-admin
exports.createUser = async (req, res) => {
  try {
    const { login_type, name, user_type, email, password } = req.body;
    console.log("req.body", req.body);
    if (login_type == "superadmin") {
      const existingUser = await User.findOne({
        where: { email: email }
      });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
          name: name,
          user_type: user_type,
          email: email,
          password: hashedPassword,
        });
        let successResponse = httpstatus.successResponse({
          error_code: 0,
          message: 'User created successfully',
        })
        return res.send(successResponse);
      }
    } else {
      return res.status(201).json({ message: 'Sorry you have not Authorized persion' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("req.body", req.body);
    const user = await User.findOne({
      where: { email: email }
    });
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed: User not found' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Authentication failed: Invalid password' });
    }
    console.log('user.account_verified :60', user.account_verified);
    if (user.account_verified == 0) {
      console.log('user.account_verified :60', user.account_verified);
      // transporter.sendMail(mailOptions, (error, info) => {
      //   if (error) {
      //     console.log('Error occurred while sending email:', error);
      //     return res.status(401).json({ message: 'Error occurred while sending email' });
      //   } else {
      //     console.log('Email sent successfully:', info.response);
      //   }
      // });

    }
    const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '8h' });
    const refreshToken = jwt.sign({ userId: user.id }, refreshSecret, { expiresIn: '7d' });
    let successResponse = httpstatus.successResponse({
      message: 'User Login successfully',
      token,
      refreshToken,
      userDetails: { id: user.id, name: user.name, email: user.email, user_type: user.user_type },
    });
    return res.status(200).send(successResponse);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

// refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });
    const decoded = jwt.verify(refreshToken, refreshSecret);
    const user = await User.findOne({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ message: 'User not found' });
    const newToken = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '8h' });
    return res.status(200).send(httpstatus.successResponse({ token: newToken, message: 'Token refreshed' }));
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// change password
exports.changePassword = async (req, res) => {
  try {
    const { user_id, current_password, new_password } = req.body;
    const user = await User.findOne({ where: { id: user_id } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const match = await bcrypt.compare(current_password, user.password);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect' });
    const hashed = await bcrypt.hash(new_password, 10);
    await User.update({ password: hashed }, { where: { id: user_id } });
    return res.status(200).send(httpstatus.successResponse({ error_code: 0, message: 'Password changed successfully' }));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// list- admins
exports.listUser = async (req, res) => {
  try {
    const { user_type } = req.body;
    if (user_type == "superadmin") {
      console.log("user_type", user_type)
      const userList = await User.findAll({});
      return res.status(201).json({ message: 'User list fetch successfully', userlist: userList });
    } else {
      return res.status(201).json({ message: 'Sorry you have not Authorized persion' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

// const transporter = nodemailer.createTransport({
//   service: 'yahoo',
//   host: 'smtp.your_email_provider.com', 
//   port: 587, 
//   secure: false, 
//   auth: {
//       user: 'kevininfant1997@yahoo.com',
//       pass: 'Elvin@7488'
//   },
//   tls: {
//     rejectUnauthorized: false, // Ignore SSL certificate validation
//   },
// });

// const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });

// const mailOptions = {
//   from: 'kevininfant1997@yahoo.com',
//   to: 'kevinelvin1997@gmail.com',
//   subject: 'Your OTP',
//   text: `Your OTP is: ${otp}`,
// };



