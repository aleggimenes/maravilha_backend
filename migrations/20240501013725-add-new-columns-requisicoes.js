'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Requisicoes', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Pendente' // Valor padrão para o status
    });

    await queryInterface.addColumn('Requisicoes', 'pin', {
      type: Sequelize.STRING,
      allowNull: true // Permitir nulos, pois o PIN só será gerado em algumas circunstâncias
    });

    await queryInterface.addColumn('Requisicoes', 'quantidade', {
      type: Sequelize.INTEGER,
      allowNull: true // Permitir nulos, dependendo do tipo de requisição
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Requisicoes', 'status');
    await queryInterface.removeColumn('Requisicoes', 'pin');
    await queryInterface.removeColumn('Requisicoes', 'quantidade');
  }
};
