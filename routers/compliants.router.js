const express = require('express');
const router = express.Router();
 const authMiddleware =require('../middleware/auth');
const authController = require('../controllers/auth.controller');
const complaintsController = require('../controllers/complaint.controller');

// auth
router.post('/createcomplaints',complaintsController.UserComplaintsCreate);
router.post('/complaintslist',authMiddleware,complaintsController.listComplaint);
router.post('/complaintDetails',authMiddleware,complaintsController.complaintDetails);
router.post('/complaintstatuschange',authMiddleware,complaintsController.statusChange);
router.post('/complainttracking',complaintsController.complaintTracking);



module.exports = router; 
