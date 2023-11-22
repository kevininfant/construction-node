const { Op } = require('sequelize');
const userData = require('../models/user.model.js');
const sequelize = require('../config/sequelize');
const httpstatus = require("../utils/httpstatus");
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;

// create-admin
exports.createUser = async (req, res) => {
  try {
    const { name, user_type, email, password } = req.body;
    console.log("req.body",req.body);
    const existingUser = await userData.findOne({
  where: { email: email }
});
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await userData.create({
        name: name,
        user_type: user_type,
        email: email,
        password: hashedPassword,
      });
      let successResponse = httpstatus.successResponse({
        error_code: 0,
        message: 'User created successfully',
      })
     
      return  res.send(successResponse);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.login = async (req,res) =>{
  try {
    const {  email, password } = req.body;
    console.log("req.body",req.body);
    const user = await userData.findOne({
  where: { email: email },
  raw :true
}); 
if (!user) {
  return res.status(401).json({ message: 'Authentication failed: User not found' });
}
const passwordMatch = await bcrypt.compare(password, user.password);

if (!passwordMatch) {
  return res.status(401).json({ message: 'Authentication failed: Invalid password' });
}
const token = jwt.sign({ userId: user.id },secretKey, {
  expiresIn: '1h', // Set the token expiration time as needed
});
return res.status(201).json({message: 'User created successfully', token: token ,userDetails : user})
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

// list- admins
exports.listUser = async (req, res) => {
  try {
    const{ user_type }= req.body;
    if (user_type == "superadmin") {
      console.log("user_type",user_type)
      const userList = await userData.findAll({});
      return res.status(201).json({ message: 'User created successfully', userlist: userList });
    } else {
      return res.status(201).json({ message: 'Sorry you have not Authorized persion' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

