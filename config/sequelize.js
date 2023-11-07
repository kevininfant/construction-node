const {Sequelize} = require('sequelize');
const config = require('./config');
const env = 'development';
const sequelize = new Sequelize(config[env]);
module.exports = sequelize;