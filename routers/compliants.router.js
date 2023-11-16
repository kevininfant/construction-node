const express = require('express');
const router = express.Router();
 const authMiddleware =require('../middleware/auth');
const authController = require('../controllers/auth.controller');
const complaintsController = require('../controllers/complaint.controller');

// auth
router.post('/createcomplaints',complaintsController.UserComplaintsCreate);
router.post('/complaintslist',complaintsController.listComplaint);
router.post('/userlist',authMiddleware,authController.listUser);


module.exports = router; 
