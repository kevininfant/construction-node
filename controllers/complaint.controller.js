const Sequelize = require('sequelize');
const UserComplaints = require("../models/complaint.model.js");
const Complaintsstatus = require("../models/complaintstatus.model.js");
const Status = require("../models/status.model.js");
const httpstatus = require("../utils/httpstatus");
require("dotenv").config();
// create-complaints
exports.UserComplaintsCreate = async (req, res) => {
    const defaultStatus = "process";
    console.log("req.body",req.body);
    try {
      const {
        name,
        email,
        mobile,
        address,
        user_type,
        complaint_type,
        complaintDetails,
      } = req.body;
  
      const newComplaint = await UserComplaints.create({
        name,
        email,
        mobile,
        address,
        user_type,
        complaint_type,
        complaintDetails,
      });
  
      if (!newComplaint) {
        let errorResponse = httpstatus.errorResponse({
          error_code: 1,
          message: "Failed to create complaint",
        });
  
        return res.status(500).send(errorResponse);
      }
  
      const complaint_id = newComplaint.complaint_id;
  
      // Fetch the status_id for the default status
      const status = await Status.findOne({
        where: { status_name: defaultStatus },
        raw: true,
      });
  
      // Check if status is defined and has status_id
      if (!status || !status.status_id) {
        throw new Error("Failed to fetch status");
      }
      try {
        const newStatus = await Complaintsstatus.create({
          complaint_id,
          status_id: status.status_id,
          is_active: 1,
        });
  
        // Check if newStatus is defined
        if (!newStatus) {
          throw new Error("Failed to create complaint status");
        }
  
        let successResponse = httpstatus.successResponse({
          error_code: 0,
          message: "Complaint created successfully",
        });
  
        return res.status(201).send(successResponse);
      } catch (error) {
        console.error(error);
        let errorResponse = httpstatus.errorResponse({
          error_code: 1,
          message: "Failed to create complaint status",
        });
  
        return res.status(500).send(errorResponse);
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  };
  
  

// List-complaints
exports.listComplaint = async (req, res) => {
  try {
    const { user_type } = req.body;

    if (user_type === "superadmin" || user_type === "subadmin") {
      const complaintList = await UserComplaints.findAll({
        where: {
          is_active: 1,
        },
        raw: true,
      });

      const complaintArr = [];

      for (const complaintData of complaintList) {
        const complaintstatus = await Complaintsstatus.findOne({
          where: {
            complaint_id: complaintData.complaint_id,
            is_active: 1,
          },
          raw: true,
        });
console.log("complaintstatus",complaintstatus);
        const statusType = await Status.findOne({
          where: {
            status_id: complaintstatus.status_id,
            is_active: 1,
          },
          raw: true,
        });

        complaintArr.push({
          complaint_id: complaintData.complaint_id,
          name: complaintData.name,
          email: complaintData.email,
          mobile: complaintData.mobile,
          address: complaintData.address,
          user_type: complaintData.user_type,
          complent_type: complaintData.complent_type,
          complentDetails: complaintData.complentDetails,
          status_id: complaintstatus.status_id,
          status_type: statusType.status_name,
          is_active: complaintData.is_active,
        });
      }

      let successResponse = httpstatus.successResponse({
        error_code: 0,
        complaintList: complaintArr,
        message: "ComplaintList fetch successfully",
      });

      return res.status(200).send(successResponse);
    } else {
      let errorResponse = httpstatus.errorResponse({
        error_code: 1,
        message: "Sorry, you are not an authorized person.",
      });

      return res.status(403).send(errorResponse);
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
