const express = require('express');
const router = express.Router();
 const authMiddleware =require('../middleware/auth');
const authController = require('../controllers/auth.controller');

// auth
router.post('/createuser',authMiddleware,authController.createUser);
router.post('/userlist',authMiddleware,authController.listUser);


module.exports = router;