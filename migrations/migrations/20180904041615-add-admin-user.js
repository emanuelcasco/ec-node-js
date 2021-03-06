'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'isAdmin', {
      allowNull: false,
      defaultValue: false,
      type: Sequelize.BOOLEAN
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('users', 'isAdmin');
  }
};
