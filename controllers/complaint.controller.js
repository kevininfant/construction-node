const Sequelize = require('sequelize');
const {User,AssignComplaints,UserComplaint,Status,ComplaintStatus} = require("../models/index");
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
  
      const newComplaint = await UserComplaint.create({
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
        const newStatus = await ComplaintStatus.create({
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
          trackingId : complaint_id
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
    const { user_type,user_id } = req.body;
    if (user_type === "superadmin" || user_type === "subadmin") {
      let complaintList;
      if (user_type === "subadmin") {
        const complaintAssign = await AssignComplaints.findAll({
          where: {
            user_id: user_id,
            is_active: 1,
          },
          raw: true,
        });
        const complaintIds = complaintAssign.map(assign => assign.complaint_id);
        complaintList = await UserComplaint.findAll({
          where: {
            complaint_id: complaintIds,
            is_active: 1,
          },
          raw: true,
        });
      } else {
        complaintList = await UserComplaint.findAll({
          where: {
            is_active: 1,
          },
          raw: true,
        });
      }

      const complaintArr = [];
      for (const complaintData of complaintList) {
        try {
          let complaintstatus = await ComplaintStatus.findOne({
            where: {
              complaint_id: complaintData.complaint_id,
              is_active: 1,
            },
            raw: true,
          });

          if (!complaintstatus) {
            throw new Error("Complaint status not found");
          }

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
        } catch (error) {
          console.error("Error fetching complaint status:", error.message);
        }
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


// assign-complaint
exports.AssignComplaints = async (req, res) => {
  try {
    const { complaint_id, user_id, user_type } = req.body;

    if (user_type === "superadmin") {
      // Check if the complaint is already assigned
      const existingAssignment = await AssignComplaints.findOne({
        where: {
          complaint_id: complaint_id,
          user_id: user_id,
        },
        raw: true,
      });

      if (existingAssignment) {
        const errorResponse = {
          error_code: 1,
          message: "Complaint is already assigned to the user.",
        };
        return res.status(400).json(errorResponse);
      }

      // If not assigned, create a new assignment
      const complaintsAssignStatus = await AssignComplaints.create({
        complaint_id: complaint_id,
        user_id: user_id,
      });

      if (complaintsAssignStatus) {
        const successResponse = {
          error_code: 0,
          message: "Complaint assigned successfully",
          data: complaintsAssignStatus, // Optionally, you can send the created record back to the client.
        };
        return res.status(200).json(successResponse);
      } else {
        const errorResponse = {
          error_code: 1,
          message: "Failed to assign complaint. There was an issue with the assignment.",
        };
        return res.status(403).json(errorResponse);
      }
    } else {
      const errorResponse = {
        error_code: 1,
        message: "Sorry, you are not an authorized person.",
      };
      return res.status(403).json(errorResponse);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error_code: 1, message: "Internal Server Error", error: error.message });
  }
};




// Complaint-Details

exports.complaintDetails = async (req, res) => {
  try {
    const { complaint_id, user_type } = req.body;

    if (user_type === "superadmin" || user_type === "subadmin") {
      const complaintDetail = await UserComplaint.findOne({
        where: {
          complaint_id,
          is_active: 1,
        },
        raw: true,
      });

      if (!complaintDetail) {
        // Handle case when complaint is not found
        let errorResponse = httpstatus.errorResponse({
          error_code: 1,
          message: "Complaint not found",
        });

        return res.status(404).send(errorResponse);
      }

      const complaintstatus = await ComplaintStatus.findOne({
        where: {
          complaint_id: complaintDetail.complaint_id,
          is_active: 1,
        },
        raw: true,
      });

      if (!complaintstatus) {
        // Handle case when complaint status is not found
        let errorResponse = httpstatus.errorResponse({
          error_code: 1,
          message: "Complaint status not found",
        });

        return res.status(404).send(errorResponse);
      }

      const statusType = await Status.findOne({
        where: {
          status_id: complaintstatus.status_id,
          is_active: 1,
        },
        raw: true,
      });

      const complaintObj = {
        complaint_id: complaintDetail.complaint_id,
        name: complaintDetail.name,
        email: complaintDetail.email,
        mobile: complaintDetail.mobile,
        address: complaintDetail.address,
        user_type: complaintDetail.user_type,
        complent_type: complaintDetail.complent_type,
        complentDetails: complaintDetail.complentDetails,
        status_id: complaintstatus.status_id,
        status_type: statusType.status_name,
        is_active: complaintDetail.is_active,
      };

      let successResponse = httpstatus.successResponse({
        error_code: 0,
        complaintDetail: complaintObj,
        message: "Complaint details fetched successfully",
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

// track-complaints

exports.complaintTracking = async (req, res) => {
  try {
    const { complaint_id } = req.body;

      const complaintDetail = await UserComplaint.findOne({
        where: {
          complaint_id,
          is_active: 1,
        },
        raw: true,
      });

      if (!complaintDetail) {
        // Handle case when complaint is not found
        let errorResponse = httpstatus.errorResponse({
          error_code: 1,
          message: "Complaint not found",
        });

        return res.status(404).send(errorResponse);
      }

      const complaintstatus = await ComplaintStatus.findOne({
        where: {
          complaint_id: complaintDetail.complaint_id,
          is_active: 1,
        },
        raw: true,
      });

      if (!complaintstatus) {
        // Handle case when complaint status is not found
        let errorResponse = httpstatus.errorResponse({
          error_code: 1,
          message: "Complaint status not found",
        });

        return res.status(404).send(errorResponse);
      }

      const statusType = await Status.findOne({
        where: {
          status_id: complaintstatus.status_id,
          is_active: 1,
        },
        raw: true,
      });

      const complaintObj = {
        complaint_id: complaintDetail.complaint_id,
        name: complaintDetail.name,
        email: complaintDetail.email,
        mobile: complaintDetail.mobile,
        address: complaintDetail.address,
        user_type: complaintDetail.user_type,
        complent_type: complaintDetail.complent_type,
        complentDetails: complaintDetail.complentDetails,
        status_id: complaintstatus.status_id,
        status_type: statusType.status_name,
        is_active: complaintDetail.is_active,
      };

      let successResponse = httpstatus.successResponse({
        error_code: 0,
        complaintDetail: complaintObj,
        message: "Complaint details fetched successfully",
      });

      return res.status(200).send(successResponse);
   
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// status change
exports.statusChange = async (req, res) => {
  try {

    const { status_id, complaint_id } = req.body;
    const complaintFind = await ComplaintStatus.findOne({
      where: { complaint_id: complaint_id },
      raw: true,
    });

    if (complaintFind) {
      const statusChange = await ComplaintStatus.update(
        { status_id: status_id },
        {
          where: { complaint_id: complaint_id },
          raw: true,
        }
      );

      if (statusChange && statusChange[0] > 0) {
        // Update successful
        let successResponse = httpstatus.successResponse({
          error_code: 0,
          message: 'Status changed successfully',
        });

        return res.status(200).send(successResponse);
      } else {
        // No rows updated, possibly the complaint_id was not found
        let errorResponse = httpstatus.errorResponse({
          error_code: 1,
          message: 'Complaint not found or status unchanged',
        });

        return res.status(404).send(errorResponse);
      }
    } else {
      // Complaint not found
      let errorResponse = httpstatus.errorResponse({
        error_code: 1,
        message: 'Complaint not found',
      });

      return res.status(404).send(errorResponse);
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};
