const express = require('express');
const router = express.Router();
// const authMiddleware =require('../middleware');
const authController = require('../controllers/auth.controller');

// auth
router.post('/createuser', authController.createUser);

module.exports = router;