'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('usercomplents', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mobile:{
        type: Sequelize.STRING,
        allowNull: false,
      },
      address:{
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      complent_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      complentDetails: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      image_proof:{
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
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('usercomplents');
  }
};

