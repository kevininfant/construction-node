const {Sequelize,DataTypes} = require('sequelize');
const sequelize = require('../config/sequelize');
const  ComplaintStatus = sequelize.define('complentsstatus',{
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  complaint_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  complaint_status: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  status_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  is_active: {
    type: Sequelize.STRING,
    allowNull: false,
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