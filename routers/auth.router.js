const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

router.post('/createuser', authController.createUser);
router.post('/login', authController.login);
router.post('/refreshtoken', authController.refreshToken);
router.post('/changepassword', authMiddleware, authController.changePassword);
router.post('/userlist', authMiddleware, authController.listUser);

module.exports = router;
