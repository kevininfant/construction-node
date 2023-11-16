const { Op } = require('sequelize');
const Status = require('../models/status.model.js');
const httpstatus = require("../utils/httpstatus.js");

exports.createStatus = async (req, res) => {
    try {
        const { status_name } = req.body;

        const statusCheck = await Status.findOne({
            where: { status_name }
        });

        if (!statusCheck) {
            const newStatus = await Status.create({
                status_name,
                is_active : 1
            });

            let successResponse = httpstatus.successResponse({
                error_code: 0,
                message: 'Status created successfully',
                data: newStatus // Include the created status in the response
            });

            return res.status(201).send(successResponse);
        } else {
            let errorResponse = httpstatus.errorResponse({
                error_code: 1,
                message: 'Status with this name already exists',
                field: 'status_name' // Include the field causing the error
            });

            return res.status(422).send(errorResponse);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
