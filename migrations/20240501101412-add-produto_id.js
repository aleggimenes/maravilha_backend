'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Requisicoes', 'id_produto', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Produtos', // Nome da tabela de produtos
        key: 'id' // Nome da coluna que é chave primária na tabela de produtos
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Requisicoes', 'id_produto');
  }
};
