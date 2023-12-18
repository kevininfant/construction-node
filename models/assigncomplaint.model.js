const {Sequelize,DataTypes} = require('sequelize');
const sequelize = require('../config/sequelize');
const  AssignComplaints = sequelize.define('AssignComplaints',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      complaint_id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
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
module.exports = AssignComplaints;