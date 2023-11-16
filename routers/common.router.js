const express = require('express');
const router = express.Router();
const authMiddleware =require('../middleware/auth');
const commonController = require('../controllers/common.controller');

// common
router.post('/createstatus',authMiddleware,commonController.createStatus);

module.exports = router; 
