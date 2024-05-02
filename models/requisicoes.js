'use strict';
const { DataTypes } = require('sequelize');
const db = require('../database/index');
const User = require('./user'); // Importe o modelo do usuário
const Produto = require('./produto');

const Requisicao = db.sequelize.define('Requisicoes', {
  tipo: {
    type: DataTypes.ENUM('Reserva', 'Compra'),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pendente'
  },
  pin: {
    type: DataTypes.STRING,
    allowNull: true
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_produto: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {});

Requisicao.belongsTo(User, { foreignKey: 'usuarioId' }); // Definindo a relação com a tabela de User
Requisicao.belongsTo(Produto, { foreignKey: 'id_produto' }); // Definindo a relação com a tabela de Produto

module.exports = Requisicao;
