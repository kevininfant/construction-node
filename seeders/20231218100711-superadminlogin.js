'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
    user_id :"007e4cf8-52ed-4b8e-8599-55e7412a725e",
    name: "RIO",
    user_type: "superadmin",
    email: "rio@gmail.com",
    password: "$2b$08$BrPs6vL/HvCFczv7Xu.jfOPCVOZIeg8Y.G5A1BCNLr0XiZ0.1P3N2",
    createdAt: new Date(),
    updatedAt: new Date(),
      },
      // Add more seed data as needed
    ], {});
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
