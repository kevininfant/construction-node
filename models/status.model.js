const {Sequelize,DataTypes} = require('sequelize');
const sequelize = require('../config/sequelize');
const  Status = sequelize.define('status',{
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  status_id: {
    type: Sequelize.DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  status_name: {
    type: Sequelize.STRING,
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
module.exports = Status;