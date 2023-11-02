const { Op } = require('sequelize');
const userData = require('../models/user.model.js');
const UserComplents = require('../models/complant.model.js');
const httpstatus = require("../utilities/httpstatus");
require("dotenv").config();
// create-complaints 
exports.UserComplentsCreate = async (req, res) => {
    try {
        const {
            name,
            email,
            mobile,
            address,
            user_type,
            complent_type,
            complentDetails,
        } = req.body;

        const newComplaints = await UserComplents.create({
            name,
            email,
            mobile,
            address,
            user_type,
            complent_type,
            complentDetails,
        });

        if (newComplaints) {
            let successResponse = httpstatus.successResponse({
                error_code: 0,
                message: 'Complaint created successfully',
            });

            return res.status(201).send(successResponse);
        } else {
            let errorResponse = httpstatus.errorResponse({
                error_code: 1,
                message: 'Failed to create complaint',
            });

            return res.status(500).send(errorResponse);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}

// List-complaints
exports.listComplaint = async(req,res) =>{
    try {
        const {user_type} = req.body;
        if (user_type == "superadmin" || user_type == "subadmin") {
            var complaintList = await UserComplents.findAll({
                where :{
                    is_active : 1
                }
            })
            let successResponse = httpstatus.successResponse({
                error_code: 0,
                complaintList :complaintList,
                message: 'ComplaintList fetch successfully',
            });
    
            return res.status(201).send(successResponse);
        } else {
            let errorResponse = httpstatus.errorResponse({
                error_code: 1,
                message: 'Sorry you have not Authorized persion',
            });
            return res.status(201).send(errorResponse);
        } 
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
