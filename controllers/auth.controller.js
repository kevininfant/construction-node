const { Op } = require('sequelize');
const userData = require('../models/user.model.js');

exports.createUser = async (req, res) => {
  try {
    const { name, user_type, email, password } = req.body;

    const existingUser = await userData.findOne({
      where: { email: email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    } else {
      const newUser = await userData.create({
        name: name,
        user_type: user_type,
        email: email,
        password: password,
      });

      return res.status(201).json({ message: 'User created successfully', user: newUser });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
