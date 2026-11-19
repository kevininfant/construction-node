const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const complaintsController = require('../controllers/complaint.controller');

router.post('/createcomplaints', upload.single('image_proof'), complaintsController.UserComplaintsCreate);
router.post('/complaintslist', authMiddleware, complaintsController.listComplaint);
router.post('/dashboardstats', authMiddleware, complaintsController.dashboardStats);
router.post('/complaintDetails', authMiddleware, complaintsController.complaintDetails);
router.post('/complaintstatuschange', authMiddleware, complaintsController.statusChange);
router.post('/updatecomplaint', authMiddleware, complaintsController.updateComplaint);
router.post('/deletecomplaint', authMiddleware, complaintsController.deleteComplaint);
router.post('/complainttracking', complaintsController.complaintTracking);
router.post('/complainthistory', complaintsController.complaintHistory);
router.post('/assigncomplaint', authMiddleware, complaintsController.AssignComplaints);
router.post('/exportcomplaints', authMiddleware, complaintsController.exportComplaints);

module.exports = router;
