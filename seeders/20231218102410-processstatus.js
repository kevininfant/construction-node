'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.bulkInsert('Statuses',[
    {
    status_id: "3242f230-83e0-46ea-9fe5-31f349718dc7",
    status_name: "Process",
    is_active: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
    },
    {
    status_id: "658a1081-1cf1-42c2-b445-3688869d2532",
    status_name: "Pending",
    is_active: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
    },
    {
      status_id: "ee179527-1bed-4993-9ca1-196d660b9452",
      status_name: "Closed",
      is_active: "1",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
   ])
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Statuses', null, {});
  }
};
