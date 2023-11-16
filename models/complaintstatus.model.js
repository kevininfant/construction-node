const {Sequelize,DataTypes} = require('sequelize');
const sequelize = require('../config/sequelize');
const  ComplaintStatus = sequelize.define('complaintsstatus',{
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  complaint_id: {
    type: Sequelize.DataTypes.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
  },
  status_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
      is_active: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:1
      },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
  },
    });
module.exports = ComplaintStatus;
